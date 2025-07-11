import React, { useEffect, useState } from "react";
import {
  MdDashboard,
  MdBarChart,
  MdFastfood,
  MdTableRestaurant,
  MdFileDownload,
  MdPendingActions,
  MdKitchen,
  MdDoneAll,
  MdMenu,
  MdAssignment,
  MdPerson,
  MdError,
  MdHourglassEmpty,
  MdLogout,
  MdKeyboardArrowDown
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import {
  getAllOrdersForOnEvent,
  updateOrderStatus,
} from "../../services/orders";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

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
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: "Utilisateur Gmail",
    photo: "https://via.placeholder.com/50", // Remplace par l'URL de la photo Gmail après connexion réelle
  });

  useEffect(() => {
    const fetchOrders = async (idEvent = 1) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllOrdersForOnEvent(idEvent);
        setCommandes(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        setError("Impossible de charger les commandes.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    socket.on("updateStatus", (updatedOrder) => {
      setCommandes((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    return () => {
      socket.off("updateStatus");
    };
  }, []);

  const changeDataBaseStatus = async (id, status) => {
    await updateOrderStatus(id, status);
  };

  const changerStatut = async (id, direction = "next") => {
    const updatedOrder = commandes.find((c) => c.id === id);
    let newStatus = updatedOrder.status;

    if (direction === "next") {
      if (newStatus === "pending") newStatus = "preparing";
      else if (newStatus === "preparing") newStatus = "served";
    } else if (direction === "prev" && newStatus === "preparing") {
      newStatus = "pending";
    }

    if (newStatus !== updatedOrder.status) {
      socket.emit("changeStatus", { id, status: newStatus });
      await changeDataBaseStatus(id, newStatus);
      setCommandes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    }
  };

  const exporterExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      commandes.map((commande) => ({
        ID: commande.id,
        "Nom du client": commande.nom,
        Table: commande.table.numero,
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

  const handleLogout = () => {
    alert("Déconnecté !");
    // Place ici ta logique de déconnexion réelle (Google SignOut, etc.)
  };

  const stats = {
    total: commandes.length,
    pending: commandes.filter((c) => c.status === "pending").length,
    preparing: commandes.filter((c) => c.status === "preparing").length,
    served: commandes.filter((c) => c.status === "served").length,
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <div className={`md:block bg-white p-4 shadow-xl rounded-r-2xl md:w-64`}>
        <div className="flex flex-col items-center mb-8 p-4 bg-[#f9f9f9] rounded-xl border border-gray-200 shadow">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex flex-col items-center focus:outline-none group"
          >
            <img
              src={user.photo}
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
                  onClick={handleLogout}
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
            onClick={() => setActiveTab("commandes")}
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
            onClick={() => setActiveTab("stats")}
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
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "commandes" && (
            <motion.div
              key="commandes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#333] flex items-center gap-3">
                <MdFastfood />
                Commandes récentes
              </h1>

              {loading ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse shadow-lg rounded-lg bg-white animate-pulse">
                    <thead>
                      <tr className="bg-[#f2f0ef] text-gray-700 uppercase text-sm">
                        <th className="p-4">ID</th>
                        <th className="p-4">Client</th>
                        <th className="p-4">Table</th>
                        <th className="p-4">Plats & Quantités</th>
                        <th className="p-4">Date & Heure</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="text-center border-t">
                          {Array.from({ length: 7 }).map((__, i) => (
                            <td key={i} className="p-4">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 text-red-600">
                  <MdError className="text-5xl" />
                  <p className="mt-4 text-lg font-semibold">{error}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse shadow-lg rounded-lg bg-white">
                      <thead>
                        <tr className="bg-[#f2f0ef] text-gray-700 uppercase text-sm">
                          <th className="p-4">ID</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Table</th>
                          <th className="p-4">Plats & Quantités</th>
                          <th className="p-4">Date & Heure</th>
                          <th className="p-4">Statut</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commandes.map((commande) => (
                          <tr
                            key={commande.id}
                            className="text-center border-t"
                          >
                            <td className="p-4">{commande.id}</td>
                            <td className="p-4">
                              <MdPerson className="inline mr-2 text-xl" />
                              {commande.nom}
                            </td>
                            <td className="p-4">
                              <MdTableRestaurant className="inline mr-2 text-xl" />
                              {commande.table.numero}
                            </td>
                            <td className="p-4">
                              {commande.items
                                .map(
                                  (p) => `${p.menuItem.name} (x${p.quantity})`
                                )
                                .join(", ")}
                            </td>
                            <td className="p-4">
                              {formatDateTime(commande.orderDate)}
                            </td>
                            <td className="p-4 capitalize">
                              {commande.status === "pending" && (
                                <span className="flex items-center gap-1 justify-center text-yellow-500 font-semibold">
                                  <MdPendingActions className="text-xl" /> En
                                  attente
                                </span>
                              )}
                              {commande.status === "preparing" && (
                                <span className="flex items-center gap-1 justify-center text-orange-500 font-semibold">
                                  <MdKitchen className="text-xl" /> En
                                  préparation
                                </span>
                              )}
                              {commande.status === "served" && (
                                <span className="flex items-center gap-1 justify-center text-green-600 font-semibold">
                                  <MdDoneAll className="text-xl" /> Servie
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col md:flex-row justify-center gap-2">
                                {commande.status === "preparing" && (
                                  <button
                                    onClick={() =>
                                      changerStatut(commande.id, "prev")
                                    }
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition transform hover:scale-105 flex items-center gap-2"
                                  >
                                    <MdPendingActions className="text-xl" />
                                    Retour
                                  </button>
                                )}
                                {commande.status !== "served" && (
                                  <button
                                    onClick={() =>
                                      changerStatut(commande.id, "next")
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition transform hover:scale-105 flex items-center gap-2"
                                  >
                                    <MdDoneAll className="text-xl" />
                                    Suivant
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Statistiques */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
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
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                  <MdAssignment className="text-4xl text-gray-600" />
                  <div>
                    <p className="text-gray-600">Total commandes</p>
                    <h2 className="text-2xl font-bold">{stats.total}</h2>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                  <MdPendingActions className="text-4xl text-yellow-500" />
                  <div>
                    <p className="text-gray-600">En attente</p>
                    <h2 className="text-2xl font-bold">{stats.pending}</h2>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                  <MdKitchen className="text-4xl text-orange-500" />
                  <div>
                    <p className="text-gray-600">En préparation</p>
                    <h2 className="text-2xl font-bold">{stats.preparing}</h2>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
                  <MdDoneAll className="text-4xl text-green-600" />
                  <div>
                    <p className="text-gray-600">Servies</p>
                    <h2 className="text-2xl font-bold">{stats.served}</h2>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
