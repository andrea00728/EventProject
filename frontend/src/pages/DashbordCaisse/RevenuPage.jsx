import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getUserIdForToken } from "../../services/userService";
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
import revenuService from "../../services/revenu";

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
  const { token, setToken } = useStateContext();
  const navigate = useNavigate();
  const socket = useSocket();

  const COLORS = {
    paid: ["rgba(34, 197, 94, 0.8)", "rgba(74, 222, 128, 0.8)"], // Green-600 to Green-400
    pending: ["rgba(234, 179, 8, 0.8)", "rgba(250, 204, 21, 0.8)"], // Yellow-600 to Yellow-400
    timeSeries: ["rgba(99, 102, 241, 0.8)", "rgba(129, 140, 248, 0.8)"], // Indigo-600 to Indigo-400
  };

  useEffect(() => {
    revenuService.setAuthToken(token);
  }, [token]);

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
      } catch (error) {
        console.error("Erreur lors de la récupération de l'userId:", error);
        toast.error("Erreur d'authentification. Veuillez vous reconnecter.");
        navigate("/login");
      }
    }
    fetchUserId();
  }, [token, navigate]);

  const fetchRevenus = useCallback(async () => {
    if (!token) {
      toast.error("Veuillez vous connecter pour accéder aux revenus");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const eventId = await getEventIdByEmail(token);
      if (!eventId?.eventId) {
        throw new Error("ID d'événement non trouvé");
      }

      const data = await revenuService.getOrdersByEvent(eventId.eventId);

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
      console.error("Erreur lors de la récupération des revenus:", error.response?.data);
      if (error.message.includes("Unauthorized")) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        navigate("/login");
      } else {
        toast.error(error.message || "Erreur lors du chargement des données");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  const handleRefund = useCallback(
    async (id) => {
      if (!window.confirm("Confirmer le remboursement de cette commande ?")) return;
      setIsRefunding((prev) => ({ ...prev, [id]: true }));
      try {
        const order = await revenuService.getOrderById(id);
        if (!order) {
          throw new Error("Commande non trouvée");
        }
        if (order.paymentStatus === "refunded") {
          throw new Error("La commande est déjà remboursée");
        }
        if (order.paymentStatus !== "paid") {
          throw new Error("La commande n'est pas payée, remboursement impossible");
        }

        await revenuService.refundOrder(id);

        if (socket) {
          socket.emit("orderRefunded", { id, paymentStatus: "refunded" });
          socket.emit("orderDeleted", { id });
        }
        toast.success("Commande remboursée et supprimée avec succès");
        await fetchRevenus();
      } catch (error) {
        console.error("Erreur lors du remboursement:", error.response?.data);
        if (error.message.includes("Unauthorized")) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          navigate("/login");
        } else if (error.message.includes("Commande non trouvée")) {
          toast.error("La commande n'existe pas.");
        } else if (error.message.includes("déjà remboursée")) {
          toast.error("La commande est déjà remboursée.");
        } else if (error.message.includes("payées peuvent être remboursées")) {
          toast.error("Seules les commandes payées peuvent être remboursées.");
        } else {
          toast.error(error.message || "Erreur lors du remboursement");
        }
      } finally {
        setIsRefunding((prev) => ({ ...prev, [id]: false }));
      }
    },
    [socket, navigate, fetchRevenus]
  );

  const handleRefundDebounced = useMemo(() => debounce(handleRefund, 300), [handleRefund]);

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
        "Cash",
        rev.date,
      ]),
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
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
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255] },
    });

    doc.save(`revenus_${new Date().toISOString()}.pdf`);
    toast.success("Exportation PDF réussie");
  }, [filteredRevenus, totalRevenue, totalPending, totalRefunded, categoryBreakdown]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRevenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRevenus.length / itemsPerPage);

  const paginate = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  const createGradient = (ctx, chartArea, colors) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  const barChartData = useMemo(
    () => ({
      labels: ["Payé", "Non payé"],
      datasets: [
        {
          label: "Revenus",
          data: [parseFloat(totalRevenue) - parseFloat(totalPending), parseFloat(totalPending)],
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS[context.dataIndex === 0 ? "paid" : "pending"][0];
            return createGradient(ctx, chartArea, COLORS[context.dataIndex === 0 ? "paid" : "pending"]);
          },
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverBackgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS[context.dataIndex === 0 ? "paid" : "pending"][1];
            return createGradient(ctx, chartArea, COLORS[context.dataIndex === 0 ? "paid" : "pending"].map(c => c.replace("0.8", "0.9")));
          },
          hoverBorderWidth: 3,
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
          data: timeSeriesData.map((item) => parseFloat(item.revenue)),
          borderColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS.timeSeries[0];
            return createGradient(ctx, chartArea, COLORS.timeSeries);
          },
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS.timeSeries[0].replace("0.8", "0.2");
            return createGradient(ctx, chartArea, COLORS.timeSeries.map(c => c.replace("0.8", "0.2")));
          },
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: COLORS.timeSeries[0],
          pointBorderWidth: 2,
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
          labels: {
            boxWidth: 14,
            padding: 20,
            font: { size: 14, weight: "600", family: "'Inter', sans-serif" },
            color: "#1F2937",
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          padding: 12,
          cornerRadius: 8,
          bodyFont: { size: 14, weight: "500", family: "'Inter', sans-serif" },
          titleFont: { size: 16, weight: "600", family: "'Inter', sans-serif" },
          boxPadding: 8,
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
            font: { size: 12, family: "'Inter', sans-serif" },
          },
          grid: { color: "rgba(0, 0, 0, 0.05)", borderColor: "#D1D5DB", borderWidth: 1 },
        },
        x: {
          ticks: { color: "#6B7280", font: { size: 12, family: "'Inter', sans-serif" } },
          grid: { display: false },
        },
      },
      animation: {
        duration: 1200,
        easing: "easeInOutQuart",
        animateScale: true,
        animateRotate: true,
      },
    }),
    []
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
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
  }, [token, socket, navigate, fetchRevenus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-inter"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Tableau de Bord des Revenus
          </h1>
          <Link
            to="/caisse"
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
            aria-label="Retour à la caisse"
          >
            <FaArrowLeft className="mr-2 w-5 h-5" />
            Retour
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Total des Revenus",
              value: `€${totalRevenue}`,
              color: "bg-gradient-to-r from-green-100 to-green-200",
              icon: <FaFileCsv className="w-6 h-6 text-green-600" />,
            },
            {
              title: "En Attente",
              value: `€${totalPending}`,
              color: "bg-gradient-to-r from-yellow-100 to-yellow-200",
              icon: <FaFileCsv className="w-6 h-6 text-yellow-600" />,
            },
            {
              title: "Remboursé",
              value: `€${totalRefunded}`,
              color: "bg-gradient-to-r from-red-100 to-red-200",
              icon: <FaFileCsv className="w-6 h-6 text-red-600" />,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.03 }}
              className={`${stat.color} rounded-2xl p-5 shadow-lg transition-all duration-300 border border-gray-100 flex justify-between items-center`}
            >
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h2>
              </div>
              <div className="p-3 rounded-full bg-white/50">{stat.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center border border-gray-100">
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Rechercher par email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300 text-sm"
              aria-label="Rechercher par email"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm"
            aria-label="Filtrer par période"
          >
            <option value="all">Toutes les périodes</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="Payé">Payé</option>
            <option value="Non payé">Non payé</option>
            <option value="Remboursé">Remboursé</option>
          </select>
          <div className="flex gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchRevenus}
              className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Actualiser les données"
            >
              <FaSync className="mr-2 w-4 h-4" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Exporter en CSV"
            >
              <FaFileCsv className="mr-2 w-4 h-4" />
              CSV
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Exporter en PDF"
            >
              <FaFilePdf className="mr-2 w-4 h-4" />
              PDF
            </motion.button>
          </div>
        </div>

        {/* Charts and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {chartType === "bar" ? "Répartition des Revenus" : "Revenus par Période"}
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-lg shadow-sm hover:from-indigo-200 hover:to-indigo-300 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
                aria-label="Changer le type de graphique"
              >
                {chartType === "bar" ? "Graphique Temporel" : "Graphique Barres"}
              </motion.button>
            </div>
            <div className="h-80 relative">
              {chartType === "bar" ? (
                <Bar data={barChartData} options={chartOptions} />
              ) : (
                <Line data={timeSeriesChartData} options={chartOptions} />
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails des Revenus</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-right">Total (€)</th>
                    <th className="px-6 py-3 text-right">Payé (€)</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-medium">
                        Chargement...
                      </td>
                    </tr>
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-medium">
                        Aucune donnée
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((rev) => (
                      <tr key={rev.id} className="border-b hover:bg-indigo-50 transition-colors duration-200">
                        <td className="px-6 py-4">{rev.id}</td>
                        <td className="px-6 py-4 truncate max-w-[150px]">{rev.nom}</td>
                        <td className="px-6 py-4 truncate max-w-[200px]">{rev.email}</td>
                        <td className="px-6 py-4 text-right">{rev.total}</td>
                        <td className="px-6 py-4 text-right">{rev.amountPaid}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              rev.paymentStatus === "Payé"
                                ? "bg-green-200 text-green-800"
                                : rev.paymentStatus === "Remboursé"
                                ? "bg-red-200 text-red-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {rev.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 truncate">{rev.date}</td>
                        <td className="px-6 py-4 flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDetailsModal(rev)}
                            className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
                            aria-label={`Voir les détails de la commande ${rev.id}`}
                          >
                            <FaEye className="mr-2 w-4 h-4" />
                            Détails
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRefundDebounced(rev.id)}
                            disabled={isRefunding[rev.id] || rev.paymentStatus !== "Payé"}
                            className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                              isRefunding[rev.id] || rev.paymentStatus !== "Payé"
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-300"
                            }`}
                            aria-label={`Rembourser la commande ${rev.id}`}
                          >
                            <FaUndo className="mr-2 w-4 h-4" />
                            {isRefunding[rev.id] ? "En cours..." : "Rembourser"}
                          </motion.button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
                aria-label="Page précédente"
              >
                Précédent
              </motion.button>
              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} sur {totalPages}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
                aria-label="Page suivante"
              >
                Suivant
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs uppercase bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700">
                <tr>
                  <th className="px-6 py-3">Catégorie</th>
                  <th className="px-6 py-3 text-right">Revenu (€)</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500 font-medium">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  Object.entries(categoryBreakdown).map(([category, revenue]) => (
                    <tr key={category} className="border-b hover:bg-indigo-50 transition-colors duration-200">
                      <td className="px-6 py-4 truncate">{category}</td>
                      <td className="px-6 py-4 text-right">{parseFloat(revenue).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Details Modal */}
        {showDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setShowDetailsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Détails de la Commande #{showDetailsModal.id}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs uppercase bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700">
                    <tr>
                      <th className="px-6 py-3">Article</th>
                      <th className="px-6 py-3 text-right">Quantité</th>
                      <th className="px-6 py-3 text-right">Prix (€)</th>
                      <th className="px-6 py-3 text-right">Total (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showDetailsModal.items.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500 font-medium">
                          Aucun article
                        </td>
                      </tr>
                    ) : (
                      showDetailsModal.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-indigo-50 transition-colors duration-200">
                          <td className="px-6 py-4 truncate">{item.menuItem?.name || "Inconnu"}</td>
                          <td className="px-6 py-4 text-right">{item.quantity || 0}</td>
                          <td className="px-6 py-4 text-right">
                            {parseFloat(item.subtotal / (item.quantity || 1)).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {parseFloat(item.subtotal || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(null)}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:from-gray-700 hover:to-gray-800 focus:ring-4 focus:ring-gray-300 transition-all duration-300 text-sm font-semibold"
                  aria-label="Fermer le modal"
                >
                  Fermer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </motion.div>
  );
};

export default RevenuPage;