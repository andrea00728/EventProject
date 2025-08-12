import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { getUserIdForToken } from "../../services/userService";
import { SOCKET_URL } from "../../socket";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaSearch,
  FaPrint,
} from "react-icons/fa";
import io from "socket.io-client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// CSS pour masquer la barre de défilement mais permettre le défilement
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

const PaiementPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const { token } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const socketRef = useRef(null);

  const PAYMENT_STATUS_MAPPING = {
    frontToBack: { paye: "paid", non_paye: "unpaid" },
    backToFront: { paid: "paye", unpaid: "non_paye" },
  };

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) {
        toast.error("Veuillez vous connecter pour accéder aux paiements");
        return;
      }
      const eventId = await getEventIdByEmail(token);
      if (!eventId?.eventId) {
        throw new Error("ID d'événement non trouvé");
      }
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/orders/event/${eventId.eventId}`,
        {
          params: { include: "table,items,items.menuItem" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const filteredData = data.filter((c) => c.status !== "canceled");

      const formatted = filteredData.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.numero}` : "N/A",
        total: parseFloat(c.total || 0).toFixed(2),
        amountPaid: parseFloat(c.amountPaid || 0).toFixed(2),
        createdAt: new Date(c.orderDate).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        paymentStatus: PAYMENT_STATUS_MAPPING.backToFront[c.paymentStatus] || "non_paye",
        items: c.items || [],
      }));

      setCommandes(formatted);
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
      toast.error(
        err.message || "Erreur lors du chargement des commandes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    const setupWebSocket = async () => {
      try {
        const fetchedUserId = await getUserIdForToken(token);
        setUserId(fetchedUserId);

        socketRef.current = io(SOCKET_URL, {
          auth: { userId: fetchedUserId },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current.on("connect", () => {
          console.log("✅ Connecté au serveur WebSocket (PaiementPage)");
        });

        socketRef.current.on("orderUpdated", () => {
          console.log("Mise à jour de commande reçue via WebSocket");
          fetchCommandes();
        });

        socketRef.current.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
        });
      } catch (error) {
        console.error("Erreur lors de la configuration du WebSocket:", error);
      }
    };

    fetchCommandes();
    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("orderUpdated");
        socketRef.current.disconnect();
        console.log("🔌 WebSocket déconnecté (PaiementPage)");
      }
    };
  }, [token]);

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      const backendStatus = PAYMENT_STATUS_MAPPING.frontToBack[newStatus];
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${id}/payment`,
        { paymentStatus: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommandes((prev) =>
        prev.map((cmd) => (cmd.id === id ? { ...cmd, paymentStatus: newStatus } : cmd))
      );
      toast.success(`Statut de la commande #${id} mis à jour.`);
      if (socketRef.current) {
        socketRef.current.emit("paymentStatusChanged", {
          id,
          paymentStatus: backendStatus,
        });
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
      toast.error("Échec de la mise à jour du statut.");
    }
  };

  const handleProcessPayment = async (id) => {
    const row = commandes.find((c) => c.id === id);
    if (row) {
      try {
        await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/orders/${id}/payment`,
          { paymentStatus: "paid" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCommandes();
        toast.success(`Paiement de la commande #${id} effectué.`);
        if (socketRef.current) {
          socketRef.current.emit("paymentStatusChanged", { id, paymentStatus: "paid" });
        }
      } catch (error) {
        console.error("Erreur lors du traitement du paiement :", error);
        toast.error("Échec du traitement du paiement.");
      }
    }
  };

  const getOrderItemsHtml = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "<tr><td colspan='4' style='text-align: center;'>Aucun produit</td></tr>";
    }
    return items
      .map(
        (item) => `
          <tr class="hover:bg-gray-50 transition-colors duration-150">
            <td style="padding: 12px; border: 1px solid #E5E7EB;">${
              item.menuItem?.name || "-"
            }</td>
            <td style="padding: 12px; border: 1px solid #E5E7EB; text-align:center;">${
              item.quantity || 0
            }</td>
            <td style="padding: 12px; border: 1px solid #E5E7EB; text-align:right;">${parseFloat(
              item.price || 0
            ).toFixed(2)} €</td>
            <td style="padding: 12px; border: 1px solid #E5E7EB; text-align:right;">${(
              (item.quantity || 0) * (item.price || 0)
            ).toFixed(2)} €</td>
          </tr>
        `
      )
      .join("");
  };

  const handlePrintInvoice = async (row) => {
    try {
      const date = new Date();
      const year = date.getFullYear();

      const padSequential = (num) => num.toString().padStart(5, "0");

      let sequentialNumber = row.id;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/invoices/next-sequence`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        sequentialNumber = response.data.nextSequence;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du numéro séquentiel :",
          error
        );
      }

      const invoiceNumber = `FACT-${year}-${padSequential(sequentialNumber)}`;

      const invoiceHtml = `
        <html>
        <head>
          <title>Facture - Commande #${row.id}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #1F2937; }
            h1 { text-align: center; color: #4B5563; font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; }
            p { margin: 8px 0; font-size: 14px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #E5E7EB; padding: 12px; }
            th { background: linear-gradient(to right, #EEF2FF, #F3E8FF); color: #4B5563; font-weight: 600; text-align: left; }
            td { text-align: left; }
            tfoot td { font-weight: 600; background-color: #F9FAFB; }
            .total { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Facture - Commande #${row.id}</h1>
          
          <h2>Informations de la commande</h2>
          <p><strong>Numéro de facture :</strong> ${invoiceNumber}</p>
          <p><strong>Nom :</strong> ${row.nom}</p>
          <p><strong>Email :</strong> ${row.email}</p>
          <p><strong>Table :</strong> ${row.table}</p>
          <p><strong>Date :</strong> ${row.createdAt}</p>

          <h2>Détails des produits</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th style="text-align:right;">Prix Unitaire</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItemsHtml(row.items)}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total">Total à payer :</td>
                <td class="total">${row.total} €</td>
              </tr>
              <tr>
                <td colspan="3" class="total">Montant payé :</td>
                <td class="total">${row.amountPaid} €</td>
              </tr>
              <tr>
                <td colspan="3" class="total">Reste à payer :</td>
                <td class="total">${(row.total - row.amountPaid).toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
        </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        toast.success("Facture générée avec succès.");
      } else {
        console.error("Impossible d'ouvrir la fenêtre d'impression");
        toast.error("Impossible d'ouvrir la fenêtre d'impression.");
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      toast.error("Erreur lors de la génération de la facture.");
    }
  };

  const totalPaid = commandes
    .filter((c) => c.paymentStatus === "paye")
    .reduce((sum, c) => sum + parseFloat(c.total || 0), 0)
    .toFixed(2);
  const totalDue = commandes
    .filter((c) => c.paymentStatus === "non_paye")
    .reduce((sum, c) => sum + (c.paymentStatus === "non_paye" ? parseFloat(c.total || 0) : 0), 0)
    .toFixed(2);

  const filteredCommandes = commandes.filter((c) => {
    const matchSearch =
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nom", headerName: "Nom", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "table", headerName: "Table", width: 120 },
    {
      field: "total",
      headerName: "Total (€)",
      width: 110,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span className="font-semibold text-gray-800">{params.value}</span>
      ),
    },
    {
      field: "amountPaid",
      headerName: "Payé (€)",
      width: 110,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <span className="font-semibold text-gray-800">{params.value}</span>
      ),
    },
    { field: "createdAt", headerName: "Date", width: 180 },
    {
      field: "paymentStatus",
      headerName: "Statut Paiement",
      width: 160,
      renderCell: ({ row }) => {
        const isPaid = row.paymentStatus === "paye";
        return (
          <motion.select
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            value={row.paymentStatus}
            onChange={(e) => handlePaymentStatusChange(row.id, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 h-9 shadow-sm border ${
              isPaid
                ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                : "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
            } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
            aria-label="Changer le statut de paiement"
          >
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </motion.select>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleProcessPayment(row.id)}
            disabled={row.paymentStatus === "paye"}
            title="Payer la commande"
            className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-300 ${
              row.paymentStatus === "paye"
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300"
            }`}
            aria-label="Payer la commande"
          >
            <FaMoneyBillWave className="mr-2 w-4 h-4" />
            Payer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePrintInvoice(row)}
            title="Imprimer la facture"
            className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold shadow-md hover:from-gray-200 hover:to-gray-300 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
            aria-label="Imprimer la facture"
          >
            <FaPrint className="mr-2 w-4 h-4" />
            Facture
          </motion.button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="flex items-center space-x-2 text-gray-500">
          <svg
            className="animate-spin h-5 w-5"
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
          <span className="text-lg font-semibold">Chargement des données...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 font-inter no-scrollbar"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestion des Paiements
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              title: "Total Encaissé",
              value: `${totalPaid} €`,
              color: "bg-gradient-to-br from-green-50 to-green-100",
              icon: <FaMoneyBillWave className="w-7 h-7 text-green-500" />,
            },
            {
              title: "Reste à Encaisser",
              value: `${totalDue} €`,
              color: "bg-gradient-to-br from-red-50 to-red-100",
              icon: <FaFileInvoiceDollar className="w-7 h-7 text-red-500" />,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              className={`${stat.color} rounded-3xl p-6 shadow-lg transition-all duration-300 border border-gray-200 flex items-center justify-between`}
            >
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</h2>
              </div>
              <div className="p-3 rounded-full bg-white/60 backdrop-blur-sm">
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-3xl shadow-xl p-5 flex flex-wrap gap-4 items-center border border-gray-200">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300 text-sm"
              aria-label="Rechercher par nom ou email"
            />
            <FaSearch className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <motion.select
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm shadow-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </motion.select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCommandes}
            className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl shadow-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold w-full sm:w-auto"
            aria-label="Actualiser les données"
          >
            <FaSearch className="mr-2 w-4 h-4" />
            Rechercher
          </motion.button>
        </div>

        {/* DataGrid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200"
        >
          <DataGrid
            rows={filteredCommandes}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
            className="border-none"
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
                color: "#1F2937",
                padding: "16px",
                borderBottom: "1px solid #E5E7EB",
              },
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(to right, #EEF2FF, #F3E8FF)",
                color: "#4B5563",
                fontWeight: "600",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                borderRadius: "16px 16px 0 0",
              },
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "600" },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#F1F5F9",
                transform: "scale(1.005)",
                transition: "all 0.2s ease-in-out",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#F9FAFB",
                borderTop: "1px solid #E5E7EB",
                borderRadius: "0 0 16px 16px",
              },
              "& .MuiDataGrid-root": {
                borderRadius: "16px",
                border: "none",
              },
            }}
          />
        </motion.div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </motion.div>
  );
};

export default PaiementPage;