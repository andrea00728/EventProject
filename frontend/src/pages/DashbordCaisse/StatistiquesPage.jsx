{/* Importation des dépendances nécessaires */}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import { getEventIdByEmail } from "../../services/invitationService";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement);

// Composant principal pour l'affichage des statistiques
const StatistiquesPage = () => {
  // Déclaration des états
  const [stats, setStats] = useState({
    orders: { pending: 0, preparing: 0, served: 0, canceled: 0 },
    payments: { paid: 0, unpaid: 0 },
    stock: { critical: 0, low: 0, ok: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const { token } = useStateContext();
  const navigate = useNavigate();

  // Couleurs pour les graphiques
  const COLORS = {
    orders: {
      pending: "#FBBF24",
      preparing: "#3B82F6",
      served: "#22C55E",
      canceled: "#EF4444",
    },
    payments: {
      paid: "#22C55E",
      unpaid: "#EF4444",
    },
    stock: {
      critical: "#EF4444",
      low: "#F59E0B",
      ok: "#22C55E",
    },
  };

  // Récupération des détails de l'événement
  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(`http://api.mastertable.site/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventDetails(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'événement :", error);
    }
  };

  // Récupération des statistiques
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const event = await getEventIdByEmail(token);
      const eventId = event.eventId;
      setEventId(eventId);
      await fetchEventDetails(eventId);

      const ordersRes = await axios.get(`http://api.mastertable.site/orders/event/${eventId}`);
      const ordersData = ordersRes.data;

      const orderStats = ordersData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, { pending: 0, preparing: 0, served: 0, canceled: 0 });

      const paymentStats = ordersData.reduce((acc, order) => {
        order.paymentStatus === "paid" ? acc.paid++ : acc.unpaid++;
        return acc;
      }, { paid: 0, unpaid: 0 });

      const stockRes = await axios.get('http://api.mastertable.site/menus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const stockItems = stockRes.data.flatMap(menu => menu.items);

      const stockStats = stockItems.reduce((acc, item) => {
        if (item.stock <= 5) acc.critical++;
        else if (item.stock <= 10) acc.low++;
        else acc.ok++;
        return acc;
      }, { critical: 0, low: 0, ok: 0 });

      setStats({
        orders: orderStats,
        payments: paymentStats,
        stock: stockStats,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement des statistiques au montage du composant
  useEffect(() => {
    if (token) {
      fetchStatistics();
    }
  }, [token]);

  // Calcul des totaux
  const totals = {
    orders: Object.values(stats.orders).reduce((a, b) => a + b, 0),
    payments: Object.values(stats.payments).reduce((a, b) => a + b, 0),
    stock: Object.values(stats.stock).reduce((a, b) => a + b, 0),
  };

  // Options pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 14 },
          color: '#1F2937',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#6B7280', font: { size: 12 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        ticks: { color: '#6B7280', font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  // Données des graphiques
  const charts = {
    orders: {
      data: {
        labels: ['En attente', 'En préparation', 'Servies', 'Annulées'],
        datasets: [{
          data: Object.values(stats.orders),
          backgroundColor: Object.values(COLORS.orders),
          borderWidth: 1,
          borderColor: '#ffffff',
          hoverOffset: 16,
        }],
      },
      type: Pie,
    },
    combined: {
      data: {
        labels: ['Payées', 'Non payées', 'Critique (≤5)', 'Faible (6-10)', 'OK (>10)'],
        datasets: [
          {
            label: 'Paiements',
            data: [stats.payments.paid, stats.payments.unpaid, 0, 0, 0],
            borderColor: COLORS.payments.paid,
            backgroundColor: COLORS.payments.paid,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Stock',
            data: [0, 0, stats.stock.critical, stats.stock.low, stats.stock.ok],
            borderColor: COLORS.stock.ok,
            backgroundColor: COLORS.stock.ok,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      type: Line,
    },
  };

  // Définition des indicateurs clés (KPIs)
  const kpis = [
    {
      title: "Commandes totales",
      value: totals.orders,
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
      trend: stats.orders.served > 0 ? "up" : "down",
      change: `${Math.round((stats.orders.served / totals.orders) * 100)}% servies`,
    },
    {
      title: "Taux de paiement",
      value: `${Math.round((stats.payments.paid / totals.payments) * 100)}%`,
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
      trend: stats.payments.paid > stats.payments.unpaid ? "up" : "down",
      change: `${stats.payments.paid} payées`,
    },
    {
      title: "Articles en stock",
      value: totals.stock,
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      trend: stats.stock.ok > stats.stock.critical ? "up" : "down",
      change: `${stats.stock.critical} critiques`,
    },
    {
      title: "Taux d'annulation",
      value: `${Math.round((stats.orders.canceled / totals.orders) * 100)}%`,
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
      trend: stats.orders.canceled === 0 ? "up" : "down",
      change: `${stats.orders.canceled} annulées`,
    },
  ];

  // Rendu de l'interface utilisateur
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col p-6 sm:p-8"
    >
      {/* Conteneur principal */}
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-8">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-all duration-200 shadow-sm flex items-center gap-2 text-base font-semibold"
              aria-label="Retour à la page précédente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </motion.button>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Tableau de bord – {eventDetails ? eventDetails.name : "Chargement..."}
            </h1>
          </div>
          <span className="text-base text-gray-600">
            Mis à jour: {new Date().toLocaleString()}
          </span>
        </div>

        {/* Indicateurs clés (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-base font-medium text-gray-600">{kpi.title}</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">{kpi.value}</h2>
                </div>
                <div className="p-3 rounded-full bg-gray-100 text-gray-700">{kpi.icon}</div>
              </div>
              <div
                className={`mt-4 text-sm font-medium flex items-center ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <svg className={`w-5 h-5 mr-2 ${kpi.trend === "up" ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                </svg>
                <span>{kpi.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Commandes</h3>
            <p className="text-base text-gray-600 mb-4">Total : {totals.orders}</p>
            <div className="h-80 relative">
              <Pie data={charts.orders.data} options={chartOptions} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements & Stock</h3>
            <p className="text-base text-gray-600 mb-4">
              {totals.payments} paiements – {totals.stock} articles
            </p>
            <div className="h-80 relative">
              <Line data={charts.combined.data} options={lineOptions} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatistiquesPage;