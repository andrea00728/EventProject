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
import { FaArrowLeft, FaSync, FaTimes, FaSearch } from "react-icons/fa";
import { SOCKET_URL } from "../../socket";

const GestionCommandesPage = () => {
  // Déclarations d'état pour la gestion des commandes et de l'UI
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCanceled, setShowCanceled] = useState(false);
  const [userId, setUserId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const { token } = useStateContext();

  // Mappage des statuts pour la cohérence entre le front-end et le back-end
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

  // Options de statut avec leurs couleurs pour un rendu visuel
  const STATUS_OPTIONS = [
    { value: "en_attente", label: "En attente", color: "warning" },
    { value: "preparation", label: "Préparation", color: "info" },
    { value: "servir", label: "À servir", color: "success" },
    { value: "annuler", label: "Annulée", color: "error" },
  ];

  // Fonction pour récupérer les commandes depuis l'API
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

  // Fonction pour mettre à jour une commande dans l'état local
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

  // Fonction pour annuler une commande via l'API et le socket
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
          message: response.data?.message || "Commande annulée avec succès.",
          severity: "success",
        });
        updateCommande({ id: orderId, status: STATUS_MAPPING.frontToBack[newStatus] });
      } catch (error) {
        console.error("Erreur lors de l'annulation de la commande:", error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Erreur lors de l'annulation de la commande.",
          severity: "error",
        });
      }
    },
    [token, updateCommande, userId]
  );

  // Effet pour initialiser les données et la connexion WebSocket
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
            return [formattedOrder, ...prevCommandes]; // Ajoute la nouvelle commande en haut
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

  // Filtrage des commandes en fonction de la sélection de l'utilisateur
  const filteredCommandes = commandes.filter((cmd) => {
    const matchStatus =
      selectedStatus === "all"
        ? showCanceled
          ? true
          : cmd.status !== "annuler"
        : cmd.status === selectedStatus;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      cmd.nom.toLowerCase().includes(search) || cmd.email.toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  // Définition des colonnes pour le DataGrid
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
          className="font-medium rounded-full"
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
              className="font-medium px-3 py-1 rounded-full"
            />
          </div>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isCanceled = params.row.status === "annuler";

        return (
          <div className="flex items-center h-full space-x-2">
            {!isCanceled && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusChange(params.row.id, "annuler")}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium rounded-full px-3 py-1.5 text-sm shadow-md hover:from-red-600 hover:to-rose-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                aria-label="Annuler la commande"
              >
                <FaTimes className="inline-block" />
              </motion.button>
            )}
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
      className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter"
    >
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* En-tête avec titre et bouton de retour */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Tableau de Bord des Commandes
          </h2>
          <Link
            to="/caisse"
            className="flex items-center px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 transition-all duration-300"
            aria-label="Retour à la caisse"
          >
            <FaArrowLeft className="mr-2" />
            Retour
          </Link>
        </div>

        {/* Filtres et actions de la barre d'outils */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between border border-gray-100">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FaSearch />
            </div>
            <input
              type="text"
              placeholder="Rechercher client ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all duration-300"
            />
          </div>
          <div className="flex-grow flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none bg-gray-50 text-gray-800 transition-all duration-300"
            >
              <option value="all">Tous les statuts</option>
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
              className="flex items-center justify-center w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300"
            >
              <FaSync className="mr-2" />
              Actualiser
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCanceled(!showCanceled)}
              className={`flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-full shadow-lg transition-all duration-300 ${
                showCanceled
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-label={showCanceled ? "Masquer les commandes annulées" : "Afficher les commandes annulées"}
            >
              <span className="mr-2">
                {showCanceled ? <FaTimes /> : <FaSync />}
              </span>
              {showCanceled ? "Masquer Commandes Annulées" : "Voir Commandes Annulées"}
            </motion.button>
          </div>
        </div>

        {/* Grille de données avec un style amélioré */}
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
            autoHeight
            className="border-none"
            sx={{
              "& .MuiDataGrid-cell": {
                fontSize: "0.875rem",
                color: "#4b5563",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f9fafb",
                color: "#1f2937",
                fontWeight: "bold",
                borderBottom: "2px solid #e5e7eb",
              },
              "& .MuiDataGrid-row": {
                transition: "background-color 0.2s ease",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f3f4f6",
              },
            }}
          />
        </motion.div>
      </div>

      {/* Snackbar pour les notifications */}
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

export default GestionCommandesPage;