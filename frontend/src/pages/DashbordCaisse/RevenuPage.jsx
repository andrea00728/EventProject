import React, { useEffect, useState, useMemo, useCallback, useRef } from "react"; // Added useRef
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getUserIdForToken } from "../../services/userService";
import { getEventIdByEmail } from "../../services/invitationService";
import { Bar, Line, Pie } from "react-chartjs-2";
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
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast, Slide } from "react-toastify"; // Added Slide
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../socket";
import revenuService from "../../services/revenu";
import { debounce } from "lodash";
import {
  FaArrowLeft,
  FaSync,
  FaFileCsv,
  FaFilePdf,
  FaUndo,
  FaMoneyBillWave,
  FaClock,
  FaExchangeAlt,
} from "react-icons/fa";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const noScrollbarCSS = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const style = document.createElement("style");
style.textContent = noScrollbarCSS;
document.head.appendChild(style);

const RevenuPage = () => {
  const [revenus, setRevenus] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalRefunded, setTotalRefunded] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [periode, setPeriode] = useState("jour");
  const [loading, setLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [chartType, setChartType] = useState("bar");
  const [noOrders, setNoOrders] = useState(false);
  const { isAuthenticated, isLoading } = useStateContext();
  const navigate = useNavigate();
  const socket = useSocket();
  const toastIds = useRef({}); // Added to track toast IDs

  // Constantes de style pour les graphiques
  const COLORS = {
    paid: ["rgba(34, 197, 94, 0.8)", "rgba(74, 222, 128, 0.8)"],
    pending: ["rgba(234, 179, 8, 0.8)", "rgba(250, 204, 21, 0.8)"],
    refunded: ["rgba(239, 68, 68, 0.8)", "rgba(248, 113, 113, 0.8)"],
    timeSeries: ["rgba(99, 102, 241, 0.8)", "rgba(129, 140, 248, 0.8)"],
    categories: [
      "#4a90e2",
      "#7ed321",
      "#f5a623",
      "#bd10e0",
      "#50e3c2",
      "#e2b84a",
      "#9013fe",
      "#e01083",
      "#008cff",
    ],
  };

  // Fonction pour afficher les toasts sans duplication
  const showToast = useCallback((message, type, key) => {
    if (toastIds.current[key]) {
      toast.update(toastIds.current[key], {
        render: message,
        type,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toastIds.current[key] = toast(message, {
        type,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  // Mise à jour du token pour le service de revenus
  useEffect(() => {
    revenuService.setAuthToken();
  }, []);

  // Récupérer le userId à partir du token
  useEffect(() => {
    async function fetchUserId() {
      if (!isAuthenticated) return; // ⚡ ne pas naviguer ici
      try {
        const id = await getUserIdForToken();
        if (!id) throw new Error("Impossible de récupérer l'ID utilisateur");
      } catch (error) {
        console.error(error);
        showToast("Erreur d'authentification. Veuillez vous reconnecter.", "error", "auth_error");
        navigate("/login");
      }
    }
    fetchUserId();
  }, [isAuthenticated, navigate, showToast]);

  // Fonction pour récupérer les données des revenus
  const fetchRevenus = useCallback(async () => {
    if (!isAuthenticated) {
      showToast("Veuillez vous connecter pour accéder aux revenus", "error", "auth_login");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const eventId = await getEventIdByEmail();
      if (!eventId?.eventId) {
        throw new Error("ID d'événement non trouvé");
      }

      const data = await revenuService.getOrdersByEvent(eventId.eventId);

      if (!Array.isArray(data) || data.length === 0) {
        setRevenus([]);
        setTotalRevenue(0);
        setTotalPending(0);
        setTotalRefunded(0);
        setCategoryBreakdown({});
        setNoOrders(true);
        setTimeSeriesData([]);
        setLoading(false);
        return;
      }

      const formattedRevenus = data.map((order) => ({
        id: order.id || Math.random().toString(36).substr(2, 9),
        nom: order.nom || "Anonyme",
        email: order.email || "-",
        total: parseFloat(order.total || 0).toFixed(2),
        amountPaid:
          order.paymentStatus === "paid"
            ? parseFloat(order.total || 0).toFixed(2)
            : "0.00",
        paymentStatus:
          order.paymentStatus === "paid"
            ? "Payé"
            : order.paymentStatus === "refunded"
            ? "Remboursé"
            : "Non payé",
        paymentMethod: "Espèces",
        date: order.orderDate
          ? new Date(order.orderDate).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-",
        orderDate: order.orderDate || null,
        items: Array.isArray(order.items) ? order.items : [],
      }));

      const total = formattedRevenus
        .filter((order) => order.paymentStatus !== "Remboursé")
        .reduce((sum, order) => sum + parseFloat(order.total), 0);
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
          timeSeries[date] =
            (timeSeries[date] || 0) + parseFloat(order.amountPaid);
        }
      });
      const timeSeriesArray = Object.entries(timeSeries)
        .map(([date, revenue]) => ({
          date,
          revenue: parseFloat(revenue).toFixed(2),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setRevenus(formattedRevenus);
      setTotalRevenue(total.toFixed(2));
      setTotalPending(pending.toFixed(2));
      setTotalRefunded(refunded.toFixed(2));
      setCategoryBreakdown(categories);
      setTimeSeriesData(timeSeriesArray);
    } catch (error) {
      console.error(error);
      if (error.message.includes("Unauthorized")) {
        showToast("Session expirée. Veuillez vous reconnecter.", "error", "session_expired");
        navigate("/login");
      } else {
        showToast(error.message || "Erreur lors du chargement des données", "error", "data_load_error");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate, showToast]);

  const handleRefund = useCallback(
    async (id) => {
      if (!window.confirm("Confirmer le remboursement de cette commande ?"))
        return;
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
        showToast("Commande remboursée et supprimée avec succès", "success", `refund_${id}`);
        await fetchRevenus();
      } catch (error) {
        console.error("Erreur lors du remboursement:", error.response?.data);
        const errorMessage =
          error.message.includes("Unauthorized")
            ? "Session expirée. Veuillez vous reconnecter."
            : error.message.includes("déjà remboursée")
            ? "La commande est déjà remboursée."
            : error.message.includes("payées peuvent être remboursées")
            ? "Seules les commandes payées peuvent être remboursées."
            : error.message || "Erreur lors du remboursement";
        showToast(errorMessage, "error", `refund_error_${id}`);
        if (error.message.includes("Unauthorized")) navigate("/login");
      } finally {
        setIsRefunding((prev) => ({ ...prev, [id]: false }));
      }
    },
    [socket, navigate, fetchRevenus, showToast]
  );

  const handleRefundDebounced = useMemo(() => debounce(handleRefund, 300), [handleRefund]);

  const filteredRevenus = useMemo(() => {
    return revenus.filter((rev) => {
      const matchSearch =
        String(rev.email).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(rev.nom).toLowerCase().includes(searchTerm.toLowerCase());
      const orderDate = rev.orderDate ? new Date(rev.orderDate) : null;
      const today = new Date();
      const matchPeriod =
        filterPeriod === "all" ||
        (orderDate &&
          ((filterPeriod === "today" &&
            orderDate.toDateString() === today.toDateString()) ||
            (filterPeriod === "week" &&
              orderDate >= new Date(today.setDate(today.getDate() - 7))) ||
            (filterPeriod === "month" &&
              orderDate >= new Date(today.setMonth(today.getMonth() - 1)))));
      const matchStatus = filterStatus === "all" || rev.paymentStatus === filterStatus;
      return matchSearch && matchPeriod && matchStatus;
    });
  }, [revenus, searchTerm, filterPeriod, filterStatus]);

  const exportToCSV = useCallback(() => {
    const headers = [
      "ID",
      "Client",
      "Email",
      "Total (€)",
      "Payé (€)",
      "Statut",
      "Méthode",
      "Date",
    ];
    const rows = filteredRevenus.map((rev) =>
      [
        String(rev.id),
        rev.nom,
        rev.email,
        rev.total,
        rev.amountPaid,
        rev.paymentStatus,
        rev.paymentMethod,
        rev.date,
      ].map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `revenus_${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Exportation CSV réussie", "success", "export_csv");
  }, [filteredRevenus, showToast]);

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
      head: [
        ["ID", "Client", "Email", "Total (€)", "Payé (€)", "Statut", "Méthode", "Date"],
      ],
      body: filteredRevenus.map((rev) => [
        String(rev.id),
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
    showToast("Exportation PDF réussie", "success", "export_pdf");
  }, [filteredRevenus, totalRevenue, totalPending, totalRefunded, categoryBreakdown, showToast]);

  const generateInvoicePDF = (order) => {
    console.log("Données de la commande :", order);
    console.log("Items de la commande :", order.items);
    const doc = new jsPDF();
    doc.setFont("Helvetica", "normal");
    const primaryColor = [99, 102, 241];
    const accentColor = [255, 255, 255];
    const textColor = [33, 33, 33];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F");
    doc.setFontSize(24);
    doc.setTextColor(...accentColor);
    doc.setFont("Helvetica", "bold");
    doc.text("FACTURE", 20, 20);
    doc.setFontSize(12);
    doc.text(
      `Numéro de facture: FACT-${new Date().getFullYear()}-${String(order.id).padStart(5, "0")}`,
      20,
      30
    );

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("Informations de la commande", 20, 50);
    doc.setLineWidth(0.5);
    doc.setDrawColor(...primaryColor);
    doc.line(20, 52, 190, 52);

    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(...textColor);
    doc.text(`Client: ${order.nom || "Anonyme"}`, 20, 60);
    doc.text(`Email: ${order.email || "-"}`, 20, 66);
    doc.text(`Date: ${order.date || "-"}`, 20, 72);
    doc.text(`Statut: ${order.paymentStatus || "Inconnu"}`, 20, 78);
    doc.text(`Méthode de paiement: Espèces`, 20, 84);

    autoTable(doc, {
      startY: 94,
      head: [["Produit", "Catégorie", "Prix unitaire (€)", "Quantité", "Sous-total (€)"]],
      body: order.items.map((item) => {
        const price = parseFloat(item.price || item.unitPrice || 0).toFixed(2);
        console.log("Item price:", price);
        return [
          item.menuItem?.name || "N/A",
          item.menuItem?.category || "N/A",
          price,
          item.quantity || 0,
          parseFloat(item.subtotal || 0).toFixed(2),
        ];
      }),
      theme: "grid",
      styles: {
        font: "Helvetica",
        fontSize: 10,
        textColor: textColor,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: accentColor,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 30, halign: "right" },
      },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(...textColor);
        doc.text(`Page ${data.pageNumber}`, 190, doc.internal.pageSize.height - 10, {
          align: "right",
        });
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("Résumé", 20, finalY);
    doc.setLineWidth(0.5);
    doc.line(20, finalY + 2, 190, finalY + 2);

    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Total de la commande: €${parseFloat(order.total || 0).toFixed(2)}`, 20, finalY + 10);
    doc.text(`Montant payé: €${parseFloat(order.amountPaid || 0).toFixed(2)}`, 20, finalY + 16);
    doc.text(
      `Reste à payer: €${(parseFloat(order.total || 0) - parseFloat(order.amountPaid || 0)).toFixed(
        2
      )}`,
      20,
      finalY + 22
    );

    doc.save(`facture_commande_${String(order.id)}.pdf`);
    showToast("Facture PDF générée avec succès", "success", `invoice_${order.id}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRevenus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRevenus.length / itemsPerPage);

  const paginate = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  const createGradient = (ctx, chartArea, colors) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  const pieChartData = useMemo(() => {
    const labels = Object.keys(categoryBreakdown);
    const data = Object.values(categoryBreakdown);
    return {
      labels,
      datasets: [
        {
          data: data,
          backgroundColor: COLORS.categories.slice(0, labels.length),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [categoryBreakdown]);

  const barChartData = useMemo(
    () => ({
      labels: ["Payé", "Non payé", "Remboursé"],
      datasets: [
        {
          label: "Revenus",
          data: [parseFloat(totalRevenue), parseFloat(totalPending), parseFloat(totalRefunded)],
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS.paid[0];
            const colors = [COLORS.paid, COLORS.pending, COLORS.refunded];
            return createGradient(ctx, chartArea, colors[context.dataIndex]);
          },
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverBackgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS.paid[1];
            const colors = [
              COLORS.paid.map((c) => c.replace("0.8", "0.9")),
              COLORS.pending.map((c) => c.replace("0.8", "0.9")),
              COLORS.refunded.map((c) => c.replace("0.8", "0.9")),
            ];
            return createGradient(ctx, chartArea, colors[context.dataIndex]);
          },
          hoverBorderWidth: 3,
        },
      ],
    }),
    [totalRevenue, totalPending, totalRefunded]
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
            return createGradient(
              ctx,
              chartArea,
              COLORS.timeSeries.map((c) => c.replace("0.8", "0.2"))
            );
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

  const fetchRevenusMemo = useCallback(() => {
    fetchRevenus();
  }, [fetchRevenus]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchRevenusMemo();
  }, [isLoading, isAuthenticated, navigate, fetchRevenusMemo]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => showToast("Connecté au serveur en temps réel", "info", "socket_connect");
    const onConnectError = () =>
      showToast("Erreur de connexion au serveur en temps réel", "error", "socket_error");

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("orderDeleted", fetchRevenusMemo);
    socket.on("orderRefunded", fetchRevenusMemo);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("orderDeleted", fetchRevenusMemo);
      socket.off("orderRefunded", fetchRevenusMemo);
    };
  }, [socket, fetchRevenusMemo, showToast]);

  // Composant pour afficher le statut avec une pastille de couleur
  const StatusPill = ({ status }) => {
    let colorClass, text;
    switch (status) {
      case "Payé":
        colorClass = "bg-green-100 text-green-800 border-green-200";
        text = "Payé";
        break;
      case "Non payé":
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
        text = "En Attente";
        break;
      case "Remboursé":
        colorClass = "bg-red-100 text-red-800 border-red-200";
        text = "Remboursé";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800 border-gray-200";
        text = "Inconnu";
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  // --- Rendu du composant ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-inter no-scrollbar"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight bg-clip-text  bg-gradient-to-r from-indigo-600 to-purple-600">
            Tableau de Bord des Revenus
          </h1>
          <Link
            to="/caisse"
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-100 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 transform hover:-translate-y-0.5"
            aria-label="Retour à la caisse"
          >
            <FaArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Total des Revenus",
              value: `€${totalRevenue}`,
              color: "bg-gradient-to-br from-green-50 to-green-100",
              icon: <FaMoneyBillWave className="w-7 h-7 text-green-500" />,
            },
            {
              title: "En Attente",
              value: `€${totalPending}`,
              color: "bg-gradient-to-br from-yellow-50 to-yellow-100",
              icon: <FaClock className="w-7 h-7 text-yellow-500" />,
            },
            {
              title: "Remboursé",
              value: `€${totalRefunded}`,
              color: "bg-gradient-to-br from-red-50 to-red-100",
              icon: <FaExchangeAlt className="w-7 h-7 text-red-500" />,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              className={`${stat.color} rounded-3xl p-6 shadow-lg transition-all duration-300 border border-gray-200 flex items-center justify-between`}
            >
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</h2>
              </div>
              <div className="p-3 rounded-full bg-white/60 backdrop-blur-sm">{stat.icon}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-5 flex flex-wrap gap-4 items-center border border-gray-200">
          <div className="relative w-full sm:w-1/3">
            <input
              type="text"
              placeholder="Rechercher par client ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300 text-sm"
              aria-label="Rechercher par email ou nom"
            />
            <svg
              className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm"
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
            className="w-full sm:w-1/4 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm"
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
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl shadow-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Actualiser les données"
            >
              <FaSync className="mr-2 w-4 h-4" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-md hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Exporter en CSV"
            >
              <FaFileCsv className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToPDF}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-300 text-sm font-semibold"
              aria-label="Exporter en PDF"
            >
              <FaFilePdf className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 col-span-1"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
            <div className="h-80 relative flex items-center justify-center">
              <Pie
                data={pieChartData}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200 col-span-2"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {chartType === "bar" ? "Répartition des Revenus" : "Revenus par Période"}
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setChartType(chartType === "bar" ? "line" : "bar")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 rounded-full shadow-sm hover:from-indigo-200 hover:to-indigo-300 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
                aria-label="Changer le type de graphique"
              >
                {chartType === "bar" ? "Graphique Temporel" : "Graphique Barres"}
              </motion.button>
            </div>
            <div className="h-80 relative">
              {chartType === "bar" ? <Bar data={barChartData} options={chartOptions} /> : <Line data={timeSeriesChartData} options={chartOptions} />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-xl border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Détails des Revenus</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-100 no-scrollbar">
              <table className="min-w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Total (€)
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Payé (€)
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-medium">
                        <div className="flex items-center justify-center p-4">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Chargement des données...
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((rev) => (
                      <tr key={rev.id} className="bg-white hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 font-medium text-gray-900">{String(rev.id).substring(0, 8)}...</td>
                        <td className="px-6 py-4">{rev.nom}</td>
                        <td className="px-6 py-4">{rev.email}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">€{rev.total}</td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">€{rev.amountPaid}</td>
                        <td className="px-6 py-4">
                          <StatusPill status={rev.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 text-gray-500">{rev.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => generateInvoicePDF(rev)}
                              className="p-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              aria-label={`Générer la facture pour la commande ${rev.id}`}
                            >
                              <FaFilePdf className="w-5 h-5" />
                            </button>
                            {rev.paymentStatus === "Payé" && (
                              <button
                                onClick={() => handleRefundDebounced(rev.id)}
                                disabled={isRefunding[rev.id]}
                                className="p-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                                aria-label={`Rembourser la commande ${rev.id}`}
                              >
                                {isRefunding[rev.id] ? (
                                  <svg
                                    className="animate-spin h-5 w-5 text-red-600"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                ) : (
                                  <FaUndo className="w-5 h-5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500 font-medium">
                        Aucune donnée ne correspond à vos filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
        className="text-sm"
        toastStyle={{
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          fontFamily: "'Inter', sans-serif",
        }}
      />
      {noOrders && <p className="text-gray-500">Aucune commande trouvée pour cet événement.</p>}
    </motion.div>
  );
};

export default RevenuPage;