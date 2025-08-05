import React, { useEffect, useMemo, useRef, useState, memo } from 'react';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useDarkMode } from "../../context/DarkModeContext";
import {
  MdFileDownload,
  MdSearch,
  MdFilterList,
  MdPeople,
  MdEvent,
  MdPerson,
  MdCalendarToday,
  MdTrendingUp,
  MdQueryStats
} from "react-icons/md";
import {
  MdInfo,
  MdStar,
  MdCancel,
  MdAttachMoney
} from "react-icons/md";
import { FaUsers, FaBell, FaEnvelope, FaUser } from "react-icons/fa";
import { ChevronDown } from "lucide-react";

// Enregistrement du plugin ChartDataLabels globalement
Chart.register(ChartDataLabels);

// Plugin personnalisé pour afficher le total au centre d'un graphique en beignet
const centerTextPlugin = {
  id: 'centerText',
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    ctx.save();

    const fontSize = (height / 120).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#cbd5e1';

    const total = chart.data.datasets[0].data.reduce((a, b) => {
      return (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0);
    }, 0);
    const text = `Total: ${total}`;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.restore();
  }
};

const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const { darkMode } = useDarkMode();

  const colors = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-500" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-500" },
    purple: { bg: "from-purple-500 to-pink-500", text: "text-purple-500" },
    orange: { bg: "from-orange-500 to-yellow-500", text: "text-orange-500" }
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color].bg
        } opacity-10 rounded-full -mr-4 -mt-4`} />

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? "text-blue-300" : "text-blue-600"
            } mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"
            }`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <MdTrendingUp className={`mr-1 ${trend > 0 ? "text-green-500" : "text-red-500"
                }`} />
              <span className={`text-sm ${trend > 0 ? "text-green-600" : "text-red-600"
                }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${colors[color].bg
          } text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const Dropdown = React.forwardRef(({ show, setShow, icon, label, count, items }, ref) => {
  const { darkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className={`relative p-2 rounded-full transition-all duration-200 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        aria-label={label}
      >
        <div className="relative">
          {React.cloneElement(icon, { className: 'w-5 h-5' })}
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </div>
      </button>

      {show && (
        <div
          className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-200'
            : 'bg-white border-gray-200 text-gray-900'
            } z-50 transition-all duration-200 ${isMobile ? 'left-4 right-4' : 'right-0'
            }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
            <h4 className={`font-semibold text-sm sm:text-base ${darkMode ? "text-purple-300" : "text-purple-600"
              }`}>{label}</h4>
            {count > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 transition-colors duration-150 border-b ${darkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                    } cursor-pointer`}
                >
                  <p className="text-sm line-clamp-2">
                    {typeof item === 'object' ? `${item.from}: ${item.text}` : item}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    Il y a {Math.floor(Math.random() * 60)} min
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  Aucun {label.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

const Statique = () => {
  // États
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // États pour les données et chargement
  const [chartData, setChartData] = useState({ revenue: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('12');

  // Références pour les dropdowns
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  // Références pour les instances de Chart
  const revenueChartRef = useRef(null);
  const eventsChartRef = useRef(null);
  const peakHoursChartRef = useRef(null);
  const registrationChartRef = useRef(null);
  const eventTypeChartRef = useRef(null);

  // Références pour les éléments Canvas
  const revenueChartCanvasRef = useRef(null);
  const eventsChartCanvasRef = useRef(null);
  const peakHoursChartCanvasRef = useRef(null);
  const registrationChartCanvasRef = useRef(null);
  const eventTypeChartCanvasRef = useRef(null);

  // Fonction pour charger les données
  const fetchChartData = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Chargement des données pour ${selectedPeriod} mois`);

      const response = await fetch(`http://localhost:3000/forfait/dashboard-charts?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Données reçues:', data);

      setChartData(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le graphique des revenus
  const updateRevenueChart = (revenueData) => {
    console.log('📈 Mise à jour graphique revenus:', revenueData);

    if (revenueChartRef.current) {
      revenueChartRef.current.destroy();
    }

    if (!revenueChartCanvasRef.current) return;

    const ctx = revenueChartCanvasRef.current.getContext('2d');
    revenueChartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: revenueData.map(item => item.month),
        datasets: [{
          label: 'Revenus (€)',
          data: revenueData.map(item => item.total),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: darkMode ? '#ffffff' : '#000000' }
          }
        },
        scales: {
          x: {
            ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' },
            grid: { color: darkMode ? '#374151' : '#E5E7EB' }
          },
          y: {
            ticks: { color: darkMode ? '#9CA3AF' : '#6B7280' },
            grid: { color: darkMode ? '#374151' : '#E5E7EB' }
          }
        }
      }
    });
  };

  // Fonction pour mettre à jour le graphique des événements
  const updateEventsChart = (eventsData) => {
    console.log('🎯 Mise à jour graphique événements:', eventsData);

    if (eventsChartRef.current) {
      eventsChartRef.current.destroy();
    }

    if (!eventsChartCanvasRef.current) return;

    const ctx = eventsChartCanvasRef.current.getContext('2d');
    eventsChartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: eventsData.map(item => item.type),
        datasets: [{
          data: eventsData.map(item => item.count),
          backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: darkMode ? '#ffffff' : '#000000', padding: 20 }
          }
        }
      }
    });
  };

  // useEffect pour le chargement initial et rechargement lors du changement de période
  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod]);

  // useEffect pour mise à jour du graphique des revenus
  useEffect(() => {
    if (!loading && chartData.revenue && chartData.revenue.length > 0) {
      updateRevenueChart(chartData.revenue);
    }
  }, [chartData.revenue, darkMode, loading]);

  // useEffect pour mise à jour du graphique des événements
  useEffect(() => {
    if (!loading && chartData.events && chartData.events.length > 0) {
      updateEventsChart(chartData.events);
    }
  }, [chartData.events, darkMode, loading]);

  // useEffect pour le nettoyage des instances Chart
  useEffect(() => {
    return () => {
      if (revenueChartRef.current) revenueChartRef.current.destroy();
      if (eventsChartRef.current) eventsChartRef.current.destroy();
    };
  }, []);




  const notifications = [
    "Nouvel utilisateur inscrit",
    "Nouvel événement créé",
    "Paiement reçu pour un événement",
  ];

  const messages = [
    { from: "Organisateur", text: "Besoin d'aide pour créer un événement" },
    { from: "Utilisateur", text: "Problème avec ma réservation" },
  ];

  const gradientTitle = "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton = "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const bgClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";

  // Données pour les graphiques
  const registrationData = useMemo(() => ({
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
    datasets: [{
      label: 'Inscriptions',
      data: [5, 10, 15, 20, 25, 30, 35],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#6366f1',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  }), []);

  const eventTypeData = useMemo(() => ({
    labels: ['Conférences', 'Formations', 'Networking', 'Webinaires', 'Autres'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(250, 204, 21, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 1.5,
    }]
  }), []);

  // Options de graphique communes
  const commonChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(22, 33, 62, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#e2e8f0' : '#1a202c',
        bodyColor: darkMode ? '#cbd5e1' : '#4a5568',
        borderColor: darkMode ? 'rgba(74, 85, 104, 0.5)' : 'rgba(226, 232, 240, 0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(74, 85, 104, 0.1)' : 'rgba(226, 232, 240, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? '#a0aec0' : '#718096',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#a0aec0' : '#718096',
        },
      },
    },
  }), [darkMode]);

  // Options pour les graphiques en beignet
  const doughnutChartOptions = useMemo(() => ({
    ...commonChartOptions,
    cutout: '75%',
    plugins: {
      ...commonChartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          color: darkMode ? '#cbd5e1' : '#4a5568',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const rawData = context.chart.data.datasets[0].data;
          const total = rawData.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: darkMode ? '#fff' : '#1a202c',
        font: {
          weight: 'bold',
          size: 14
        },
        display: 'auto',
      }
    },
  }), [commonChartOptions, darkMode]);

  useEffect(() => {
    // Initialiser les graphiques
    if (revenueChartCanvasRef.current) {
      revenueChartRef.current = new Chart(revenueChartCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
          datasets: [{
            label: 'Revenus (en K€)',
            data: [12, 19, 15, 22, 24, 28, 31, 35, 32, 38, 42, 45],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: darkMode ? '#1a202c' : '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          ...commonChartOptions,
          plugins: {
            ...commonChartOptions.plugins,
            tooltip: {
              ...commonChartOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  return ` ${context.parsed.y}K€`;
                }
              }
            },
            legend: {
              ...commonChartOptions.plugins.legend,
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: darkMode ? '#cbd5e1' : '#4a5568'
              }
            }
          },
        }
      });
    }

    if (eventsChartCanvasRef.current) {
      eventsChartRef.current = new Chart(eventsChartCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Mariages', 'Conférences', 'Concerts', 'Soirées', 'Autres'],
          datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(250, 204, 21, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderColor: [
              'rgba(99, 102, 241, 1)',
              'rgba(168, 85, 247, 1)',
              'rgba(34, 197, 94, 1)',
              'rgba(250, 204, 21, 1)',
              'rgba(239, 68, 68, 1)'
            ],
            borderWidth: 1.5,
          }]
        },
        options: doughnutChartOptions,
        plugins: [ChartDataLabels, centerTextPlugin]
      });
    }

    if (peakHoursChartCanvasRef.current) {
      peakHoursChartRef.current = new Chart(peakHoursChartCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'],
          datasets: [{
            label: 'Réservations',
            data: [5, 15, 25, 20, 30, 45, 68, 42],
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
          }]
        },
        options: {
          ...commonChartOptions,
          plugins: {
            ...commonChartOptions.plugins,
            tooltip: {
              ...commonChartOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  return ` ${context.parsed.y}% des réservations`;
                }
              }
            }
          },
          scales: {
            y: {
              ...commonChartOptions.scales.y,
              max: 100,
              ticks: {
                ...commonChartOptions.scales.y.ticks,
                callback: function (value) {
                  return value + '%';
                }
              }
            },
            x: {
              ...commonChartOptions.scales.x,
            }
          }
        }
      });
    }

    if (registrationChartCanvasRef.current) {
      registrationChartRef.current = new Chart(registrationChartCanvasRef.current, {
        type: 'line',
        data: registrationData,
        options: {
          ...commonChartOptions,
          plugins: {
            ...commonChartOptions.plugins,
            legend: {
              ...commonChartOptions.plugins.legend,
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: darkMode ? '#cbd5e1' : '#4a5568'
              }
            },
            tooltip: {
              ...commonChartOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  return ` ${context.dataset.label}: ${context.parsed.y}`;
                }
              }
            }
          },
        }
      });
    }

    if (eventTypeChartCanvasRef.current) {
      eventTypeChartRef.current = new Chart(eventTypeChartCanvasRef.current, {
        type: 'doughnut',
        data: eventTypeData,
        options: {
          ...doughnutChartOptions,
          plugins: {
            ...doughnutChartOptions.plugins,
            legend: {
              ...doughnutChartOptions.plugins.legend,
              display: true,
              position: 'right',
              labels: {
                usePointStyle: true,
                padding: 20,
                color: darkMode ? '#cbd5e1' : '#4a5568'
              }
            },
            tooltip: {
              ...doughnutChartOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  const value = typeof context.parsed === 'number' ? context.parsed : 0;
                  return ` ${context.label}: ${value}%`;
                }
              }
            }
          }
        },
        plugins: [ChartDataLabels, centerTextPlugin]
      });
    }

    return () => {
      revenueChartRef.current?.destroy();
      eventsChartRef.current?.destroy();
      peakHoursChartRef.current?.destroy();
      registrationChartRef.current?.destroy();
      eventTypeChartRef.current?.destroy();
    };
  }, [commonChartOptions, doughnutChartOptions, registrationData, eventTypeData, darkMode]);

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${bgClass}`}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Utilisateurs Totaux"
          value="1,523"
          icon={MdPeople}
          trend={12.5}
          color="blue"
        />
        <StatsCard
          title="Événements Créés"
          value="3,847"
          icon={MdEvent}
          trend={22.1}
          color="green"
        />
        <StatsCard
          title="Revenus Totaux"
          value="€127K"
          icon={MdTrendingUp}
          trend={18.9}
          color="purple"
        />
        <StatsCard
          title="Organisateurs"
          value="524"
          icon={MdPerson}
          trend={5.5}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Graphique des Revenus */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>
                Évolution des Revenus
              </h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Performance mensuelle sur les {selectedPeriod} derniers mois
              </p>
            </div>
            <div className="relative mt-4 sm:mt-0">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={`appearance-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                  } border rounded-lg pl-3 pr-9 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer`}
              >
                <option value="12">12 derniers mois</option>
                <option value="6">6 derniers mois</option>
                <option value="3">3 derniers mois</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <canvas ref={revenueChartCanvasRef}></canvas>
          </div>
        </div>

        {/* Graphique des Types d'Événements */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-1`}>
                Types d'Événements
              </h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Répartition des événements par catégorie
              </p>
            </div>
            <button className={`flex items-center space-x-2 mt-4 sm:mt-0 ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
              } text-sm`}>
              <span>
                Total: {chartData.events?.reduce((sum, item) => sum + item.count, 0) || 0} événements
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="chart-container flex items-center justify-center" style={{ height: '300px' }}>
            <canvas ref={eventsChartCanvasRef}></canvas>
          </div>
        </div>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Graphique des Inscriptions */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"
                } mb-1`}>Évolution des Inscriptions</h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}>Nouvelles inscriptions par mois</p>
            </div>
            <div className="relative mt-4 sm:mt-0">
              <select className={`appearance-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                } border rounded-lg pl-3 pr-9 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer`}>
                <option>7 derniers mois</option>
                <option>12 derniers mois</option>
                <option>3 derniers mois</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <canvas ref={registrationChartCanvasRef}></canvas>
          </div>
        </div>

        {/* Graphique des Heures de Pointe */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"
                } mb-1`}>Heures de Pointe</h3>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                }`}>Activité des utilisateurs par heure</p>
            </div>
            <button className={`flex items-center space-x-2 mt-4 sm:mt-0 ${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
              } text-sm`}>
              <span>Rapport détaillé</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <canvas ref={peakHoursChartCanvasRef}></canvas>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Métriques de Performance - Utilisation des Tables */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <h3 className={`text-xl font-bold flex items-center space-x-3 ${darkMode ? "text-white" : "text-gray-900"
            } mb-5`}>
            <MdEvent className="text-emerald-400" />
            <span>Utilisation des Tables</span>
          </h3>
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-md"></div>
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>Tables VIP</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className={`w-full sm:w-32 h-2.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="h-2.5 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-green-500 text-sm font-semibold">85%</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md"></div>
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>Tables Standard</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className={`w-full sm:w-32 h-2.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="h-2.5 bg-blue-500 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-blue-500 text-sm font-semibold">72%</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-md"></div>
                <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>Tables Extérieures</span>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className={`w-full sm:w-32 h-2.5 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="h-2.5 bg-yellow-500 rounded-full" style={{ width: '43%' }}></div>
                </div>
                <span className="text-yellow-500 text-sm font-semibold">43%</span>
              </div>
            </div>
          </div>
          <div className="mt-7 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-xs flex items-center ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
              <MdInfo className="mr-2 text-indigo-400" />
              <span>Taux d'occupation moyen: <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"
                }`}>67%</span> ce mois</span>
            </p>
          </div>
        </div>

        {/* Métriques de Performance - Satisfaction Client */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <h3 className={`text-xl font-bold flex items-center space-x-3 ${darkMode ? "text-white" : "text-gray-900"
            } mb-5`}>
            <MdPerson className="text-yellow-400" />
            <span>Satisfaction Client</span>
          </h3>
          <div className="text-center py-4">
            <div className={`text-6xl font-extrabold mb-3 leading-none ${darkMode ? "text-green-400" : "text-green-600"
              }`}>
              4.8<span className={`text-3xl ${darkMode ? "text-gray-400" : "text-gray-500"
                }`}>/5</span>
            </div>
            <div className="flex justify-center space-x-1 mb-5">
              {[...Array(5)].map((_, i) => (
                <MdStar key={`star-${i}`} className={`${darkMode ? "text-yellow-400" : "text-yellow-500"
                  } ${i >= 4 ? 'opacity-50' : ''}`} />
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <div className={`flex justify-between text-sm mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  <span>Excellent</span>
                  <span>1,247 avis</span>
                </div>
                <div className={`w-full rounded-full h-2.5 ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  <span>Très bien</span>
                  <span>312 avis</span>
                </div>
                <div className={`w-full rounded-full h-2.5 ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className={`flex justify-between text-sm mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                  <span>Moyen</span>
                  <span>45 avis</span>
                </div>
                <div className={`w-full rounded-full h-2.5 ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}>
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques de Performance - Heures de Pointe */}
        <div className={`rounded-2xl p-6 border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
          <h3 className={`text-xl font-bold flex items-center space-x-3 ${darkMode ? "text-white" : "text-gray-900"
            } mb-5`}>
            <MdCalendarToday className="text-teal-400" />
            <span>Heures de Pointe</span>
          </h3>
          <div className="chart-container" style={{ height: '220px' }}>
            <canvas ref={peakHoursChartCanvasRef}></canvas>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-xs flex items-center ${darkMode ? "text-gray-400" : "text-gray-500"
              }`}>
              <MdInfo className="mr-2 text-indigo-400" />
              <span>Heure la plus fréquentée: <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"
                }`}>20h-22h</span> (68% des réservations)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Section Tendances Récentes */}
      <div className={`rounded-2xl p-6 border mb-12 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}>
        <h3 className={`text-2xl font-bold flex items-center space-x-3 ${darkMode ? "text-white" : "text-gray-900"
          } mb-8`}>
          <MdTrendingUp className="text-indigo-400" />
          <span>Tendances Récentes</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`rounded-xl p-5 border ${darkMode ? "border-green-500/20 bg-gray-700/30" : "border-green-200 bg-green-50"
            }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-green-500/20" : "bg-green-100"
                }`}>
                <MdEvent className="text-green-400 text-xl" />
              </div>
              <div>
                <div className={`text-3xl font-extrabold mb-1 leading-none ${darkMode ? "text-green-400" : "text-green-600"
                  }`}>+34%</div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Réservations ce mois</p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-5 border ${darkMode ? "border-red-500/20 bg-gray-700/30" : "border-red-200 bg-red-50"
            }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-red-500/20" : "bg-red-100"
                }`}>
                <MdCancel className="text-red-400 text-xl" />
              </div>
              <div>
                <div className={`text-3xl font-extrabold mb-1 leading-none ${darkMode ? "text-red-400" : "text-red-600"
                  }`}>-12%</div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Taux d'annulation</p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-5 border ${darkMode ? "border-yellow-500/20 bg-gray-700/30" : "border-yellow-200 bg-yellow-50"
            }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${darkMode ? "bg-yellow-500/20" : "bg-yellow-100"
                }`}>
                <MdAttachMoney className="text-yellow-400 text-xl" />
              </div>
              <div>
                <div className={`text-3xl font-extrabold mb-1 leading-none ${darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}>+8%</div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"
                  }`}>Revenus par client</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statique;