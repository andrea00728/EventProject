import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { useSocket } from "../../socket";
 
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

const PaiementPage = () => {
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

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");

      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(`http://localhost:3000/orders/event/${eventId.eventId}`, {
        params: { include: "table,items,items.menuItem" },
      });

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.numero}` : "N/A",
        total: parseFloat(c.total || 0).toFixed(2),
        amountPaid: parseFloat(c.amountPaid || 0).toFixed(2),
        createdAt: new Date(c.orderDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
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
    if (token) fetchCommandes();
    socket.on("orderUpdated", fetchCommandes);
    return () => socket.off("orderUpdated", fetchCommandes);
  }, [token]);

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
      socket.emit("paymentStatusChanged", { id, paymentStatus: backendStatus });
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

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
      } catch (error) {
        console.error("Erreur lors du traitement du paiement :", error);
      }
    }
  };

  // Fonction pour générer le tableau HTML des items de la commande (pour la facture)
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

  const handlePrintInvoice = async (row) => {
    const date = new Date(row.createdAt);
    const year = date.getFullYear();

    // Fonction pour formater le numéro séquentiel avec 5 chiffres (ex: 00001)
    const padSequential = (num) => num.toString().padStart(5, "0");

    // Récupérer le prochain numéro séquentiel depuis le backend
    let sequentialNumber = row.id; // Fallback utilisant l'ID de la commande
    try {
      const response = await axios.get(`http://localhost:3000/invoices/next-sequence`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      sequentialNumber = response.data.nextSequence; // Supposons que l'API renvoie le prochain numéro
    } catch (error) {
      console.error("Erreur lors de la récupération du numéro séquentiel :", error);
      // Fallback : utiliser l'ID de la commande si l'API échoue
    }

    // Générer le numéro de facture au format FACT-YYYY-NNNNN
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
        const bgColor = isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
        return (
          <select
            value={row.paymentStatus}
            onChange={(e) => handlePaymentStatusChange(row.id, e.target.value)}
            className={`w-full rounded-md py-1.5 px-3 text-sm font-semibold ${bgColor} border-none`}
          >
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </select>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleProcessPayment(row.id)}
            disabled={row.paymentStatus === "paye"}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1.5 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Payer
          </button>
          <button
            onClick={() => handlePrintInvoice(row)}
            className="border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-md"
          >
            Facture
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/pexels-karolina-grabowska-4475523.jpg')" }}
    >
      {/* Fond plus clair avec overlay blanc semi-transparent */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Gestion des Paiements</h1>
          <Link to="/caisse" className="text-indigo-600 font-medium hover:underline">
            ← Retour
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center hover:shadow-lg transition">
            <div>
              <p className="text-gray-500 text-sm">Total encaissé</p>
              <p className="text-3xl font-bold text-gray-900">{totalPaid} €</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CashIcon />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center hover:shadow-lg transition">
            <div>
              <p className="text-gray-500 text-sm">Reste à encaisser</p>
              <p className="text-3xl font-bold text-gray-900">{totalDue} €</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <CreditCardIcon />
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous</option>
            <option value="paye">Payé</option>
            <option value="non_paye">Non Payé</option>
          </select>
        </div>

        {/* DataGrid */}
        <div className="bg-white rounded-2xl shadow-md p-4" style={{ width: "100%" }}>
          <DataGrid
            rows={filteredCommandes}
            columns={columns}
            loading={loading}
            disableSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
          />
        </div>
      </div>
    </div>
  );
};

export default PaiementPage;