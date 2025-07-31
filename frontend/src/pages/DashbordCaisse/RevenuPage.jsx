import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStateContext } from "../../context/ContextProvider";
import { getEventIdByEmail } from "../../services/invitationService";

import { CurrencyEuroIcon, ChartBarIcon, CalendarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { useSocket } from "../../socket";

const RevenuPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [periode, setPeriode] = useState("jour");
  const [loading, setLoading] = useState(true);
  const { token } = useStateContext();
  const navigate = useNavigate();
  const socket = useSocket();
  const fetchCommandes = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error("Token manquant");

      console.log("Token utilisé :", token);
      const event = await getEventIdByEmail(token);
      console.log("Réponse de getEventIdByEmail :", event);
      const eventId = event?.eventId;

      if (!eventId) {
        throw new Error("ID de l'événement non défini");
      }

      const response = await axios.get(`http://localhost:3000/orders/event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { include: "table,items,items.menuItem" },
      });
      console.log("Données de l'API :", response.data);
      console.log("Valeurs brutes de amountPaid :", response.data.map((cmd) => ({
        id: cmd.id,
        amountPaid: cmd.amountPaid,
        paymentStatus: cmd.paymentStatus,
      })));

      const formatted = response.data
        .filter((cmd) => cmd.paymentStatus === "paid")
        .map((c) => ({
          id: c.id,
          total: parseFloat(c.total || 0).toFixed(2),
          amountPaid: parseFloat(c.amountPaid || 0).toFixed(2),
          orderDate: c.orderDate,
          paymentStatus: c.paymentStatus,
          email: c.email || "N/A",
          nom: c.nom || "Anonyme",
        }));
      console.log("Commandes formatées :", formatted);

      setCommandes(formatted);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchCommandes();
    socket.on("orderUpdated", () => {
      console.log("Événement orderUpdated reçu, rafraîchissement des données...");
      fetchCommandes();
    });
    socket.on("paymentStatusChanged", () => {
      console.log("Événement paymentStatusChanged reçu, rafraîchissement...");
      fetchCommandes();
    });
    return () => {
      socket.off("orderUpdated", fetchCommandes);
      socket.off("paymentStatusChanged", fetchCommandes);
    };
  }, [token]);

  const groupKey = (dateStr) => {
    const date = new Date(dateStr);
    if (periode === "jour") return date.toLocaleDateString("fr-FR");
    if (periode === "mois") return `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (periode === "année") return date.getFullYear();
  };

  const groupedByDate = Object.entries(
    commandes.reduce((acc, curr) => {
      const key = groupKey(curr.orderDate);
      acc[key] = (acc[key] || 0) + parseFloat(curr.amountPaid || 0);
      return acc;
    }, {})
  ).map(([date, amountPaid]) => ({
    date,
    amountPaid,
  }));
  console.log("Données du graphique :", groupedByDate);

  const totalEncaisse = commandes.reduce((acc, curr) => acc + parseFloat(curr.amountPaid || 0), 0).toFixed(2);
  const moyenne =
    groupedByDate.length > 0
    ? (groupedByDate.reduce((acc, item) => acc + item.amountPaid, 0) / groupedByDate.length).toFixed(2)
    : 0;
  const max =
    groupedByDate.length > 0
    ? Math.max(...groupedByDate.map((item) => item.amountPaid)).toFixed(2)
    : 0;

  const dataCommandesIndividuelles = commandes.map((cmd) => ({
    commande: `CMD #${cmd.id}`,
    amountPaid: parseFloat(cmd.amountPaid || 0),
  }));

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 to-blue-500">
        <div className="text-xl font-medium text-indigo-700 animate-pulse">
          Chargement des données...
        </div>
      </div>
    );

  return (
    <div
      className="h-screen overflow-hidden bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        backgroundColor: '#f3f4f6',
      }}
    >
      <div className="container mx-auto p-6 max-w-6xl flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-semibold text-white drop-shadow-md">
            Statistiques des revenus
          </h1>
          <button
            onClick={() => navigate("/caisse")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition focus:ring-2 focus:ring-indigo-300"
          >
            Retour
          </button>
        </div>

        {/* Choix de la période */}
        <div className="mb-6 flex items-center space-x-4 bg-white bg-opacity-90 p-4 rounded-xl shadow-lg backdrop-blur-sm">
          <label className="text-lg font-medium text-gray-800">Afficher par :</label>
          <select
            className="border-0 bg-indigo-50 text-indigo-700 font-semibold rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-300 transition"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          >
            <option value="jour">Par jour</option>
            <option value="mois">Par mois</option>
            <option value="année">Par année</option>
          </select>
        </div>

        {/* Résumé statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <CurrencyEuroIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Total encaissé</p>
                <p className="text-xl font-bold text-gray-900">{totalEncaisse} €</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Nombre de paiements</p>
                <p className="text-xl font-bold text-gray-900">{commandes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Moyenne {periode}</p>
                <p className="text-xl font-bold text-gray-900">{moyenne} €</p>
              </div>
            </div>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Pic {periode}</p>
                <p className="text-xl font-bold text-gray-900">{max} €</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des montants payés par commande */}
        <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg mb-6 backdrop-blur-sm flex-1 max-h-64 overflow-y-auto">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Montants payés par commande</h2>
          {commandes.length > 0 ? (
            <ul className="space-y-2">
              {commandes.map((cmd) => (
                <li
                  key={cmd.id}
                  className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg hover:bg-indigo-100 transition"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Commande #{cmd.id} ({cmd.nom}, {cmd.email})
                  </span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {cmd.amountPaid} €
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">Aucune commande payée trouvée.</p>
          )}
        </div>

        {/* Graphique par période */}
        <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg mb-6 backdrop-blur-sm flex-1">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Revenus par période</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={groupedByDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
              <Bar dataKey="amountPaid" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique par commande individuelle */}
        <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg backdrop-blur-sm flex-1">
          <h2 className="text-xl font-bold mb-3 text-gray-800">Montants payés par commande</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataCommandesIndividuelles} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="commande" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
              <Bar dataKey="amountPaid" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenuPage;