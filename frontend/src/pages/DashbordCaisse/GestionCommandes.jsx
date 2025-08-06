import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { io } from "socket.io-client";
import { DataGrid } from "@mui/x-data-grid";
import { Snackbar, Alert, Chip } from "@mui/material";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";
import { getUserIdForToken } from "../../services/userService";
import { FaArrowLeft, FaSync, FaTimes } from "react-icons/fa";
import { SOCKET_URL } from "../../socket";

const GestionCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
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

  const fetchCommandes = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");

      const eventId = await getEventIdByEmail(token);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/orders/event/${eventId.eventId}`,
        {
          params: { include: "table,items,items.menuItem" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const formatted = data.map((c) => ({
        id: c.id,
        nom: c.nom || "Anonyme",
        email: c.email || "-",
        table: c.table ? `Table ${c.table.nom}` : "N/A",
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
  }, [token]);

  const updateCommande = useCallback((update) => {
    setCommandes((prevCommandes) =>
      prevCommandes.map((cmd) =>
        cmd.id === update.id
          ? {
              ...cmd,
              ...update,
              status: STATUS_MAPPING.backToFront[update.status] || update.status,
            }
          : cmd
      )
    );
  }, []);

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        const response = await axios.patch(
          `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`,
          { status: STATUS_MAPPING.frontToBack[newStatus] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const socket = io(SOCKET_URL, {
          auth: { userId },
        });

        socket.emit("update_order_status", { orderId, status: newStatus });

        setSnackbar({
          open: true,
          message: response.data?.message || "Commande mise à jour avec succès.",
          severity: "success",
        });
        updateCommande({ id: orderId, status: STATUS_MAPPING.frontToBack[newStatus] });
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Erreur lors de la mise à jour de la commande.",
          severity: "error",
        });
      }
    },
    [token, updateCommande]
  );

  useEffect(() => {
    let socket;

    const setupWebSocket = async () => {
      try {
        const fetchedUserId = await getUserIdForToken(token);
        setUserId(fetchedUserId);

        socket = io(SOCKET_URL, {
          auth: { userId: fetchedUserId },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
          console.log("✅ Connecté au serveur WebSocket");
        });

        socket.on("order_status_updated", (data) => {
          updateCommande(data);
        });

        socket.on("new_order", (order) => {
          console.log("Nouvelle commande reçue:", order);
          setCommandes((prevCommandes) => {
            if (prevCommandes.some((cmd) => cmd.id === order.id)) {
              console.log(`Commande ${order.id} déjà présente, ignorée.`);
              return prevCommandes;
            }
            const formattedOrder = {
              id: order.id,
              nom: order.nom || "Anonyme",
              email: order.email || "-",
              table: order.table ? `Table ${order.table.nom}` : "N/A",
              total: order.total ? `€${order.total.toFixed(2)}` : "€0.00",
              itemsCount: order.items?.length || 0,
              date: new Date(order.orderDate).toLocaleString(),
              status: STATUS_MAPPING.backToFront[order.status] || order.status,
            };
            return [...prevCommandes, formattedOrder];
          });
        });

        socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          setSnackbar({
            open: true,
            message: "Erreur de connexion WebSocket.",
            severity: "error",
          });
        });
      } catch (err) {
        console.error("Erreur lors de l'initialisation du socket:", err);
      }
    };

    const loadData = async () => {
      await fetchCommandes();
      await setupWebSocket();
    };

    loadData();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log("🔌 WebSocket déconnecté");
      }
    };
  }, [token, fetchCommandes, updateCommande]);

  const filteredCommandes = commandes.filter((cmd) => {
    const matchStatus = selectedStatus === "all" || cmd.status === selectedStatus;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      cmd.nom.toLowerCase().includes(search) || cmd.email.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 70, sortable: true },
    { field: "nom", headerName: "Client", width: 150, sortable: true },
    { field: "email", headerName: "Email", width: 180, sortable: true },
    {
      field: "table",
      headerName: "Table",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "N/A" ? "default" : "primary"}
          size="small"
          className="font-medium"
        />
      ),
    },
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
          <div className="flex items-center h-full">
            <Chip
              label={statusInfo?.label || params.row.status}
              color={statusInfo?.color || "default"}
              size="small"
              className="font-medium px-3 py-1"
            />
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isCanceled = params.row.status === "annuler";
        return (
          <div className="flex items-center h-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStatusChange(params.row.id, "annuler")}
              disabled={isCanceled}
              className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                isCanceled
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300"
              }`}
              aria-label="Annuler la commande"
            >
              <FaTimes className="mr-2" />
              Annuler
            </motion.button>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Gestion des Commandes
          </h2>
          <Link
            to="/caisse"
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
            aria-label="Retour à la caisse"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </Link>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-center border border-gray-100">
          <input
            type="text"
            placeholder="Rechercher client ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300"
          >
            <option value="all">Toutes les commandes</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchCommandes}
            className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
          >
            <FaSync className="mr-2" />
            Actualiser
          </motion.button>
        </div>

        {/* Data Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          <DataGrid
            rows={filteredCommandes}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            className="border-none"
            sx={{
              "& .MuiDataGrid-cell": { fontSize: "0.875rem", color: "#1f2937" },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8fafc",
                color: "#1f2937",
                fontWeight: "bold",
                borderBottom: "2px solid #e5e7eb",
              },
              "& .MuiDataGrid-row": {
                transition: "background-color 0.2s ease",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          />
        </motion.div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          className="w-full shadow-lg"
          sx={{
            background: snackbar.severity === "success"
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

export default GestionCommandesPage;