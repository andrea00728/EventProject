import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { getUserIdForToken } from "../../services/userService";
import { SOCKET_URL } from "../../socket";
import { Snackbar, Alert, Chip } from "@mui/material";
import {
  FaArrowLeft,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaSearch,
  FaPrint,
  FaSync,
} from "react-icons/fa";
import io from "socket.io-client";

/* Optional: hide scrollbar for this page */
const noScrollbarCSS = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = noScrollbarCSS;
  document.head.appendChild(style);
}

const PaiementPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const { token } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const socketRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const PAYMENT_STATUS_MAPPING = {
    frontToBack: { paye: "paid", non_paye: "unpaid" },
    backToFront: { paid: "paye", unpaid: "non_paye" },
  };

  const PAYMENT_STATUS_OPTIONS = [
    { value: "paye", label: "Payé", color: "success" },
    { value: "non_paye", label: "Non Payé", color: "error" },
  ];

  const fetchCommandes = useCallback(async () => {
    setLoading(true);
    if (!token) {
      setSnackbar({
        open: true,
        message: "Veuillez vous connecter pour accéder aux paiements",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const eventIdResponse = await getEventIdByEmail(token);
      const eventId = eventIdResponse?.eventId;
      if (!eventId) {
        throw new Error("ID d'événement non trouvé ou invalide.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/orders/event/${eventId}`,
        {
          params: { include: "table,items,items.menuItem" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const raw = response.data;
      if (!raw || !Array.isArray(raw)) {
        setCommandes([]);
        setSnackbar({
          open: true,
          message: "Aucune commande trouvée.",
          severity: "info",
        });
        return;
      }

      const filteredData = raw.filter((c) => c.status !== "canceled");

      const formatted = filteredData.map((c) => {
        const tableInfo = c.table ? `Table ${c.table.numero}` : "N/A";
        const total = parseFloat(c.total || 0).toFixed(2);
        const amountPaid = parseFloat(c.amountPaid || 0).toFixed(2);
        const createdAt = c.orderDate
          ? new Date(c.orderDate).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "-";
        const paymentStatus =
          PAYMENT_STATUS_MAPPING.backToFront[c.paymentStatus] || "non_paye";

        return {
          id: c.id,
          nom: c.nom || "Anonyme",
          email: c.email || "-",
          table: tableInfo,
          total,
          amountPaid,
          createdAt,
          paymentStatus,
          items: c.items || [],
        };
      });

      setCommandes(formatted);
    } catch (err) {
      console.error("Erreur fetchCommandes:", err);
      if (err?.response) {
        setSnackbar({
          open: true,
          message: `Erreur serveur: ${err.response.status} - ${err.response.data?.message || "Erreur"}`,
          severity: "error",
        });
      } else {
        setSnackbar({
          open: true,
          message: err.message || "Erreur lors du chargement des commandes.",
          severity: "error",
        });
      }
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCommandes();

    const setupWebSocket = async () => {
      if (!token) {
        setSnackbar({
          open: true,
          message: "Session expirée. Veuillez vous reconnecter.",
          severity: "error",
        });
        return;
      }
      try {
        const fetchedUserId = await getUserIdForToken(token);
        setUserId(fetchedUserId);

        if (!socketRef.current) {
          socketRef.current = io(SOCKET_URL, {
            auth: { userId: fetchedUserId },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
          });

          socketRef.current.on("connect", () => {
            console.log("✅ WebSocket connecté (PaiementPage)");
          });

          socketRef.current.on("orderUpdated", (data) => {
            console.log("orderUpdated reçu:", data);
            setSnackbar({
              open: true,
              message: `Commande #${data?.id ?? ""} mise à jour via WebSocket.`,
              severity: "info",
            });
            fetchCommandes();
          });

          socketRef.current.on("connect_error", (error) => {
            console.error("WebSocket error:", error);
            setSnackbar({
              open: true,
              message: "Erreur de connexion WebSocket.",
              severity: "error",
            });
          });

          socketRef.current.on("disconnect", (reason) => {
            console.warn("WebSocket déconnecté:", reason);
          });
        }
      } catch (error) {
        console.error("Erreur setupWebSocket:", error);
        setSnackbar({
          open: true,
          message: "Erreur lors de la configuration du WebSocket.",
          severity: "error",
        });
      }
    };

    setupWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("orderUpdated");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, fetchCommandes]);

  const handlePaymentStatusChange = async (id, newStatus) => {
    const backendStatus = PAYMENT_STATUS_MAPPING.frontToBack[newStatus];
    if (!backendStatus) {
      setSnackbar({ open: true, message: "Statut de paiement invalide.", severity: "error" });
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${id}/payment`,
        { paymentStatus: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCommandes((prev) => prev.map((cmd) => (cmd.id === id ? { ...cmd, paymentStatus: newStatus } : cmd)));
      setSnackbar({ open: true, message: `Statut de la commande #${id} mis à jour.`, severity: "success" });

      if (socketRef.current) {
        socketRef.current.emit("paymentStatusChanged", { id, paymentStatus: backendStatus });
      }
    } catch (error) {
      console.error("Erreur handlePaymentStatusChange:", error);
      setSnackbar({ open: true, message: "Échec de la mise à jour du statut.", severity: "error" });
    }
  };

  const handleProcessPayment = async (id) => {
    const row = commandes.find((c) => c.id === id);
    if (!row) {
      setSnackbar({ open: true, message: "Commande introuvable pour le paiement.", severity: "error" });
      return;
    }
    if (row.paymentStatus === "paye") {
      setSnackbar({ open: true, message: "Cette commande est déjà payée.", severity: "info" });
      return;
    }

    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${id}/payment`,
        { paymentStatus: "paid" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCommandes();
      setSnackbar({ open: true, message: `Paiement de la commande #${id} effectué.`, severity: "success" });

      if (socketRef.current) {
        socketRef.current.emit("paymentStatusChanged", { id, paymentStatus: "paid" });
      }
    } catch (error) {
      console.error("Erreur handleProcessPayment:", error);
      setSnackbar({ open: true, message: "Échec du traitement du paiement.", severity: "error" });
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
          <td style="padding:12px; border:1px solid #E5E7EB;">${item.menuItem?.name || "-"}</td>
          <td style="padding:12px; border:1px solid #E5E7EB; text-align:center;">${item.quantity || 0}</td>
          <td style="padding:12px; border:1px solid #E5E7EB; text-align:right;">${parseFloat(item.price || 0).toFixed(2)} €</td>
          <td style="padding:12px; border:1px solid #E5E7EB; text-align:right;">${((item.quantity || 0) * (item.price || 0)).toFixed(2)} €</td>
        </tr>
      `
      )
      .join("");
  };

  const handlePrintInvoice = async (row) => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const padSequential = (num) => String(num).padStart(5, "0");

      let sequentialNumber = row.id;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices/next-sequence`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.nextSequence) sequentialNumber = response.data.nextSequence;
      } catch (err) {
        console.warn("Pas de sequence invoice, fallback -> order id");
      }

      const invoiceNumber = `FACT-${year}-${padSequential(sequentialNumber)}`;

      const invoiceHtml = `
        <html>
          <head>
            <title>Facture - Commande #${row.id}</title>
            <style>
              body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #1F2937; }
              h1 { text-align:center; color:#4B5563; font-size:24px; margin-bottom:20px; }
              h2 { font-size:18px; margin-top:30px; margin-bottom:15px; border-bottom:2px solid #E5E7EB; padding-bottom:5px; }
              p { margin:8px 0; font-size:14px; }
              table { border-collapse: collapse; width:100%; margin-top:20px; font-size:14px; }
              th, td { border:1px solid #E5E7EB; padding:12px; }
              th { background: linear-gradient(to right, #EEF2FF, #F3E8FF); color:#4B5563; font-weight:600; text-align:left; }
              td { text-align:left; }
              tfoot td { font-weight:600; background-color:#F9FAFB; }
              .total { text-align:right; }
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
                  <td class="total">${(parseFloat(row.total) - parseFloat(row.amountPaid)).toFixed(2)} €</td>
                </tr>
              </tfoot>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setSnackbar({
          open: true,
          message: "Impossible d'ouvrir la fenêtre d'impression. Vérifiez les popups.",
          severity: "error",
        });
        return;
      }
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      setSnackbar({ open: true, message: "Facture générée avec succès.", severity: "success" });
    } catch (err) {
      console.error("Erreur handlePrintInvoice:", err);
      setSnackbar({ open: true, message: "Erreur lors de la génération de la facture.", severity: "error" });
    }
  };

  const totalPaid = commandes
    .filter((c) => c.paymentStatus === "paye")
    .reduce((sum, c) => sum + parseFloat(c.total || 0), 0)
    .toFixed(2);

  const totalDue = commandes
    .filter((c) => c.paymentStatus === "non_paye")
    .reduce((sum, c) => sum + parseFloat(c.total || 0), 0)
    .toFixed(2);

  const filteredCommandes = commandes.filter((c) => {
    const nom = (c.nom || "").toString().toLowerCase();
    const email = (c.email || "").toString().toLowerCase();
    const term = (searchTerm || "").toLowerCase();
    const matchSearch = nom.includes(term) || email.includes(term);
    const matchStatus = filterStatus === "all" || c.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nom", headerName: "Nom", width: 150 },
    { field: "email", headerName: "Email", width: 220 },
    {
      field: "table",
      headerName: "Table",
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value === "N/A" ? "default" : "primary"} size="small" />
      ),
    },
    {
      field: "total",
      headerName: "Total (€)",
      width: 110,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span className="font-semibold text-gray-800">{params.value}</span>,
    },
    {
      field: "amountPaid",
      headerName: "Payé (€)",
      width: 110,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => <span className="font-semibold text-gray-800">{params.value}</span>,
    },
    { field: "createdAt", headerName: "Date", width: 180 },
    {
      field: "paymentStatus",
      headerName: "Statut Paiement",
      width: 160,
      renderCell: ({ row }) => {
        const statusInfo = PAYMENT_STATUS_OPTIONS.find((s) => s.value === row.paymentStatus);
        return (
          <motion.div whileHover={{ scale: 1.03 }} style={{ width: "100%" }}>
            <select
              value={row.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(row.id, e.target.value)}
              className={`w-full px-3 py-2 rounded-full text-sm font-medium h-9 shadow-sm border ${
                statusInfo?.color === "success"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-red-100 text-red-800 border-red-300"
              } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
              aria-label="Changer le statut de paiement"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>
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
            className={`flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold shadow-md transition-all duration-300 ${
              row.paymentStatus === "paye"
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
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
            className="flex items-center justify-center px-4 py-2.5 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold shadow-md"
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
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
      className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter no-scrollbar"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestion des Paiements
          </h2>
          <Link to="/caisse" className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg">
            <FaArrowLeft className="mr-2" />
            Retour
          </Link>
        </div>

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
              whileHover={{ scale: 1.03 }}
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

        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300"
              aria-label="Rechercher par nom ou email"
            />
          </div>

          <div className="flex-grow flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex gap-2">
              <Chip label="Tous" clickable color={filterStatus === "all" ? "primary" : "default"} onClick={() => setFilterStatus("all")} />
              <Chip label="Payé" clickable color={filterStatus === "paye" ? "success" : "default"} onClick={() => setFilterStatus("paye")} />
              <Chip label="Non Payé" clickable color={filterStatus === "non_paye" ? "error" : "default"} onClick={() => setFilterStatus("non_paye")} />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchCommandes}
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg"
              aria-label="Actualiser les données"
            >
              <FaSync className={`mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </motion.button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <DataGrid
            rows={filteredCommandes}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            className="border-none"
            sx={{
              "& .MuiDataGrid-cell": { fontSize: "0.875rem", color: "#4b5563" },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9fafb",
                color: "#1f2937",
                fontWeight: "bold",
                borderBottom: "2px solid #e5e7eb",
              },
              "& .MuiDataGrid-row": { transition: "background-color 0.2s ease" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f3f4f6" },
              "& .MuiDataGrid-footerContainer": { backgroundColor: "#F9FAFB", borderTop: "1px solid #E5E7EB" },
              "& .MuiDataGrid-root": { borderRadius: "16px", border: "none" },
            }}
          />
        </motion.div>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" className="w-full shadow-lg"
          sx={{
            background:
              snackbar.severity === "success"
                ? "linear-gradient(to right, #10b981, #059669)"
                : snackbar.severity === "error"
                ? "linear-gradient(to right, #ef4444, #dc2626)"
                : undefined,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default PaiementPage;
