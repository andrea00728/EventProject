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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement);

const StatistiquesPage = () => {
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

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:3000/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventDetails(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'événement :", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const event = await getEventIdByEmail(token);
      const eventId = event.eventId;
      setEventId(eventId);
      await fetchEventDetails(eventId);

      const ordersRes = await axios.get(`http://localhost:3000/orders/event/${eventId}`);
      const ordersData = ordersRes.data;

      const orderStats = ordersData.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, { pending: 0, preparing: 0, served: 0, canceled: 0 });

      const paymentStats = ordersData.reduce((acc, order) => {
        order.paymentStatus === "paid" ? acc.paid++ : acc.unpaid++;
        return acc;
      }, { paid: 0, unpaid: 0 });

      const stockRes = await axios.get('http://localhost:3000/menus', {
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

  useEffect(() => {
    if (token) {
      fetchStatistics();
    }
  }, [token]);

  const totals = {
    orders: Object.values(stats.orders).reduce((a, b) => a + b, 0),
    payments: Object.values(stats.payments).reduce((a, b) => a + b, 0),
    stock: Object.values(stats.stock).reduce((a, b) => a + b, 0),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          padding: 10,
          font: { size: 12 },
          color: '#1F2937',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
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
        ticks: { stepSize: 1, color: '#6B7280', font: { size: 10 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        ticks: { color: '#6B7280', font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

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

  const kpis = [
    {
      title: "Commandes totales",
      value: totals.orders,
      icon: "📦",
      trend: stats.orders.served > 0 ? "up" : "down",
      change: `${Math.round((stats.orders.served / totals.orders) * 100)}% servies`,
    },
    {
      title: "Taux de paiement",
      value: `${Math.round((stats.payments.paid / totals.payments) * 100)}%`,
      icon: "💳",
      trend: stats.payments.paid > stats.payments.unpaid ? "up" : "down",
      change: `${stats.payments.paid} payées`,
    },
    {
      title: "Articles en stock",
      value: totals.stock,
      icon: "📊",
      trend: stats.stock.ok > stats.stock.critical ? "up" : "down",
      change: `${stats.stock.critical} critiques`,
    },
    {
      title: "Taux d'annulation",
      value: `${Math.round((stats.orders.canceled / totals.orders) * 100)}%`,
      icon: "❌",
      trend: stats.orders.canceled === 0 ? "up" : "down",
      change: `${stats.orders.canceled} annulées`,
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1950&q=80')" }}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      <div className="relative z-10 p-6 text-white backdrop-blur-sm">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white/20 border border-white rounded-lg hover:bg-white/30 text-sm transition"
            >
              ← Retour
            </button>
            <h1 className="text-2xl font-bold">
              Tableau de bord – {eventDetails ? eventDetails.name : "Chargement..."}
            </h1>
          </div>
          <span className="text-sm opacity-80">
            Mis à jour: {new Date().toLocaleString()}
          </span>
        </div>

        {/* KPI */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 mb-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-5 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-80">{kpi.title}</p>
                  <h2 className="text-xl font-semibold">{kpi.value}</h2>
                </div>
                <span className="text-2xl">{kpi.icon}</span>
              </div>
              <div
                className={`mt-3 text-xs font-medium flex items-center ${
                  kpi.trend === "up" ? "text-green-400" : "text-red-400"
                }`}
              >
                <span>{kpi.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/20 rounded-2xl p-5 backdrop-blur-md shadow-lg">
            <h3 className="text-sm font-semibold mb-1">Commandes</h3>
            <p className="text-xs opacity-80 mb-3">Total : {totals.orders}</p>
            <div className="h-56 relative">
              <Pie data={charts.orders.data} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white/20 rounded-2xl p-5 backdrop-blur-md shadow-lg">
            <h3 className="text-sm font-semibold mb-1">Paiements & Stock</h3>
            <p className="text-xs opacity-80 mb-3">
              {totals.payments} paiements – {totals.stock} articles
            </p>
            <div className="h-56 relative">
              <Line data={charts.combined.data} options={lineOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatistiquesPage;
