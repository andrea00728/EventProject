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
      pending: ["rgba(234, 179, 8, 0.8)", "rgba(250, 204, 21, 0.8)"], // Yellow-600 to Yellow-400
      preparing: ["rgba(99, 102, 241, 0.8)", "rgba(129, 140, 248, 0.8)"], // Indigo-600 to Indigo-400
      served: ["rgba(16, 185, 129, 0.8)", "rgba(52, 211, 153, 0.8)"], // Emerald-600 to Emerald-400
      canceled: ["rgba(239, 68, 68, 0.8)", "rgba(248, 113, 113, 0.8)"], // Red-600 to Red-400
    },
    payments: {
      paid: ["rgba(34, 197, 94, 0.8)", "rgba(74, 222, 128, 0.8)"], // Green-600 to Green-400
      unpaid: ["rgba(244, 63, 94, 0.8)", "rgba(251, 113, 133, 0.8)"], // Rose-600 to Rose-400
    },
    stock: {
      critical: ["rgba(220, 38, 38, 0.8)", "rgba(248, 113, 113, 0.8)"], // Red-700 to Red-400
      low: ["rgba(249, 115, 22, 0.8)", "rgba(251, 146, 60, 0.8)"], // Orange-600 to Orange-400
      ok: ["rgba(6, 182, 212, 0.8)", "rgba(34, 211, 238, 0.8)"], // Cyan-600 to Cyan-400
    },
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:3000/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventDetails(response.data);
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
          boxWidth: 14,
          padding: 20,
          font: { size: 14, weight: '600', family: "'Inter', sans-serif" },
          color: '#1F2937',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        padding: 12,
        cornerRadius: 8,
        bodyFont: { size: 14, weight: '500' },
        titleFont: { size: 16, weight: '600' },
        boxPadding: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
      animateScale: true,
      animateRotate: true,
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#6B7280',
          font: { size: 12, family: "'Inter', sans-serif" },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          borderColor: '#D1D5DB',
          borderWidth: 1,
        },
      },
      x: {
        ticks: {
          color: '#6B7280',
          font: { size: 12, family: "'Inter', sans-serif" },
        },
        grid: { display: false },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        labels: {
          ...chartOptions.plugins.legend.labels,
          pointStyle: 'circle',
          usePointStyle: true,
        },
      },
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutQuart',
    },
  };

  const createGradient = (ctx, chartArea, colors) => {
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  };

  const charts = {
    orders: {
      data: {
        labels: ['En attente', 'En préparation', 'Servies', 'Annulées'],
        datasets: [{
          data: Object.values(stats.orders),
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const chartArea = context.chart.chartArea;
            if (!chartArea) return COLORS.orders[Object.keys(COLORS.orders)[context.dataIndex]][0];
            const key = Object.keys(COLORS.orders)[context.dataIndex];
            return createGradient(ctx, chartArea, COLORS.orders[key]);
          },
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 24,
          hoverBorderWidth: 3,
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
            borderColor: (context) => {
              const ctx = context.chart.ctx;
              const chartArea = context.chart.chartArea;
              if (!chartArea) return COLORS.payments.paid[0];
              return createGradient(ctx, chartArea, COLORS.payments.paid);
            },
            backgroundColor: COLORS.payments.paid[0],
            fill: false,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: (context) => {
              const ctx = context.chart.ctx;
              const chartArea = context.chart.chartArea;
              if (!chartArea) return COLORS.payments.paid[0];
              return createGradient(ctx, chartArea, COLORS.payments.paid);
            },
            pointBorderWidth: 2,
          },
          {
            label: 'Stock',
            data: [0, 0, stats.stock.critical, stats.stock.low, stats.stock.ok],
            borderColor: (context) => {
              const ctx = context.chart.ctx;
              const chartArea = context.chart.chartArea;
              if (!chartArea) return COLORS.stock.ok[0];
              return createGradient(ctx, chartArea, COLORS.stock.ok);
            },
            backgroundColor: COLORS.stock.ok[0],
            fill: false,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: (context) => {
              const ctx = context.chart.ctx;
              const chartArea = context.chart.chartArea;
              if (!chartArea) return COLORS.stock.ok[0];
              return createGradient(ctx, chartArea, COLORS.stock.ok);
            },
            pointBorderWidth: 2,
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
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 focus:ring-4 focus:ring-indigo-300 transition-all duration-300"
              aria-label="Retour à la page précédente"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </motion.button>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Tableau de bord – {eventDetails ? eventDetails.name : "Chargement..."}
            </h1>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            Mis à jour: {new Date().toLocaleString()}
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</h2>
                </div>
                <div className="p-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600">
                  {kpi.icon}
                </div>
              </div>
              <div
                className={`mt-3 text-sm font-medium flex items-center ${
                  kpi.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                <svg
                  className={`w-4 h-4 mr-1 ${kpi.trend === "up" ? "" : "rotate-180"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
                </svg>
                <span>{kpi.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Commandes</h3>
            <p className="text-sm text-gray-600 mb-4">Total : {totals.orders}</p>
            <div className="h-80 relative">
              <Pie data={charts.orders.data} options={chartOptions} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Paiements & Stock</h3>
            <p className="text-sm text-gray-600 mb-4">
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