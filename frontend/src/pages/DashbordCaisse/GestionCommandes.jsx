import React, { useEffect, useState, useMemo } from "react";
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
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { motion } from "framer-motion";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";
import { debounce } from "lodash";


const backgroundImageUrl = "https://images.unsplash.com/photo-1542744095-291d1f67b221";

const GestionCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState(null); // "order" or "table"
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
      if (!token) throw new Error("Veuillez vous connecter.");
      const eventId = await getEventIdByEmail(token).catch((err) => {
        throw new Error("Erreur lors de la récupération de l'événement: " + err.message);
      });
      const { data } = await axios.get(`${API_URL}/orders/event/${eventId.eventId}`, {
        params: { include: "table,items,items.menuItem" },
      });

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.nom}` : "N/A", // Changé de numero à nom
        tableId: c.table?.id || null, // Ajout de l'ID de la table
        total: c.total ? `€${c.total.toFixed(2)}` : "€0.00",
        itemsCount: c.items?.length || 0,
        date: new Date(c.orderDate).toLocaleString(),
        status: STATUS_MAPPING.backToFront[c.status] || "inconnu",
      }));

      setCommandes(formatted);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      if (!token) throw new Error("Veuillez vous connecter.");
      const eventId = await getEventIdByEmail(token).catch((err) => {
        throw new Error("Erreur lors de la récupération de l'événement: " + err.message);
      });
      const { data } = await axios.get(`${API_URL}/tables/event/${eventId.eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(data);
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de la récupération des tables: " + err.message, severity: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteType === "order") {
        await axios.delete(`${API_URL}/orders/${deleteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommandes((prev) => prev.filter((cmd) => cmd.id !== deleteId));
        setSnackbar({ open: true, message: "Commande supprimée.", severity: "success" });
      } else if (deleteType === "table") {
        await axios.delete(`${API_URL}/tables/${deleteId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTables((prev) => prev.filter((table) => table.id !== deleteId));
        setCommandes((prev) =>
          prev.map((cmd) =>
            cmd.tableId === deleteId ? { ...cmd, table: "N/A", tableId: null } : cmd
          )
        );
        setSnackbar({ open: true, message: "Table supprimée.", severity: "success" });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Erreur serveur lors de la suppression ${deleteType === "order" ? "de la commande" : "de la table"}`,
        severity: "error",
      });
    } finally {
      setOpenDialog(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleDeleteClick = (id, type) => {
    setDeleteId(id);
    setDeleteType(type);
    setOpenDialog(true);
  };

  useEffect(() => {
    fetchCommandes();
    fetchTables();

    const onUpdateOrderStatus = (updatedOrder) => {
      setCommandes((prev) =>
        prev.map((cmd) =>
          cmd.id === updatedOrder.id
            ? {
                ...cmd,
                status: STATUS_MAPPING.backToFront[updatedOrder.status] || "inconnu",
              }
            : cmd
        )
      );
    };

    socket.on("connect", () => console.log("Connecté au serveur WebSocket"));
    socket.on("connect_error", () => {
      setSnackbar({ open: true, message: "Connexion WebSocket perdue.", severity: "warning" });
    });
    socket.on("updateOrderStatus", onUpdateOrderStatus);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("updateOrderStatus", onUpdateOrderStatus);
    };
  }, [token]);

  const filteredCommandes = useMemo(() => {
    return commandes.filter((cmd) => {
      const matchStatus = selectedStatus === "all" || cmd.status === selectedStatus;
      const search = searchTerm.toLowerCase();
      const matchSearch =
        cmd.nom.toLowerCase().includes(search) || cmd.email.toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });
  }, [commandes, selectedStatus, searchTerm]);

  const handleSearchChange = debounce((value) => {
    setSearchTerm(value);
  }, 300);

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
        const statusInfo = STATUS_OPTIONS.find((s) => s.value === params.row.status);
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
      width: 200,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDeleteClick(params.row.id, "order")}
            disabled={params.row.status === "annuler"}
            aria-label={`Supprimer la commande ${params.row.id}`}
          >
            Supprimer Commande
          </Button>
          {params.row.tableId && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteClick(params.row.tableId, "table")}
              aria-label={`Supprimer la table ${params.row.tableId}`}
            >
              Supprimer Table
            </Button>
          )}
        </div>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Rechercher des commandes par client ou email"
            sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1, minWidth: 250 }}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            size="small"
            sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1, minWidth: 160 }}
            aria-label="Filtrer par statut"
          >
            <MenuItem value="all">Toutes les commandes</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>

          <Button
            onClick={() => {
              fetchCommandes();
              fetchTables();
            }}
            variant="contained"
            size="small"
            sx={{ bgcolor: "#6b21a8", ":hover": { bgcolor: "#581c87" } }}
            aria-label="Actualiser les commandes et tables"
          >
            Actualiser
          </Button>

          <Link
            to="/caisse"
            className="text-white underline hover:text-gray-200 text-sm whitespace-nowrap"
            aria-label="Retour au tableau de bord"
          >
            ← Retour au Tableau de Bord
          </Link>
        </motion.div>

        {loading && (
          <div className="flex justify-center my-4">
            <CircularProgress />
          </div>
        )}

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
              "& .MuiDataGrid-cell": { fontSize: "0.875rem" },
              minWidth: 0,
              width: "100%",
            }}
            autoHeight
          />
        </motion.div>
      </motion.div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer {deleteType === "order" ? "cette commande" : "cette table"} ?
            {deleteType === "table" && " Cela affectera toutes les commandes associées."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

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