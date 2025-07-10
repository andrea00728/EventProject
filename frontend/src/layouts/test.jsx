import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUtensils, FaReceipt, FaHourglassStart, FaCheck } from "react-icons/fa";

const commandesInitiales = [
  {
    id: 1,
    table: 5,
    plats: "Poulet rôti, Frites, Salade",
    heure: "12:45",
    statut: "En attente",
  },
  {
    id: 2,
    table: 3,
    plats: "Pizza Margherita, Jus d’orange",
    heure: "12:50",
    statut: "En préparation",
  },
];

export default function GestionCommandesCuisine() {
  const [commandes, setCommandes] = useState(commandesInitiales);

  const changerStatut = (id) => {
    setCommandes((prevCommandes) =>
      prevCommandes.map((commande) =>
        commande.id === id
          ? {
              ...commande,
              statut:
                commande.statut === "En attente"
                  ? "En préparation"
                  : "Prête",
            }
          : commande
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center text-orange-600 mb-10 flex items-center justify-center gap-2">
        <FaUtensils /> Gestion des Commandes - Cuisine
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {commandes.map((commande) => (
          <motion.div
            key={commande.id}
            className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-orange-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <FaReceipt /> Commande #{commande.id}
            </h2>
            <p className="mt-2 text-gray-600">
              <strong>Table :</strong> {commande.table}
            </p>
            <p className="text-gray-600">
              <strong>Plats :</strong> {commande.plats}
            </p>
            <p className="text-gray-600">
              <strong>Heure :</strong> {commande.heure}
            </p>
            <p className="text-gray-600">
              <strong>Statut :</strong> {commande.statut}
            </p>
            <button
              onClick={() => changerStatut(commande.id)}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              {commande.statut === "En attente" ? (
                <>
                  <FaHourglassStart /> Commencer la préparation
                </>
              ) : (
                <>
                  <FaCheck /> Marquer comme prête
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
