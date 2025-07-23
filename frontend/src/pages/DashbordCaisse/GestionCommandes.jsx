import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import socket from "../../socket";
import { DataGrid } from "@mui/x-data-grid";
import { Button, MenuItem, Select } from "@mui/material";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";

const GestionCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const {token} = useStateContext();



  const STATUS_MAPPING = {
    frontToBack: {
      en_attente: "pending",
      preparation: "preparing",
      servir: "served",
      annuler: "canceled"
    },
    backToFront: {
      pending: "en_attente",
      preparing: "preparation",
      served: "servir", 
      canceled: "annuler"
    }
  };

  const STATUS_OPTIONS = [
    { value: "en_attente", label: "En attente" },
    { value: "preparation", label: "Préparation" },
    { value: "servir", label: "À servir" },
    { value: "annuler", label: "Annulée" }
  ];

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error ('Token manquqnt');
      const eventId = await getEventIdByEmail(token);
      console.log(eventId);
      const { data } = await axios.get(`http://localhost:3000/orders/event/${eventId.eventId}`, {
        params: {
          include: 'table,items,items.menuItem'
        }
      });
      console.log (data);

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.numero}` : "N/A",
        total: c.total ? `€${c.total.toFixed(2)}` : "€0.00",
        itemsCount: c.items?.length || 0,
        date: new Date(c.orderDate).toLocaleString(),
        status: STATUS_MAPPING.backToFront[c.status] || c.status
      }));

      setCommandes(formatted);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const backendStatus = STATUS_MAPPING.frontToBack[newStatus];
      await axios.patch(`http://localhost:3000/orders/${id}/status`, { status: backendStatus });

      setCommandes((prev) =>
        prev.map((cmd) => (cmd.id === id ? { ...cmd, status: newStatus } : cmd))
      );

      socket.emit("statusChanged", { id, status: backendStatus });
    } catch (err) {
      console.error("Erreur MAJ statut:", err);
      fetchCommandes();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;

    try {
      await axios.delete(`http://localhost:3000/orders/${id}`);
      setCommandes((prev) => prev.filter((cmd) => cmd.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  useEffect(() => {
    fetchCommandes();
    socket.on("orderUpdated", (updated) => {
      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.id === updated.id
            ? { ...cmd, status: STATUS_MAPPING.backToFront[updated.status] || updated.status }
            : cmd
        )
      );
    });
    return () => socket.off("orderUpdated");
  }, []);

  const filteredCommandes = selectedStatus === "all"
    ? commandes
    : commandes.filter((cmd) => cmd.status === selectedStatus);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nom", headerName: "Client", width: 150 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "table", headerName: "Table", width: 100 },
    { field: "itemsCount", headerName: "Articles", width: 100 },
    { field: "total", headerName: "Total", width: 100 },
    { field: "date", headerName: "Date", width: 180 },
    {
      field: "status",
      headerName: "Statut",
      width: 150,
      renderCell: (params) => (
        <Select
          size="small"
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          disabled={params.row.status === "annuler"}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
          disabled={params.row.status === "annuler"}
        >
          Supprimer
        </Button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Gestion des Commandes</h2>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            size="small"
          >
            <MenuItem value="all">Toutes les commandes</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>

          <Button onClick={fetchCommandes} variant="contained" color="primary" size="small">
            Actualiser
          </Button>

          <Link
            to="/caisse"
            className="text-blue-600 text-sm underline hover:text-blue-800"
          >
            ← Retour au Tableau de Bord
          </Link>
        </div>
      </div>

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={filteredCommandes}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default GestionCommandesPage;
