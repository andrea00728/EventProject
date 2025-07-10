import React, { useState } from "react";
import {
  MdDashboard,
  MdBarChart,
  MdFastfood,
  MdTableRestaurant,
  MdTimer,
  MdCheckCircle,
  MdFileDownload,
  MdPendingActions,
  MdKitchen,
  MdDoneAll,
  MdMenu,
  MdAssignment,
  MdPerson,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

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

  const [commandes, setCommandes] = useState([
    {
      id: 1,
      nomClient: "Jean Dupont",
      table: 5,
      statut: "pending",
      date: new Date(),
      plats: [
        { nom: "Pizza", quantite: 2 },
        { nom: "Salade", quantite: 1 },
      ],
    },
    {
      id: 2,
      nomClient: "Marie Durand",
      table: 2,
      statut: "preparing",
      date: new Date(),
      plats: [
        { nom: "Burger", quantite: 3 },
        { nom: "Frites", quantite: 2 },
      ],
    },
    {
      id: 3,
      nomClient: "Paul Martin",
      table: 3,
      statut: "served",
      date: new Date(),
      plats: [
        { nom: "Sushi", quantite: 4 },
        { nom: "Soupe", quantite: 1 },
      ],
    },
  ]);

  const changerStatut = (id) => {
    setCommandes((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          if (c.statut === "pending") return { ...c, statut: "preparing" };
          if (c.statut === "preparing") return { ...c, statut: "served" };
        }
        return c;
      })
    );
  };

  const exporterExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      commandes.map((commande) => ({
        ID: commande.id,
        "Nom du client": commande.nomClient,
        Table: commande.table,
        "Date de commande": formatDateTime(commande.date),
        Plats: commande.plats.map((p) => `${p.nom} (x${p.quantite})`).join(", "),
        Statut: commande.statut,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commandes");
    XLSX.writeFile(workbook, "commandes_evenement.xlsx");
  };

  const stats = {
    total: commandes.length,
    pending: commandes.filter((c) => c.statut === "pending").length,
    preparing: commandes.filter((c) => c.statut === "preparing").length,
    served: commandes.filter((c) => c.statut === "served").length,
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fafafa]">
      {/* Menu Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-md">
        <h2 className="text-xl font-bold text-[#333]">Cuisine</h2>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-gray-800"
        >
          <MdMenu />
        </button>
      </div>

      {/* Menu Sidebar */}
      <div
        className={`${
          menuOpen ? "block" : "hidden"
        } md:block bg-white p-4 shadow-xl rounded-r-2xl md:w-64`}
      >
        <h2 className="hidden md:block text-2xl font-bold mb-10 text-center text-[#333]">
          Cuisine
        </h2>
        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => {
              setActiveTab("commandes");
              setMenuOpen(false);
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
              setMenuOpen(false);
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
              <div className="flex justify-end mb-4">
                <button
                  onClick={exporterExcel}
                  className="bg-[#cfc6c4] hover:bg-[#b9aeac] px-4 py-2 rounded-lg font-semibold text-black shadow flex items-center gap-2"
                >
                  Télécharger Excel <MdFileDownload className="text-xl" />
                </button>
              </div>
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
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((commande) => (
                      <tr key={commande.id} className="text-center border-t">
                        <td className="p-4">{commande.id}</td>
                        <td className="p-4">
                          <MdPerson className="inline mr-2 text-xl" />
                          {commande.nomClient}
                        </td>
                        <td className="p-4">
                          <MdTableRestaurant className="inline mr-2 text-xl" />
                          {commande.table}
                        </td>
                        <td className="p-4">
                          {commande.plats
                            .map((p) => `${p.nom} (x${p.quantite})`)
                            .join(", ")}
                        </td>
                        <td className="p-4">
                          {formatDateTime(commande.date)}
                        </td>
                        <td className="p-4 capitalize">
                          {commande.statut === "pending" && (
                            <span className="flex items-center gap-1 justify-center text-yellow-500 font-semibold">
                              <MdPendingActions className="text-xl" /> En attente
                            </span>
                          )}
                          {commande.statut === "preparing" && (
                            <span className="flex items-center gap-1 justify-center text-orange-500 font-semibold">
                              <MdKitchen className="text-xl" /> En préparation
                            </span>
                          )}
                          {commande.statut === "served" && (
                            <span className="flex items-center gap-1 justify-center text-green-600 font-semibold">
                              <MdDoneAll className="text-xl" /> Servie
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {commande.statut !== "served" && (
                            <button
                              onClick={() => changerStatut(commande.id)}
                              className="bg-[#cfc6c4] hover:bg-[#b9aeac] px-4 py-2 rounded-lg font-semibold text-black shadow"
                            >
                              Suivant
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
