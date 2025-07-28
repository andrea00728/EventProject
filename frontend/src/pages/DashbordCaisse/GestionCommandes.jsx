import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import socket from "../../socket";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  TextField,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";
import { getUserIdForToken } from "../../services/userService";
import { io } from "socket.io-client";

const backgroundImageUrl =
  "https://images.unsplash.com/photo-1542744095-291d1f67b221";

const GestionCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const { token } = useStateContext();

  const STATUS_MAPPING = {
    frontToBack: {
      en_attente: "pending",
      preparation: "preparing",
      servir: "served",
      annuler: "canceled",
    },
    backToFront: {
      pending: "en_attente",
      preparing: "preparation",
      served: "servir",
      canceled: "annuler",
    },
  };

  const STATUS_OPTIONS = [
    { value: "en_attente", label: "En attente", color: "warning" },
    { value: "preparation", label: "Préparation", color: "info" },
    { value: "servir", label: "À servir", color: "success" },
    { value: "annuler", label: "Annulée", color: "error" },
  ];

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");
      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(
        `http://localhost:3000/orders/event/${eventId.eventId}`,
        { params: { include: "table,items,items.menuItem" } }
      );

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.numero}` : "N/A",
        total: c.total ? `€${c.total.toFixed(2)}` : "€0.00",
        itemsCount: c.items?.length || 0,
        date: new Date(c.orderDate).toLocaleString(),
        status: STATUS_MAPPING.backToFront[c.status] || c.status,
      }));

      setCommandes(formatted);
    } catch (err) {
      console.error("Erreur:", err);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des commandes.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    const UserId = await getUserIdForToken(token);

    const socket = io("http://localhost:3000", {
      auth: {
        userId: UserId, // très important : doit être l’ID réel de l’organisateur
      },
    });
    socket.on("connect", () => {
      console.log("✅ Connecté au serveur WebSocket");
    });

    // Pour écouter les mises à jour
    socket.on("order_status_updated", (data) => {
      updateCommande(data)
    });
  };

  const updateCommande = (update) => {
    setCommandes((prevCommandes) =>
      prevCommandes.map((cmd) =>
        cmd.id === update.id
          ? {
              ...cmd,
              ...update, // mise à jour partielle des champs
              status: STATUS_MAPPING.backToFront[update.status] || update.status,
            }
          : cmd
      )
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;

    try {
      await axios.delete(`http://localhost:3000/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommandes((prev) => prev.filter((cmd) => cmd.id !== id));
      setSnackbar({
        open: true,
        message: "Commande supprimée.",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "Erreur suppression:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          "Erreur serveur lors de la suppression",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchCommandes();
    fetchData();
    const onUpdateOrderStatus = (updatedOrder) => {
      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.id === updatedOrder.id
            ? {
                ...cmd,
                status:
                  STATUS_MAPPING.backToFront[updatedOrder.status] ||
                  updatedOrder.status,
              }
            : cmd
        )
      );
    };
  }, [token]); // on refresh si token change

  const filteredCommandes = commandes.filter((cmd) => {
    const matchStatus =
      selectedStatus === "all" || cmd.status === selectedStatus;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      cmd.nom.toLowerCase().includes(search) ||
      cmd.email.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70, sortable: true },
    { field: "nom", headerName: "Client", width: 150, sortable: true },
    { field: "email", headerName: "Email", width: 180, sortable: true },
    { field: "table", headerName: "Table", width: 100 },
    { field: "itemsCount", headerName: "Articles", width: 100, type: "number" },
    { field: "total", headerName: "Total", width: 100 },
    { field: "date", headerName: "Date", width: 180, sortable: true },
    {
      field: "status",
      headerName: "Statut",
      width: 160,
      renderCell: (params) => {
        const statusInfo = STATUS_OPTIONS.find(
          (s) => s.value === params.row.status
        );
        return (
          <Chip
            label={statusInfo?.label || params.row.status}
            color={statusInfo?.color || "default"}
            sx={{ fontWeight: "medium" }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDelete(params.row.id)}
          disabled={params.row.status === "annuler"}
        >
          Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 sm:p-10"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/30 backdrop-blur-xl rounded-xl shadow-lg max-w-7xl mx-auto p-6 sm:p-10"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-center drop-shadow-md mb-10">
          Gestion des Commandes
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-6"
        >
          <TextField
            size="small"
            placeholder="Rechercher client ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
              minWidth: 250,
            }}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            size="small"
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
              minWidth: 160,
            }}
          >
            <MenuItem value="all">Toutes les commandes</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>

          <Button
            onClick={fetchCommandes}
            variant="contained"
            size="small"
            sx={{ bgcolor: "#6b21a8", ":hover": { bgcolor: "#581c87" } }}
          >
            Actualiser
          </Button>

          <Link
            to="/caisse"
            className="text-white underline hover:text-gray-200 text-sm whitespace-nowrap"
          >
            ← Retour au Tableau de Bord
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <DataGrid
            rows={filteredCommandes}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
              },
            }}
          />
        </motion.div>
      </motion.div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GestionCommandesPage;