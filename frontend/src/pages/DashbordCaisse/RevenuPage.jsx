import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getUserIdForToken } from '../../services/userService';
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
import { useSocket } from "../../socket";
import { debounce } from "lodash";
import { FaArrowLeft, FaSync, FaFileCsv, FaFilePdf, FaEye, FaUndo } from "react-icons/fa";

// Enregistrement des composants ChartJS
ChartJS.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

// Composant principal de la page des revenus
const RevenuPage = () => {
  // Déclaration des états
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
  const { token, setToken } = useStateContext();
  const navigate = useNavigate();

  // Récupération du userId pour le socket
  const [userId, setUserId] = useState(null);
  const socket = useSocket();

  // Récupérer le userId à partir du token
  useEffect(() => {
    async function fetchUserId() {
      if (!token) {
        toast.error("Veuillez vous connecter pour accéder aux revenus");
        navigate("/login");
        return;
      }
      try {
        const id = await getUserIdForToken();
        if (!id) {
          throw new Error("Impossible de récupérer l'ID utilisateur");
        }
        setUserId(id);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'userId:", error);
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        navigate("/login");
      }
    }
    fetchUserId();
  }, [token, navigate]);

  // Fonction pour rafraîchir le token
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/refresh",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newToken = response.data.access_token;
      setToken(newToken);
      // Mettre à jour l'userId après le rafraîchissement du token
      const id = await getUserIdForToken();
      if (!id) {
        throw new Error("Impossible de récupérer l'ID utilisateur après rafraîchissement");
      }
      setUserId(id);
      return newToken;
    } catch (error) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      navigate("/login");
      throw error;
    }
  }, [token, setToken, navigate]);

  // Fonction pour récupérer les données des revenus
  const fetchRevenus = useCallback(async () => {
    if (!token) {
      toast.error("Veuillez vous connecter pour accéder aux revenus");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
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

      if (!Array.isArray(data) || data.length === 0) {
        toast.warn("Aucune commande trouvée pour cet événement");
        setRevenus([]);
        return;
      }

      const formattedRevenus = data.map((order) => ({
        id: order.id || Math.random().toString(36).substr(2, 9),
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

      const total = formattedRevenus.reduce((sum, order) => sum + parseFloat(order.total), 0);
      const pending = formattedRevenus
        .filter((order) => order.paymentStatus === "Non payé")
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
      const refunded = formattedRevenus
        .filter((order) => order.paymentStatus === "Remboursé")
        .reduce((sum, order) => sum + parseFloat(order.total), 0);

      const categories = {};
      formattedRevenus.forEach((order) => {
        order.items.forEach((item) => {
          const category = item.menuItem?.category || "Autres";
          const subtotal = parseFloat(item.subtotal || 0);
          if (!isNaN(subtotal)) {
            categories[category] = (categories[category] || 0) + subtotal;
          }
        });
      });

      const timeSeries = {};
      formattedRevenus.forEach((order) => {
        if (order.orderDate) {
          const date = new Date(order.orderDate).toLocaleDateString("fr-FR");
          timeSeries[date] = (timeSeries[date] || 0) + parseFloat(order.amountPaid);
        }
      });
      const timeSeriesArray = Object.entries(timeSeries)
        .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue).toFixed(2) }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setRevenus(formattedRevenus);
      setTotalRevenue(total.toFixed(2));
      setTotalPending(pending.toFixed(2));
      setTotalRefunded(refunded.toFixed(2));
      setCategoryBreakdown(categories);
      setTimeSeriesData(timeSeriesArray);
    } catch (error) {
      console.error("Erreur lors de la récupération des revenus:", error);
      toast.error(error.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [token, refreshToken, navigate]);

  // Gestion du remboursement des commandes
  const handleRefund = useCallback(
    async (id) => {
      if (!window.confirm("Confirmer le remboursement de cette commande ?")) return;
      setIsRefunding((prev) => ({ ...prev, [id]: true }));
      try {
        const response = await axios.get(`http://localhost:3000/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const order = response.data;
        if (!order) {
          throw new Error("Commande non trouvée");
        }
        if (order.paymentStatus === "refunded") {
          throw new Error("La commande est déjà remboursée");
        }
        if (order.paymentStatus !== "paid") {
          throw new Error("La commande n'est pas payée, remboursement impossible");
        }

        await axios.patch(
          `http://localhost:3000/orders/${id}/refunded`,
          { paymentStatus: "refunded" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (socket) {
          socket.emit("orderRefunded", { id, paymentStatus: "refunded" });
          socket.emit("orderDeleted", { id });
        }
        toast.success("Commande remboursée et supprimée avec succès");
        await fetchRevenus();
      } catch (error) {
        console.error("Erreur lors du remboursement:", error);
        toast.error(error.message || "Erreur lors du remboursement");
      } finally {
        setIsRefunding((prev) => ({ ...prev, [id]: false }));
      }
    },
    [token, socket, fetchRevenus]
  );

  // Débouncer la fonction de remboursement
  const handleRefundDebounced = useMemo(() => debounce(handleRefund, 300), [handleRefund]);

  // Filtrage des revenus
  const filteredRevenus = useMemo(() => {
    return revenus
      .filter((rev) => rev.paymentStatus !== "Remboursé")
      .filter((rev) => {
        const matchSearch = rev.email.toLowerCase().includes(searchTerm.toLowerCase());
        const orderDate = rev.orderDate ? new Date(rev.orderDate) : null;
        const today = new Date();
        const matchPeriod =
          filterPeriod === "all" ||
          (orderDate &&
            ((filterPeriod === "today" && orderDate.toDateString() === today.toDateString()) ||
             (filterPeriod === "week" && orderDate >= new Date(today.setDate(today.getDate() - 7))) ||
             (filterPeriod === "month" && orderDate >= new Date(today.setMonth(today.getMonth() - 1)))));
        const matchStatus = filterStatus === "all" || rev.paymentStatus === filterStatus;
        return matchSearch && matchPeriod && matchStatus;
      });
  }, [revenus, searchTerm, filterPeriod, filterStatus]);

  // Exportation CSV
  const exportToCSV = useCallback(() => {
    const headers = ["ID", "Client", "Email", "Total (€)", "Payé (€)", "Statut", "Méthode", "Date"];
    const rows = filteredRevenus.map((rev) =>
      [rev.id, rev.nom, rev.email, rev.total, rev.amountPaid, rev.paymentStatus, rev.paymentMethod, rev.date]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenus_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exportation CSV réussie");
  }, [filteredRevenus]);

  // Exportation PDF
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
      body: Object.entries(categoryBreakdown).map(([category, revenue]) => [
        category,
        parseFloat(revenue).toFixed(2),
      ]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [107, 33, 168], textColor: [255, 255, 255] },
    });

    doc.save(`revenus_${new Date().toISOString()}.pdf`);
    toast.success("Exportation PDF réussie");
  }, [filteredRevenus, totalRevenue, totalPending, totalRefunded, categoryBreakdown]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRevenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRevenus.length / itemsPerPage);

  const paginate = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  // Données pour le graphique à barres
  const barChartData = useMemo(
    () => ({
      labels: ["Payé", "Non payé"],
      datasets: [
        {
          label: "Revenus",
          data: [parseFloat(totalRevenue) - parseFloat(totalPending), parseFloat(totalPending)],
          backgroundColor: ["#22C55E", "#EF4444"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 1,
        },
      ],
    }),
    [totalRevenue, totalPending]
  );

  // Données pour le graphique temporel
  const timeSeriesChartData = useMemo(
    () => ({
      labels: timeSeriesData.map((item) => item.date),
      datasets: [
        {
          label: "Revenus (€)",
          data: timeSeriesData.map((item) => parseFloat(item.revenue)),
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

  // Options des graphiques
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
            label: (context) => `€${parseFloat(context.raw).toFixed(2)}`,
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

  // Effet pour initialiser la récupération des données et gérer le socket
  useEffect(() => {
    if (!token || !userId) {
      if (!token) {
        navigate("/login");
      }
      return;
    }

    fetchRevenus();

    if (!socket) {
      return;
    }

    const socketCleanup = () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("orderDeleted");
      socket.off("orderRefunded");
    };

    socket.on("connect", () => toast.info("Connecté au serveur en temps réel"));
    socket.on("connect_error", () => toast.error("Erreur de connexion au serveur en temps réel"));
    socket.on("orderDeleted", fetchRevenus);
    socket.on("orderRefunded", fetchRevenus);

    return socketCleanup;
  }, [token, userId, socket, navigate, fetchRevenus]);

  // Rendu de l'interface utilisateur
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col p-4 sm:p-6"
    >
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Tableau de Bord des Revenus
          </h1>
          <Link
            to="/caisse"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </Link>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Total des Revenus", value: `€${totalRevenue}`, color: "bg-green-100" },
            { title: "En Attente", value: `€${totalPending}`, color: "bg-yellow-100" },
            { title: "Remboursé", value: `€${totalRefunded}`, color: "bg-red-100" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className={`${stat.color} rounded-2xl p-6 shadow-lg transition-all duration-300`}
            >
              <h3 className="text-sm font-semibold text-gray-600">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filtres et actions */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full sm:w-1/6 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/6 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Non payé">Non payé</option>
            <option value="Remboursé">Remboursé</option>
          </select>
          <div className="flex gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRevenus}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              aria-label="Actualiser les données"
            >
              <FaSync className="mr-2" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium"
              aria-label="Exporter en CSV"
            >
              <FaFileCsv className="mr-2" />
              Exporter CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              aria-label="Exporter en PDF"
            >
              <FaFilePdf className="mr-2" />
              Exporter PDF
            </motion.button>
          </div>
        </div>

        {/* Graphique et tableau */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {chartType === "bar" ? "Répartition des Revenus" : "Revenus par Période"}
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                className="flex items-center justify-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                aria-label="Changer le type de graphique"
              >
                {chartType === "bar" ? "Voir Temporel" : "Voir Barres"}
              </motion.button>
            </div>
            <div className="flex-1 h-64">
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
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 flex flex-col"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails des Revenus</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 text-right">Total (€)</th>
                    <th className="px-4 py-3 text-right">Payé (€)</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-3 text-center text-gray-500">
                        Aucune donnée
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((rev) => (
                      <tr key={rev.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{rev.id}</td>
                        <td className="px-4 py-3 truncate max-w-[150px]">{rev.nom}</td>
                        <td className="px-4 py-3 truncate max-w-[200px]">{rev.email}</td>
                        <td className="px-4 py-3 text-right">{rev.total}</td>
                        <td className="px-4 py-3 text-right">{rev.amountPaid}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                        <td className="px-4 py-3 truncate">{rev.date}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDetailsModal(rev)}
                            className="flex items-center justify-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                            aria-label="Voir les détails"
                          >
                            <FaEye className="mr-2" />
                            Détails
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRefundDebounced(rev.id)}
                            disabled={isRefunding[rev.id] || rev.paymentStatus !== "Payé"}
                            className={`flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium ${
                              isRefunding[rev.id] || rev.paymentStatus !== "Payé"
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            }`}
                            aria-label="Rembourser la commande"
                          >
                            <FaUndo className="mr-2" />
                            {isRefunding[rev.id] ? "En cours..." : "Rembourser"}
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                aria-label="Page précédente"
              >
                Précédent
              </motion.button>
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                aria-label="Page suivante"
              >
                Suivant
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Répartition par catégorie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Catégorie</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3 text-right">Revenu (€)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-center text-gray-500">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  Object.entries(categoryBreakdown).map(([category, revenue]) => (
                    <tr key={category} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 truncate">{category}</td>
                      <td className="px-4 py-3 text-right">{parseFloat(revenue).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal détails */}
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Détails de la Commande #{showDetailsModal.id}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Article</th>
                      <th className="px-4 py-3 text-right">Quantité</th>
                      <th className="px-4 py-3 text-right">Prix (€)</th>
                      <th className="px-4 py-3 text-right">Total (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetailsModal.items.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-3 text-center text-gray-500">
                          Aucun article
                        </td>
                      </tr>
                    ) : (
                      showDetailsModal.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 truncate">{item.menuItem?.name || "Inconnu"}</td>
                          <td className="px-4 py-3 text-right">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-right">
                            {parseFloat(item.subtotal / (item.quantity || 1)).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {parseFloat(item.subtotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(null)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
                  aria-label="Fermer le modal"
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