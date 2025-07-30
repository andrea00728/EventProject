import React, { useEffect, useState } from "react";
import {
  MdDashboard,
  MdBarChart,
  MdFastfood,
  MdFileDownload,
  MdAssignment,
  MdPendingActions,
  MdKitchen,
  MdDoneAll,
  MdPerson,
  MdError,
  MdLogout,
  MdKeyboardArrowDown,
  MdArrowBack,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  getAllOrdersForOnEvent,
  updateOrderStatus,
} from "../../services/orders";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";
import { io } from "socket.io-client";
import { getUserIdForToken } from "../../services/userService";
import OrderList from "./OrderList";
import Spinner from "./Spinner";
import BurgerMenu from "./BurgerMenu";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function DashboardpersCuisine() {
  const [activeTab, setActiveTab] = useState("commandes");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandes, setCommandes] = useState([]);
  const [canceledCommandes, setCanceledCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const { user, token, setToken, setUser } = useStateContext();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!token) throw new Error("Token manquant");

        const eventId = await getEventIdByEmail(token);
        const data = await getAllOrdersForOnEvent(eventId.eventId);

        setLoading(true);
        setError(null);
        setCommandes(data.filter((order) => order.status !== "canceled"));
        setCanceledCommandes(data.filter((order) => order.status === "canceled"));
      } catch (error) {
        console.error("Erreur : ", error);
        setError("Impossible de charger les commandes.");
      } finally {
        setLoading(false);
      }
    };

    const fetchData = async () => {
      try {
        const UserId = await getUserIdForToken(token);
        setUserId(UserId);

        const newSocket = io("http://localhost:3000", {
          auth: { userId: UserId },
          transports: ["websocket"],
          cors: { origin: "http://localhost:5173" },
        });

        newSocket.on("connect", () => {
          console.log("✅ Connecté au serveur WebSocket");
        });

        newSocket.on("new_order", (order) => {
          console.log("Nouvelle commande reçue:", order);
          if (order.status === "canceled") {
            setCanceledCommandes((prev) => {
              if (prev.some((cmd) => cmd.id === order.id)) {
                console.log(`Commande annulée ${order.id} déjà présente, ignorée.`);
                return prev;
              }
              return [...prev, order];
            });
          } else {
            setCommandes((prevCommandes) => {
              if (prevCommandes.some((cmd) => cmd.id === order.id)) {
                console.log(`Commande ${order.id} déjà présente, ignorée.`);
                return prevCommandes;
              }
              return [...prevCommandes, order];
            });
          }
        });

        newSocket.on("error", (error) => {
          console.log("Erreur WebSocket:", error);
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
          console.log("WebSocket déconnecté");
          setSocket(null);
        };
      } catch (error) {
        console.error("Erreur lors de la récupération de l'userId:", error);
      }
    };

    fetchOrders();
    fetchData();
  }, [token]);

  const changeDataBaseStatus = async (id, status) => {
    await updateOrderStatus(id, status, token);
  };

  const changerStatut = async (id, direction = "next") => {
    if (!socket) {
      console.error("Socket non disponible");
      return;
    }

    const updatedOrder = commandes.find((c) => c.id === id);
    let newStatus = updatedOrder.status;

    if (direction === "next") {
      if (newStatus === "pending") newStatus = "preparing";
      else if (newStatus === "preparing") newStatus = "served";
    } else if (direction === "prev" && newStatus === "preparing") {
      newStatus = "pending";
    }

    if (newStatus !== updatedOrder.status) {
      socket.emit("update_order_status", { id, status: newStatus });
      await changeDataBaseStatus(id, newStatus);
      setCommandes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    }
  };

  const exporterExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      [...commandes, ...canceledCommandes].map((commande) => ({
        ID: commande.id,
        "Nom du client": commande.nom,
        Table: commande.table.nom,
        "Date de commande": formatDateTime(commande.orderDate),
        Plats: commande.items
          .map((p) => `${p.menuItem.name} (x${p.quantity})`)
          .join(", "),
        Statut: commande.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
    XLSX.writeFile(workbook, "commandes_evenement.xlsx");
  };

  const handleLogoutInitiate = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setToken(null);
    setUser(null);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const stats = {
    total: commandes.length + canceledCommandes.length,
    pending: commandes.filter((c) => c.status === "pending").length,
    preparing: commandes.filter((c) => c.status === "preparing").length,
    served: commandes.filter((c) => c.status === "served").length,
    canceled: canceledCommandes.length,
  };

  const filteredOrders =
    selectedStatus === "total"
      ? [...commandes, ...canceledCommandes]
      : selectedStatus === "canceled"
      ? canceledCommandes
      : commandes.filter((c) => c.status === selectedStatus);

  const statusLabels = {
    total: "Toutes les commandes",
    pending: "Commandes en attente",
    preparing: "Commandes en préparation",
    served: "Commandes servies",
    canceled: "Commandes annulées",
  };

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-[#fafafa]">
        {/* Burger Menu Button */}
        <div className="md:hidden p-4">
          <BurgerMenu sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Sidebar */}
        <motion.div
          className={`fixed md:static top-0 left-0 h-full bg-white p-4 shadow-xl rounded-r-2xl md:w-64 z-40 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col items-center mb-8 p-4 bg-[#f9f9f9] rounded-xl border border-gray-200 shadow">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex flex-col items-center focus:outline-none group"
            >
              <img
                src={`${user.photo}`}
                alt="Utilisateur"
                className="w-20 h-20 rounded-full border-4 border-white shadow-md mb-2"
              />
              <div className="flex items-center gap-1">
                <p className="font-semibold text-gray-800 text-center text-lg">
                  {user.name}
                </p>
                <MdKeyboardArrowDown
                  className={`text-xl text-gray-600 transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 bg-white border border-gray-200 rounded-xl shadow-lg w-full"
                >
                  <button
                    onClick={handleLogoutInitiate}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 rounded-t-xl flex items-center gap-2 transition"
                  >
                    <MdLogout className="text-xl" />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <nav className="flex flex-col space-y-4">
            <button
              onClick={() => {
                setActiveTab("commandes");
                setSidebarOpen(false);
                setSelectedStatus(null);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg font-semibold text-left transition ${
                activeTab === "commandes"
                  ? "bg-[#cfc6c4] text-black shadow"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <MdDashboard className="text-2xl" />
              Commandes récentes
            </button>
            <button
              onClick={() => {
                setActiveTab("stats");
                setSidebarOpen(false);
                setSelectedStatus(null);
              }}
              className={`flex items-center gap-3 p-3 rounded-lg font-semibold text-left transition ${
                activeTab === "stats"
                  ? "bg-[#cfc6c4] text-black shadow"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
            >
              <MdBarChart className="text-2xl" />
              Statistiques
            </button>
          </nav>
        </motion.div>

        {/* Overlay for mobile when sidebar is open */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black md:hidden z-30"
              onClick={() => setSidebarOpen(false)}
            ></motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "commandes" && (
              <motion.div
                key="commandes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="pb-10"
              >
                <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#333] flex items-center gap-3">
                  <MdFastfood />
                  Commandes récentes
                </h1>

                {loading ? (
                  <Spinner />
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-xl shadow-md border border-red-300">
                    <div className="flex items-center space-x-3">
                      <MdError className="text-6xl text-red-500 animate-pulse" />
                      <h2 className="text-2xl font-bold text-red-700">
                        Une erreur est survenue
                      </h2>
                    </div>
                    <p className="mt-4 text-center text-md text-red-600 font-medium max-w-xl">
                      {error}
                    </p>
                  </div>
                ) : (
                  <>
                    <OrderList
                      commandes={commandes}
                      changerStatut={changerStatut}
                    />
                    <h2 className="text-2xl md:text-3xl font-extrabold mt-12 mb-6 text-[#333] flex items-center gap-3">
                      <MdFastfood />
                      Commandes annulées
                    </h2>
                    {canceledCommandes.length > 0 ? (
                      <OrderList
                        commandes={canceledCommandes}
                        changerStatut={() => {}}
                      />
                    ) : (
                      <p className="text-gray-600 text-center">
                        Aucune commande annulée.
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-full pb-10"
              >
                {selectedStatus ? (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <h1 className="text-3xl md:text-4xl font-extrabold text-[#333] flex items-center gap-3">
                        <MdBarChart />
                        {statusLabels[selectedStatus]}
                      </h1>
                      <button
                        onClick={() => setSelectedStatus(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold shadow flex items-center gap-2 transition transform hover:scale-105"
                      >
                        <MdArrowBack className="text-xl" />
                        Retour
                      </button>
                    </div>
                    {filteredOrders.length > 0 ? (
                      <OrderList
                        commandes={filteredOrders}
                        changerStatut={selectedStatus === "canceled" ? () => {} : changerStatut}
                      />
                    ) : (
                      <p className="text-gray-600 text-center">
                        Aucune commande pour ce statut.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#333] flex items-center gap-3">
                      <MdBarChart />
                      Statistiques des commandes
                    </h1>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={exporterExcel}
                        className="bg-[#cfc6c4] hover:bg-[#b9aeac] px-4 py-2 rounded-lg font-semibold text-black shadow flex items-center gap-2"
                      >
                        Liste des commandes <MdFileDownload className="text-xl" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <button
                        onClick={() => setSelectedStatus("total")}
                        className="bg-white p-6 rounded-lg shadow flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <MdAssignment className="text-4xl text-gray-600" />
                        <div>
                          <p className="text-gray-600">Total commandes</p>
                          <h2 className="text-2xl font-bold">{stats.total}</h2>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedStatus("pending")}
                        className="bg-white p-6 rounded-lg shadow flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <MdPendingActions className="text-4xl text-yellow-500" />
                        <div>
                          <p className="text-gray-600">En attente</p>
                          <h2 className="text-2xl font-bold">{stats.pending}</h2>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedStatus("preparing")}
                        className="bg-white p-6 rounded-lg shadow flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <MdKitchen className="text-4xl text-orange-500" />
                        <div>
                          <p className="text-gray-600">En préparation</p>
                          <h2 className="text-2xl font-bold">{stats.preparing}</h2>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedStatus("served")}
                        className="bg-white p-6 rounded-lg shadow flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <MdDoneAll className="text-4xl text-green-600" />
                        <div>
                          <p className="text-gray-600">Servies</p>
                          <h2 className="text-2xl font-bold">{stats.served}</h2>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedStatus("canceled")}
                        className="bg-white p-6 rounded-lg shadow flex items-center gap-4 hover:bg-gray-50 transition"
                      >
                        <MdError className="text-4xl text-red-600" />
                        <div>
                          <p className="text-gray-600">Annulées</p>
                          <h2 className="text-2xl font-bold">{stats.canceled}</h2>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showLogoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Confirmation de déconnexion
                </h2>
                <p className="text-gray-700 mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter ?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleLogoutConfirm}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition transform hover:scale-105"
                  >
                    Oui, déconnecter
                  </button>
                  <button
                    onClick={handleLogoutCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg shadow-md transition transform hover:scale-105"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}