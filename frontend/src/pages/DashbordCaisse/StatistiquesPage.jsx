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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement);

const StatistiquesPage = () => {
  const [stats, setStats] = useState({
    orders: { pending: 0, preparing: 0, served: 0, canceled: 0 },
    payments: { paid: 0, unpaid: 0 },
    stock: { critical: 0, low: 0, ok: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [eventId] = useState(33);
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

  const fetchStatistics = async () => {
    try {
      setLoading(true);
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
    fetchStatistics();
  }, []);

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
    <div className="h-screen bg-gray-100 p-4 flex flex-col">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors duration-200"
          >
            ← Retour
          </button>
          <h1 className="text-xl font-bold text-gray-900">Tableau de bord</h1>
        </div>
        <span className="text-xs text-gray-600">
          Mis à jour: {new Date().toLocaleString()}
        </span>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Cartes KPI */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm p-4 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-xs font-medium">{kpi.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                </div>
                <span className="text-xl">{kpi.icon}</span>
              </div>
              <div
                className={`mt-2 text-xs font-medium flex items-center ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {kpi.trend === 'up' ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {kpi.change}
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 gap-4">
            {/* Graphique des commandes */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Commandes</h2>
              <p className="text-xs text-gray-600 mb-2">Total: {totals.orders}</p>
              <div className="flex-1 relative min-h-[150px]">
                <Pie data={charts.orders.data} options={chartOptions} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {charts.orders.data.labels.map((label, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: charts.orders.data.datasets[0].backgroundColor[index] }}
                    />
                    <span className="text-xs text-gray-700">
                      {label}: {stats.orders[Object.keys(stats.orders)[index]]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique combiné (Paiements et Stock) */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Paiements & Stock</h2>
              <p className="text-xs text-gray-600 mb-2">
                Total: {totals.payments} paiements, {totals.stock} articles
              </p>
              <div className="flex-1 relative min-h-[150px]">
                <Line data={charts.combined.data} options={lineOptions} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {charts.combined.data.labels.map((label, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          index < 2
                            ? charts.combined.data.datasets[0].borderColor
                            : charts.combined.data.datasets[1].borderColor,
                      }}
                    />
                    <span className="text-xs text-gray-700">
                      {label}: {index < 2 ? stats.payments[Object.keys(stats.payments)[index]] || 0 : stats.stock[Object.keys(stats.stock)[index - 2]] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatistiquesPage;