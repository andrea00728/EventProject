import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
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

const backgroundImageUrl = "https://images.unsplash.com/photo-1542744095-291d1f67b221";

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
        `http://localhost:3000/orders/event/${eventId.eventId}`,
        { 
          params: { include: "table,items,items.menuItem" },
          headers: { Authorization: `Bearer ${token}` }
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

  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/orders/${orderId}/status`,
        { status: STATUS_MAPPING.frontToBack[newStatus] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const socket = io("http://localhost:3000", {
        auth: { userId: userId },
      });



      socket.emit("update_order_status", { orderId, status: newStatus });

      setSnackbar({
        open: true,
        message: response.data?.message || "Commande annulée avec succès.",
        severity: "success",
      });
      // Mettre à jour localement pour refléter le changement immédiatement
      updateCommande({ id: orderId, status: STATUS_MAPPING.frontToBack[newStatus] });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Erreur lors de l'annulation de la commande.",
        severity: "error",
      });
    }
  }, [token, updateCommande]);

  // useEffect(() => {
  //   fetchCommandes();
  //   fetchData();
  //   const onUpdateOrderStatus = (updatedOrder) => {
  //     setCommandes((prev) =>
  //       prev.map((cmd) =>
  //         cmd.id === updatedOrder.id
  //           ? {
  //               ...cmd,
  //               status:
  //                 STATUS_MAPPING.backToFront[updatedOrder.status] ||
  //                 updatedOrder.status,
  //             }
  //           : cmd
  //       )
  //     );
  //   };
  // }, [token]);

  // useEffect(() => {
  //   fetchCommandes();
  //   fetchData();
  //   const onUpdateOrderStatus = (updatedOrder) => {
  //     setCommandes((prev) =>
  //       prev.map((cmd) =>
  //         cmd.id === updatedOrder.id
  //           ? {
  //               ...cmd,
  //               status:
  //                 STATUS_MAPPING.backToFront[updatedOrder.status] ||
  //                 updatedOrder.status,
  //             }
  //           : cmd
  //       )
  //     );
  //   };
  // }, [token]);

  useEffect(() => {
    let socket;

    const initializeSocket = async () => {
      try {
        const UserId = await getUserIdForToken(token);
        socket = io("http://localhost:3000", {
          auth: { userId: UserId },
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
              table: order.table ? `Table ${order.table.numero}` : "N/A",
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

    fetchCommandes();
    initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log("🔌 WebSocket déconnecté");
      }
    };
  }, [token]);
  useEffect(() => {
    let socket;

    const initializeSocket = async () => {
      try {
        const UserId = await getUserIdForToken(token);
        socket = io("http://localhost:3000", {
          auth: { userId: UserId },
        });
        setUserId(UserId);

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

    fetchCommandes();
    initializeSocket();

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
          sx={{ fontWeight: "bold" }}
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
      field: "action",
      headerName: "Action",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isCanceled = params.row.status === "annuler";
        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Select
              value={isCanceled ? "annuler" : ""}
              onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
              size="small"
              disabled={isCanceled}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="" disabled>
                Sélectionner une action
              </MenuItem>
              <MenuItem value="annuler">Annuler</MenuItem>
            </Select>
          </div>
        );
      },
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