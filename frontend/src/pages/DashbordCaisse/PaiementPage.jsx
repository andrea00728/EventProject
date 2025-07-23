import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Button, MenuItem, Select } from "@mui/material";
import socket from "../../socket";
import { useStateContext } from "../../context/ContextProvider";
import { Link } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";

const PaiementPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useStateContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const PAYMENT_STATUS_MAPPING = {
    frontToBack: {
      paye: "paid",
      non_paye: "unpaid",
    },
    backToFront: {
      paid: "paye",
      unpaid: "non_paye",
    },
  };

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");

      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(
        `http://localhost:3000/orders/event/${eventId.eventId}`,
        {
          params: {
            include: "table,items,items.menuItem",
          },
        }
      );

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.numero}` : "N/A",
        total: c.total ? parseFloat(c.total).toFixed(2) : "0.00",
        amountPaid: c.amountPaid ? parseFloat(c.amountPaid).toFixed(2) : "0.00",
        createdAt: new Date(c.orderDate).toLocaleString(),
        paymentStatus:
          PAYMENT_STATUS_MAPPING.backToFront[c.paymentStatus] || "non_paye",
      }));

      setCommandes(formatted);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on("orderUpdated", fetchCommandes);
    return () => socket.off("orderUpdated");
  }, []);

  const handlePaymentStatusChange = async (id, newStatus) => {
    try {
      const backendStatus = PAYMENT_STATUS_MAPPING.frontToBack[newStatus];
      await axios.patch(
        `http://localhost:3000/orders/${id}/payment`,
        { paymentStatus: backendStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.id === id ? { ...cmd, paymentStatus: newStatus } : cmd
        )
      );
      socket.emit("paymentStatusChanged", { id, paymentStatus: backendStatus });
    } catch (error) {
      console.error("Erreur lors du changement de statut :", error);
    }
  };

  const handleProcessPayment = async (id) => {
    const row = commandes.find((c) => c.id === id);
    await axios.post(`http://localhost:3000/paiement/create`, {
      eventId: id,
      amount: row.total,
    });
    fetchCommandes();
  };

  const totalPaid = commandes
    .reduce((sum, c) => sum + parseFloat(c.amountPaid || 0), 0)
    .toFixed(2);

  const totalDue = commandes
    .reduce(
      (sum, c) =>
        sum + (c.paymentStatus === "non_paye" ? parseFloat(c.total || 0) : 0),
      0
    )
    .toFixed(2);

  const filteredCommandes = commandes.filter((c) => {
    const matchSearch =
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" || c.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nom", headerName: "Nom", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "table", headerName: "Table", width: 100 },
    { field: "total", headerName: "Total (€)", width: 100 },
    { field: "amountPaid", headerName: "Payé (€)", width: 100 },
    { field: "createdAt", headerName: "Date", width: 180 },
    {
      field: "paymentStatus",
      headerName: "Statut Paiement",
      width: 160,
      renderCell: ({ row }) => (
        <Select
          value={row.paymentStatus}
          onChange={(e) =>
            handlePaymentStatusChange(row.id, e.target.value)
          }
          size="small"
          sx={{
            backgroundColor:
              row.paymentStatus === "paye" ? "#d1fae5" : "#fee2e2",
            borderRadius: "6px",
            minWidth: "120px",
          }}
        >
          <MenuItem value="paye">Payé</MenuItem>
          <MenuItem value="non_paye">Non Payé</MenuItem>
        </Select>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            size="small"
            onClick={() => handleProcessPayment(row.id)}
            disabled={row.paymentStatus === "paye"}
            className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded-md"
          >
            Payer
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => window.print()}
            className="!rounded-md"
          >
            Facture
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-4">
        <Link
          to="/caisse"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
        >
          ⬅️ Retour au Tableau de Bord
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        💳 Gestion des paiements
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 w-full md:w-1/3 shadow-sm"
        />

        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
          className="w-full md:w-48"
        >
          <MenuItem value="all">Tous</MenuItem>
          <MenuItem value="paye">Payé</MenuItem>
          <MenuItem value="non_paye">Non Payé</MenuItem>
        </Select>
      </div>

      <div className="mb-6 text-gray-700 text-lg font-medium">
        Total encaissé : {totalPaid} € — Reste à encaisser : {totalDue} €
      </div>

      <div className="bg-white shadow-lg rounded-xl p-4">
        <DataGrid
          rows={filteredCommandes}
          columns={columns}
          loading={loading}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          className="bg-white"
        />
      </div>
    </div>
  );
};

export default PaiementPage;
