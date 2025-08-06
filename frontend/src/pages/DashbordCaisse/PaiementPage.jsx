import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { SOCKET_URL } from "../../socket";
import { FaArrowLeft, FaDollarSign, FaPrint } from "react-icons/fa";
import io from "socket.io-client";

const CashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-red-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

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
      if (!token) throw new Error("Token manquant");

      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/event/${eventId.eventId}`, {
        params: { include: "table,items,items.menuItem" },
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredData = data.filter((c) => c.status !== "canceled");

      const formatted = filteredData.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.nom}` : "N/A",
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
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    if (token) {
      fetchCommandes();
      setupWebSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("orderUpdated", fetchCommandes);
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
      if (socketRef.current) {
        socketRef.current.emit("paymentStatusChanged", { id, paymentStatus: backendStatus });
      } else {
        console.warn("Socket non connecté, impossible d'émettre l'événement paymentStatusChanged.");
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

  const handleProcessPayment = async (id) => {
    const row = commandes.find((c) => c.id === id);
    if (row) {
      try {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/paiement/create`,
          { eventId: id, amount: row.total },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchCommandes();
        if (socketRef.current) {
          socketRef.current.emit("paymentProcessed", { id, amount: row.total });
        }
      } catch (error) {
        console.error("Erreur lors du traitement du paiement :", error);
      }
    }
  };

  const getOrderItemsHtml = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "<tr><td colspan='4'>Aucun produit</td></tr>";
    }
    return items
      .map(
        (item) => `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.menuItem?.name || "-"}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align:center;">${item.quantity || 0}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">${parseFloat(item.price || 0).toFixed(2)} €</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">${((item.quantity || 0) * (item.price || 0)).toFixed(2)} €</td>
          </tr>
        `
      )
      .join("");
  };

  const handlePrintInvoice = async (row) => {
    const date = new Date(row.createdAt);
    const year = date.getFullYear();

    const padSequential = (num) => num.toString().padStart(5, "0");

    let sequentialNumber = row.id;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices/next-sequence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      sequentialNumber = response.data.nextSequence;
    } catch (error) {
      console.error("Erreur lors de la récupération du numéro séquentiel :", error);
    }

    const invoiceNumber = `FACT-${year}-${padSequential(sequentialNumber)}`;

    const invoiceHtml = `
      <html>
      <head>
        <title>Facture - Commande #${row.id}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 20px; color: #1F2937; }
          h1 { text-align: center; color: #4B5563; }
          p { margin: 5px 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #E5E7EB; padding: 10px; }
          th { background: linear-gradient(to right, #EEF2FF, #F3E8FF); color: #4B5563; font-weight: 600; }
          tfoot td { font-weight: 600; background-color: #F9FAFB; }
          .total { text-align: right; }
        </style>
      </head>
      <body>
        <h1>Facture - Commande #${row.id}</h1>
        <p><strong>Numéro de facture :</strong> ${invoiceNumber}</p>
        <p><strong>Nom :</strong> ${row.nom}</p>
        <p><strong>Email :</strong> ${row.email}</p>
        <p><strong>Table :</strong> ${row.table}</p>
        <p><strong>Date :</strong> ${row.createdAt}</p>

        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
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
    } else {
      console.error("Impossible d'ouvrir la fenêtre d'impression");
    }
  };

  const totalPaid = commandes
    .reduce((sum, c) => sum + parseFloat(c.amountPaid || 0), 0)
    .toFixed(2);
  const totalDue = commandes
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
    { field: "total", headerName: "Total (€)", width: 110, align: "right", headerAlign: "right" },
    { field: "amountPaid", headerName: "Payé (€)", width: 110, align: "right", headerAlign: "right" },
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
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-300 ${
              row.paymentStatus === "paye"
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300"
            }`}
            aria-label="Payer la commande"
          >
            <FaDollarSign className="mr-2 w-4 h-4" />
            Payer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePrintInvoice(row)}
            title="Imprimer la facture"
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-medium shadow-sm hover:from-gray-200 hover:to-gray-300 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
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
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center"
      >
        <p className="text-lg font-semibold text-gray-700">Chargement des données...</p>
      </motion.div>
    );
  }

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
            Gestion des Paiements
          </h1>
          <Link
            to="/caisse"
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 text-sm font-semibold"
            aria-label="Retour à la caisse"
          >
            <FaArrowLeft className="mr-2 w-4 h-4" />
            Retour
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              title: "Total Encaissé",
              value: `${totalPaid} €`,
              color: "bg-gradient-to-r from-green-100 to-green-200",
              icon: <CashIcon />,
            },
            {
              title: "Reste à Encaisser",
              value: `${totalDue} €`,
              color: "bg-gradient-to-r from-red-100 to-red-200",
              icon: <CreditCardIcon />,
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center border border-gray-100">
          <div className="relative w-full sm:w-1/2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300 text-sm"
              aria-label="Rechercher par nom ou email"
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
          <motion.select
            whileHover={{ scale: 1.05 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300 text-sm shadow-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </motion.select>
        </div>

        {/* DataGrid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
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
              "& .MuiDataGrid-cell": { fontSize: "0.875rem", color: "#1F2937", padding: "8px" },
              "& .MuiDataGrid-columnHeaders": {
                background: "linear-gradient(to right, #EEF2FF, #F3E8FF)",
                color: "#4B5563",
                fontWeight: "600",
                fontSize: "0.75rem",
                textTransform: "uppercase",
              },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#F1F5F9" },
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "600" },
              "& .MuiDataGrid-footerContainer": { backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E7EB" },
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaiementPage;