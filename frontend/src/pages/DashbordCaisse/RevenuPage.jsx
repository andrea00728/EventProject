import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import socket from "../../socket";
import { debounce } from "lodash";

ChartJS.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const RevenuPage = () => {
  const [revenus, setRevenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [chartType, setChartType] = useState("bar");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { token, setToken } = useStateContext();
  const navigate = useNavigate();

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/refresh",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newToken = response.data.access_token;
      setToken(newToken);
      return newToken;
    } catch (error) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
      throw error;
    }
  }, [token, setToken, navigate]);

  const fetchRevenus = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) {
        toast.error("Veuillez vous connecter pour accéder aux revenus");
        navigate("/login");
        return;
      }

      let currentToken = token;
      try {
        await axios.get("http://localhost:3000/auth/validate", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          currentToken = await refreshToken();
        }
      }

      const eventId = await getEventIdByEmail(currentToken);
      if (!eventId?.eventId) {
        throw new Error("ID d'événement non trouvé");
      }

      const { data } = await axios.get(
        `http://localhost:3000/orders/event/${eventId.eventId}`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
          params: { include: "table,items,items.menuItem" },
        }
      );

      if (!data || data.length === 0) {
        toast.warn("Aucune commande trouvée pour cet événement");
        setRevenus([]);
        return;
      }

      const formattedRevenus = data.map((order) => ({
        id: order.id,
        nom: order.nom || "Anonyme",
        email: order.email || "-",
        total: parseFloat(order.total || 0).toFixed(2),
        amountPaid: order.paymentStatus === "paid" ? parseFloat(order.total || 0).toFixed(2) : "0.00",
        paymentStatus:
          order.paymentStatus === "paid"
            ? "Payé"
            : order.paymentStatus === "refunded"
            ? "Remboursé"
            : "Non payé",
        paymentMethod: order.paymentMethod || "Inconnu",
        date: order.orderDate
          ? new Date(order.orderDate).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-",
        orderDate: order.orderDate || null,
        items: Array.isArray(order.items) ? order.items : [],
      }));

      const total = formattedRevenus.reduce(
        (sum, order) => sum + parseFloat(order.total || 0),
        0
      );
      const pending = formattedRevenus
        .filter((order) => order.paymentStatus === "Non payé")
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const refunded = formattedRevenus
        .filter((order) => order.paymentStatus === "Remboursé")
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

      const categories = {};
      formattedRevenus.forEach((order) => {
        order.items.forEach((item) => {
          const category = item.menuItem?.category || "Autres";
          const subtotal = parseFloat(item.subtotal || 0);
          const quantity = parseInt(item.quantity || 0);
          if (subtotal && quantity) {
            categories[category] = (categories[category] || 0) + subtotal;
          }
        });
      });
      const formattedCategories = Object.fromEntries(
        Object.entries(categories).map(([category, revenue]) => [
          category,
          parseFloat(revenue).toFixed(2),
        ])
      );

      const timeSeries = {};
      formattedRevenus.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate).toLocaleDateString("fr-FR");
          timeSeries[date] = (timeSeries[date] || 0) + parseFloat(order.amountPaid || 0);
        }
      });
      const timeSeriesArray = Object.entries(timeSeries)
        .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setRevenus(formattedRevenus);
      setTotalRevenue(total.toFixed(2));
      setTotalPending(pending.toFixed(2));
      setTotalRefunded(refunded.toFixed(2));
      setCategoryBreakdown(formattedCategories);
      setTimeSeriesData(timeSeriesArray);
    } catch (error) {
      console.error("Erreur lors de la récupération des revenus:", error);
      toast.error(error.response?.data?.message || "Erreur lors du chargement des données");
      if (error.response?.status === 404) {
        toast.error("Événement ou commandes non trouvés.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken, navigate]);

  const handleRefund = useCallback(
    async (id) => {
      if (!window.confirm("Confirmer le remboursement de cette commande ?")) return;
      try {
        setIsRefunding((prev) => ({ ...prev, [id]: true }));

        // Vérifier l'existence et l'état de la commande
        const { data: order } = await axios.get(`http://localhost:3000/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!order) {
          toast.error("Commande non trouvée");
          return;
        }
        if (order.paymentStatus === "refunded") {
          toast.error("La commande est déjà remboursée");
          return;
        }
        if (order.paymentStatus !== "paid") {
          toast.error("La commande n'est pas payée, remboursement impossible");
          return;
        }

        // Effectuer le remboursement
        await axios.patch(
          `http://localhost:3000/orders/${id}/refunded`,
          { paymentStatus: "refunded" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Supprimer la commande du state local
        setRevenus((prev) => prev.filter((cmd) => cmd.id !== id));
        socket.emit("orderRefunded", { id, paymentStatus: "refunded" });
        socket.emit("orderDeleted", { id });
        toast.success("Commande remboursée et supprimée avec succès");
        await fetchRevenus();
      } catch (error) {
        console.error("Erreur lors du remboursement:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: error.stack,
        });
        toast.error(error.response?.data?.message || "Erreur lors du remboursement");
      } finally {
        setIsRefunding((prev) => ({ ...prev, [id]: false }));
      }
    },
    [token, fetchRevenus]
  );

  const handleRefundDebounced = useMemo(() => debounce(handleRefund, 300), [handleRefund]);

  const filteredRevenus = useMemo(() => {
    return revenus
      .filter((rev) => rev.paymentStatus !== "Remboursé") // Exclure les commandes remboursées
      .filter((rev) => {
        const matchSearch = rev.email.toLowerCase().includes(searchTerm.toLowerCase());
        const orderDate = rev.orderDate ? new Date(rev.orderDate) : null;
        const today = new Date();
        const matchPeriod =
          filterPeriod === "all" ||
          (orderDate &&
            (filterPeriod === "today" && orderDate.toDateString() === today.toDateString()) ||
            (filterPeriod === "week" &&
              orderDate >= new Date(new Date().setDate(today.getDate() - 7))) ||
            (filterPeriod === "month" &&
              orderDate >= new Date(new Date().setMonth(today.getMonth() - 1))));
        const matchStatus = filterStatus === "all" || rev.paymentStatus === filterStatus;
        return matchSearch && matchPeriod && matchStatus;
      });
  }, [revenus, searchTerm, filterPeriod, filterStatus]);

  const exportToCSV = useCallback(() => {
    const headers = ["ID,Client,Email,Total (€),Payé (€),Statut,Méthode,Date"];
    const rows = filteredRevenus.map((rev) =>
      `${rev.id},${rev.nom},${rev.email},${rev.total},${rev.amountPaid},${rev.paymentStatus},${rev.paymentMethod},${rev.date}`
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `revenus_${new Date().toISOString()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exportation CSV réussie");
  }, [filteredRevenus]);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport des Revenus", 20, 20);
    doc.setFontSize(10);
    doc.text(`Total des revenus: €${totalRevenue}`, 20, 30);
    doc.text(`Reste à encaisser: €${totalPending}`, 20, 36);
    doc.text(`Total remboursé: €${totalRefunded}`, 20, 42);

    autoTable(doc, {
      startY: 50,
      head: [["ID", "Client", "Email", "Total (€)", "Payé (€)", "Statut", "Méthode", "Date"]],
      body: filteredRevenus.map((rev) => [
        rev.id,
        rev.nom,
        rev.email,
        rev.total,
        rev.amountPaid,
        rev.paymentStatus,
        rev.paymentMethod,
        rev.date,
      ]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Répartition par catégorie", 20, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Catégorie", "Revenu (€)"]],
      body: Object.entries(categoryBreakdown).map(([category, revenue]) => [category, revenue]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255] },
    });

    doc.save(`revenus_${new Date().toISOString()}.pdf`);
    toast.success("Exportation PDF réussie");
  }, [filteredRevenus, totalRevenue, totalPending, totalRefunded, categoryBreakdown]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRevenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRevenus.length / itemsPerPage);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  const barChartData = useMemo(
    () => ({
      labels: ["Payé", "Non payé"],
      datasets: [
        {
          label: "Revenus",
          data: [totalRevenue - totalPending, totalPending],
          backgroundColor: ["#22C55E", "#EF4444"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 1,
        },
      ],
    }),
    [totalRevenue, totalPending]
  );

  const timeSeriesChartData = useMemo(
    () => ({
      labels: timeSeriesData.map((item) => item.date),
      datasets: [
        {
          label: "Revenus (€)",
          data: timeSeriesData.map((item) => item.revenue),
          borderColor: "#6b21a8",
          backgroundColor: "rgba(107, 33, 168, 0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    }),
    [timeSeriesData]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 10 }, color: "#1F2937" },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 6,
          callbacks: {
            label: (context) => {
              const value = Number(context.raw);
              return isNaN(value) ? context.raw : `€${value.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 100,
            callback: (value) => `€${value}`,
            color: "#6B7280",
            font: { size: 10 },
          },
          grid: { color: "rgba(0, 0, 0, 0.05)" },
        },
        x: {
          ticks: { color: "#6B7280", font: { size: 10 } },
          grid: { display: false },
        },
      },
    }),
    []
  );

  useEffect(() => {
    if (token) {
      fetchRevenus();
      socket.on("connect", () => {
        setIsSocketConnected(true);
      });
      socket.on("connect_error", (error) => {
        setIsSocketConnected(false);
        toast.error("Impossible de se connecter au serveur en temps réel");
      });
      socket.on("orderDeleted", () => fetchRevenus());
      socket.on("orderRefunded", () => fetchRevenus());
      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.off("orderDeleted");
        socket.off("orderRefunded");
      };
    } else {
      navigate("/login");
    }
  }, [token, navigate, fetchRevenus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="h-screen bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1542744095-291d1f67b221')",
      }}
    >
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow-md">
            Gestion des Revenus
          </h1>
          <Link
            to="/caisse"
            className="text-indigo-600 hover:text-indigo-800 font-medium underline transition text-sm"
          >
            ← Retour
          </Link>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-700">Total</h3>
                <p className="text-xl font-bold text-gray-900">€{totalRevenue}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-700">En attente</h3>
                <p className="text-xl font-bold text-gray-900">€{totalPending}</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-md"
              >
                <h3 className="text-sm font-semibold text-gray-700">Remboursé</h3>
                <p className="text-xl font-bold text-gray-900">€{totalRefunded}</p>
              </motion.div>
            </div>
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-2/5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full sm:w-1/5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-700"
              >
                <option value="all">Toutes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Semaine</option>
                <option value="month">Mois</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-1/5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm text-gray-700"
              >
                <option value="all">Tous statuts</option>
                <option value="Payé">Payé</option>
                <option value="Non payé">Non payé</option>
                <option value="Remboursé">Remboursé</option>
              </select>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchRevenus}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Actualiser
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                CSV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                PDF
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-md flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  {chartType === "bar" ? "Répartition des revenus" : "Revenus par période"}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                  className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition"
                >
                  {chartType === "bar" ? "Graphique temporel" : "Graphique à barres"}
                </motion.button>
              </div>
              <div className="flex-1 h-32">
                {chartType === "bar" ? (
                  <Bar data={barChartData} options={chartOptions} />
                ) : (
                  <Line data={timeSeriesChartData} options={chartOptions} />
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex flex-col"
            >
              <div className="p-4 flex-1">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Détails des revenus
                </h3>
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 w-16">ID</th>
                      <th className="px-3 py-2 w-1/5 truncate">Client</th>
                      <th className="px-3 py-2 w-2/5 truncate">Email</th>
                      <th className="px-3 py-2 w-20 text-right">Total (€)</th>
                      <th className="px-3 py-2 w-20 text-right">Payé (€)</th>
                      <th className="px-3 py-2 w-24">Statut</th>
                      <th className="px-3 py-2 w-1/4 truncate">Date</th>
                      <th className="px-3 py-2 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="px-3 py-2 text-center">
                          Chargement...
                        </td>
                      </tr>
                    ) : currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-3 py-2 text-center">
                          Aucune donnée
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((rev) => (
                        <tr key={rev.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{rev.id}</td>
                          <td className="px-3 py-2 truncate" title={rev.nom}>
                            {rev.nom}
                          </td>
                          <td className="px-3 py-2 truncate" title={rev.email}>
                            {rev.email}
                          </td>
                          <td className="px-3 py-2 text-right">{rev.total}</td>
                          <td className="px-3 py-2 text-right">{rev.amountPaid}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                rev.paymentStatus === "Payé"
                                  ? "bg-green-100 text-green-800"
                                  : rev.paymentStatus === "Remboursé"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {rev.paymentStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2 truncate" title={rev.date}>
                            {rev.date}
                          </td>
                          <td className="px-3 py-2 flex gap-1">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowDetailsModal(rev)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                            >
                              Détails
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRefundDebounced(rev.id)}
                              disabled={isRefunding[rev.id] || rev.paymentStatus !== "Payé"}
                              className={`px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition ${
                                isRefunding[rev.id] || rev.paymentStatus !== "Payé"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {isRefunding[rev.id] ? "En cours..." : "Rembourser"}
                            </motion.button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="flex justify-center gap-2 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs disabled:opacity-50"
                  >
                    Précédent
                  </motion.button>
                  <span className="text-xs text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs disabled:opacity-50"
                  >
                    Suivant
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md rounded-lg shadow-md"
          >
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Répartition par catégorie
              </h3>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 w-3/4">Catégorie</th>
                    <th className="px-3 py-2 w-1/4 text-right">Revenu (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(categoryBreakdown).length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-3 py-2 text-center">
                        Aucune donnée de catégorie disponible
                      </td>
                    </tr>
                  ) : (
                    Object.entries(categoryBreakdown).map(([category, revenue]) => (
                      <tr key={category} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 truncate">{category}</td>
                        <td className="px-3 py-2 text-right">{revenue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-lg p-6 max-w-lg w-full mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Détails de la commande #{showDetailsModal.id}
              </h3>
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs uppercase bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Article</th>
                    <th className="px-3 py-2 text-right">Quantité</th>
                    <th className="px-3 py-2 text-right">Prix (€)</th>
                    <th className="px-3 py-2 text-right">Total (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {showDetailsModal.items.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-3 py-2 text-center">
                        Aucun article
                      </td>
                    </tr>
                  ) : (
                    showDetailsModal.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2 truncate">{item.menuItem?.name || "Inconnu"}</td>
                        <td className="px-3 py-2 text-right">{item.quantity || 0}</td>
                        <td className="px-3 py-2 text-right">
                          {parseFloat(item.subtotal / (item.quantity || 1)).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {parseFloat(item.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
};

export default RevenuPage;