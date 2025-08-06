// Importation des dépendances nécessaires
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client"; // Added socket.io-client import
import { DataGrid } from "@mui/x-data-grid";
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { useSocket } from "../../socket";
import { ArrowLeft } from "lucide-react";
 
const CashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-green-500"
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

// Icône pour le reste à encaisser
const CreditCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-red-500"
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

// Composant principal pour la gestion des paiements
const PaiementPage = () => {
  // Déclaration des états
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useStateContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const socket=useSocket();
  const PAYMENT_STATUS_MAPPING = {
    frontToBack: { paye: "paid", non_paye: "unpaid" },
    backToFront: { paid: "paye", unpaid: "non_paye" },
  };

  // Récupération des commandes depuis le backend
  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");

      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(`http://localhost:3000/orders/event/${eventId.eventId}`, {
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

  // Effet pour charger les données et configurer WebSocket
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const fetchedUserId = await getUserIdForToken(token);
        setUserId(fetchedUserId);

        socketRef.current = io("http://localhost:3000", {
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
      } catch (err) {
        console.error("Erreur lors de l'initialisation du socket:", err);
      }
    };

    const loadData = async () => {
      await fetchCommandes();
      await setupWebSocket();
    };

    if (token) {
      loadData();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("orderUpdated", fetchCommandes);
        socketRef.current.disconnect();
        console.log("🔌 WebSocket déconnecté (PaiementPage)");
      }
    };
  }, [token]);

  // Gestion du changement de statut de paiement
  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      const backendStatus = PAYMENT_STATUS_MAPPING.frontToBack[newStatus];
      await axios.patch(
        `http://localhost:3000/orders/${id}/payment`,
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

  // Traitement du paiement d'une commande
  const handleProcessPayment = async (id) => {
    const row = commandes.find((c) => c.id === id);
    if (row) {
      try {
        await axios.post(
          `http://localhost:3000/paiement/create`,
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

  // Génération du HTML pour les items de la facture
  const getOrderItemsHtml = (items) => {
    if (!items || items.length === 0) return "<tr><td colspan='4'>Aucun produit</td></tr>";
    return items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.menuItem?.name || "-"}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align:center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">${parseFloat(item.price).toFixed(2)} €</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">${(item.quantity * item.price).toFixed(2)} €</td>
      </tr>
    `
      )
      .join("");
  };

  // Impression de la facture
  const handlePrintInvoice = async (row) => {
    const date = new Date(row.createdAt);
    const year = date.getFullYear();

    const padSequential = (num) => num.toString().padStart(5, "0");

    let sequentialNumber = row.id;
    try {
      const response = await axios.get(`http://localhost:3000/invoices/next-sequence`, {
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
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f3f4f6; }
          tfoot td { font-weight: bold; }
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
              <td colspan="3" style="text-align:right;">Total à payer :</td>
              <td style="text-align:right;">${row.total} €</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;">Montant payé :</td>
              <td style="text-align:right;">${row.amountPaid} €</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align:right;">Reste à payer :</td>
              <td style="text-align:right;">${(row.total - row.amountPaid).toFixed(2)} €</td>
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

  // Calcul des totaux
  const totalPaid = commandes
    .reduce((sum, c) => sum + parseFloat(c.amountPaid || 0), 0)
    .toFixed(2);
  const totalDue = commandes
    .reduce((sum, c) => sum + (c.paymentStatus === "non_paye" ? parseFloat(c.total || 0) : 0), 0)
    .toFixed(2);

  // Filtrage des commandes
  const filteredCommandes = commandes.filter((c) => {
    const matchSearch =
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  // Définition des colonnes pour DataGrid
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
            value={row.paymentStatus}
            onChange={(e) => handlePaymentStatusChange(row.id, e.target.value)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 h-9 ${
              isPaid
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
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
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              row.paymentStatus === "paye"
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            }`}
            aria-label="Payer la commande"
          >
            <FaDollarSign className="mr-2" />
            Payer
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePrintInvoice(row)}
            className="flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Imprimer la facture"
          >
            <FaPrint className="mr-2" />
            Facture
          </motion.button>
        </div>
      ),
    },
  ];

  // Rendu de l'interface utilisateur
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-100 flex flex-col p-4 sm:p-6"
    >
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Gestion des Paiements
          </h1>
          <Link
            to="/caisse"
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            aria-label="Retour à la caisse"
          >
            <ArrowLeft className="mr-2" />
            Retour
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "Total Encaissé", value: `${totalPaid} €`, color: "bg-green-100", icon: <CashIcon /> },
            { title: "Reste à Encaisser", value: `${totalDue} €`, color: "bg-red-100", icon: <CreditCardIcon /> },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03 }}
              className={`${stat.color} rounded-2xl p-6 shadow-lg transition-all duration-300 flex justify-between items-center`}
            >
              <div>
                <p className="text-sm font-semibold text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white/50">{stat.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </select>
        </div>

        {/* Tableau des paiements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
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
              "& .MuiDataGrid-cell": { fontSize: "0.875rem" },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", fontWeight: "bold" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f1f5f9" },
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaiementPage;