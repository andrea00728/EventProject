import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
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
  MdQueryStats,
  MdInfo,
  MdStar,
  MdCancel,
  MdAttachMoney,
} from "react-icons/md";
import { FaUsers, FaBell, FaEnvelope, FaUser } from "react-icons/fa";
import { ChevronDown } from "lucide-react";
import statsService from "../../services/statsService";

Chart.register(ChartDataLabels);

const centerTextPlugin = {
  id: "centerText",
  beforeDraw(chart) {
    const { width, height, ctx } = chart;
    ctx.save();

    const fontSize = (height / 120).toFixed(2);
    ctx.font = `${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#cbd5e1";

    const total = chart.data.datasets[0].data.reduce((a, b) => {
      return (typeof a === "number" ? a : 0) + (typeof b === "number" ? b : 0);
    }, 0);
    const text = `Total: ${total}`;
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.restore();
  },
};

const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const { darkMode } = useDarkMode();

  const colors = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-500" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-500" },
    purple: { bg: "from-purple-500 to-pink-500", text: "text-purple-500" },
    orange: { bg: "from-orange-500 to-yellow-500", text: "text-orange-500" },
  };

  return (
    <div
      className={`rounded-xl p-4 shadow-sm border ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
    >
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[color].bg} opacity-10 rounded-full -mr-4 -mt-4`}
      />

      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-blue-300" : "text-blue-600"
            } mb-1`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-1">
              <MdTrendingUp
                className={`mr-1 ${
                  trend > 0 ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={`text-sm ${
                  trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-full bg-gradient-to-br ${colors[color].bg} text-white`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const Dropdown = React.forwardRef(
  ({ show, setShow, icon, label, count, items }, ref) => {
    const { darkMode } = useDarkMode();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 640);
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setShow(!show)}
          className={`relative p-2 rounded-full transition-all duration-200 ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
          aria-label={label}
        >
          <div className="relative">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </div>
        </button>

        {show && (
          <div
            className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-white border-gray-200 text-gray-900"
            } z-50 transition-all duration-200 ${
              isMobile ? "left-4 right-4" : "right-0"
            }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              {React.cloneElement(icon, { className: "w-5 h-5" })}
              <h4
                className={`font-semibold text-sm sm:text-base ${
                  darkMode ? "text-purple-300" : "text-purple-600"
                }`}
              >
                {label}
              </h4>
              {count > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {items.length ? (
                items.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 transition-colors duration-150 border-b ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-200 hover:bg-gray-50"
                    } cursor-pointer`}
                  >
                    <p className="text-sm line-clamp-2">
                      {typeof item === "object"
                        ? `${item.from}: ${item.text}`
                        : item}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Il y a {Math.floor(Math.random() * 60)} min
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Aucun {label.toLowerCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

const Statique = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [satisfactionStats, setSatisfactionStats] = useState(null);
  const [userRate, setUserRate] = useState("0.0");
  const [organizerRate, setOrganizerRate] = useState("0.0");
  const [eventCount, setEventCount] = useState(0);
  const [revenueTotal, setRevenueTotal] = useState("$0");
  const [eventTypeData, setEventTypeData] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [error, setError] = useState(null);

  // États pour les données et chargement
  const [chartData, setChartData] = useState({ revenue: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("12");

  const totalEventMax = 1000;

  // Références pour les instances de Chart
  const revenueChartRef = useRef(null);
  const eventsChartRef = useRef(null);
  const peakHoursChartRef = useRef(null);
  const registrationChartRef = useRef(null);
  const eventTypeChartCanvasRef = useRef(null);

  // Références pour les éléments Canvas
  const revenueChartCanvasRef = useRef(null);
  const eventsChartCanvasRef = useRef(null);
  const peakHoursChartCanvasRef = useRef(null);
  const registrationChartCanvasRef = useRef(null);

  //BY LIOKA
  // Fonction pour charger les données
  const fetchChartData = async () => {};

  // Fonction pour mettre à jour le graphique des revenus
  const updateRevenueChart = (revenueData) => {};

  const notifications = [
    "Nouvel utilisateur inscrit",
    "Nouvel événement créé",
    "Paiement reçu pour un événement",
  ];

  const messages = [
    { from: "Organisateur", text: "Besoin d'aide pour créer un événement" },
    { from: "Utilisateur", text: "Problème avec ma réservation" },
  ];

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const bgClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";

  // Récupération des données via le service
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await statsService.fetchAllStats();
        setUserRate(stats.userRate);
        setOrganizerRate(stats.organizerRate);
        setEventCount(stats.eventCount);
        setRevenueTotal(stats.revenueTotal);
        setEventTypeData(stats.eventTypeData);
        setRegistrationData(stats.registrationData);
        setError(null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Options de graphique communes
  const commonChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: darkMode
            ? "rgba(22, 33, 62, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
          titleColor: darkMode ? "#e2e8f0" : "#1a202c",
          bodyColor: darkMode ? "#cbd5e1" : "#4a5568",
          borderColor: darkMode
            ? "rgba(74, 85, 104, 0.5)"
            : "rgba(226, 232, 240, 0.5)",
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
            color: darkMode
              ? "rgba(74, 85, 104, 0.1)"
              : "rgba(226, 232, 240, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: darkMode ? "#a0aec0" : "#718096",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: darkMode ? "#a0aec0" : "#718096",
          },
        },
      },
    }),
    [darkMode]
  );

  // Options pour les graphiques en beignet
  const doughnutChartOptions = useMemo(
    () => ({
      ...commonChartOptions,
      cutout: "75%",
      plugins: {
        ...commonChartOptions.plugins,
        legend: {
          position: "right",
          labels: {
            color: darkMode ? "#cbd5e1" : "#4a5568",
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        datalabels: {
          formatter: (value, context) => {
            const rawData = context.chart.data.datasets[0].data;
            const total = rawData.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${percentage}%`;
          },
          color: darkMode ? "#fff" : "#1a202c",
          font: {
            weight: "bold",
            size: 14,
          },
          display: "auto",
        },
      },
    }),
    [commonChartOptions, darkMode]
  );

  // Récupérer les données des sessions et rôles
  useEffect(() => {
    const fetchSessionStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/session-stats`
        );
        setSessionStats(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des sessionStats:",
          error
        );
        setSessionStats({
          totalUsersWithSessions: 2,
          averageSessionDuration: "7.50",
          individualStats: [
            {
              id: "77250535-e693-4ba8-a077-02b7fcbfc9b3",
              email: "nadjanick3@gmail.com",
              lastSessionDuration: "0.75",
              percentageOfTotalTime: "5.00",
              role: "client",
              sessionStartTime: "2025-08-04T09:30:00Z",
            },
            {
              id: "8556daa3-a08b-4002-b50e-dfbb0eb01ebe",
              email: "eliasvano78@gmail.com",
              lastSessionDuration: "14.25",
              percentageOfTotalTime: "95.00",
              role: "organisateur",
              sessionStartTime: "2025-08-04T20:15:00Z",
            },
          ],
        });
      }
    };

    fetchSessionStats();
  }, []);

  // Récupérer les statistiques de satisfaction
  useEffect(() => {
    const fetchSatisfactionStats = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/commentaire/satisfaction/statistics`
        );
        setSatisfactionStats(response.data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des satisfactionStats:",
          error
        );
        setSatisfactionStats({
          decevant: 20.0,
          moyen: 30.0,
          bien: 25.0,
          tres_bien: 15.0,
          excellent: 10.0,
        });
      }
    };

    fetchSatisfactionStats();
  }, []);

  // Calculer la note moyenne basée sur les pourcentages
  const averageRating = useMemo(() => {
    if (!satisfactionStats) return 0;
    const weights = {
      decevant: 1,
      moyen: 2,
      bien: 3,
      tres_bien: 4,
      excellent: 5,
    };
    const total =
      (satisfactionStats.decevant * weights.decevant +
        satisfactionStats.moyen * weights.moyen +
        satisfactionStats.bien * weights.bien +
        satisfactionStats.tres_bien * weights.tres_bien +
        satisfactionStats.excellent * weights.excellent) /
      100;
    return total.toFixed(1);
  }, [satisfactionStats]);

  // Préparer les données pour le graphique des heures de pointe (organisateurs uniquement, en pourcentage)
  const peakHoursData = useMemo(() => {
    if (!sessionStats || !sessionStats.individualStats) {
      return {
        labels: ["8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"],
        datasets: [
          {
            label: "Activité Organisateurs",
            data: [0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(99, 102, 241, 0.8)",
            borderColor: "rgba(99, 102, 241, 1)",
            borderWidth: 1,
            borderRadius: 8,
            hoverBackgroundColor: "rgba(99, 102, 241, 1)",
          },
        ],
      };
    }

    const organizers = sessionStats.individualStats.filter(
      (stat) => stat.role === "organisateur"
    );

    const hours = ["8h", "10h", "12h", "14h", "16h", "18h", "20h", "22h"];
    const hourRanges = [
      { start: 0, end: 10, index: 0 },
      { start: 10, end: 12, index: 1 },
      { start: 12, end: 14, index: 2 },
      { start: 14, end: 16, index: 3 },
      { start: 16, end: 18, index: 4 },
      { start: 18, end: 20, index: 5 },
      { start: 20, end: 22, index: 6 },
      { start: 22, end: 24, index: 7 },
    ];
    const data = new Array(hours.length).fill(0);

    const totalDuration = organizers.reduce((sum, stat) => {
      return sum + (parseFloat(stat.lastSessionDuration) || 0);
    }, 0);

    organizers.forEach((stat) => {
      const startHour = stat.sessionStartTime
        ? new Date(stat.sessionStartTime).getHours()
        : Math.floor(Math.random() * 24);
      const duration = parseFloat(stat.lastSessionDuration) || 0;

      const range = hourRanges.find(
        (r) => startHour >= r.start && startHour < r.end
      );
      if (range) {
        data[range.index] += duration;
      }
    });

    const percentages = data.map((duration) =>
      totalDuration > 0 ? ((duration / totalDuration) * 100).toFixed(1) : 0
    );

    return {
      labels: hours,
      datasets: [
        {
          label: "Activité Organisateurs",
          data: percentages,
          backgroundColor: "rgba(99, 102, 241, 0.8)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 1,
          borderRadius: 8,
          hoverBackgroundColor: "rgba(99, 102, 241, 1)",
        },
      ],
    };
  }, [sessionStats]);

  useEffect(() => {
    if (revenueChartCanvasRef.current) {
      revenueChartRef.current = new Chart(revenueChartCanvasRef.current, {
        type: "line",
        data: {
          labels: [
            "Jan",
            "Fév",
            "Mar",
            "Avr",
            "Mai",
            "Juin",
            "Juil",
            "Août",
            "Sep",
            "Oct",
            "Nov",
            "Déc",
          ],
          datasets: [
            {
              label: "Revenus (en K€)",
              data: [12, 19, 15, 22, 24, 28, 31, 35, 32, 38, 42, 45],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.15)",
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: darkMode ? "#1a202c" : "#ffffff",
              pointBorderColor: "#6366f1",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
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
                },
              },
            },
            legend: {
              ...commonChartOptions.plugins.legend,
              display: true,
              position: "bottom",
              labels: {
                usePointStyle: true,
                padding: 20,
                color: darkMode ? "#cbd5e1" : "#4a5568",
              },
            },
          },
        },
      });
    }

    if (eventsChartCanvasRef.current && eventTypeData.length > 0) {
      if (eventsChartRef.current) {
        eventsChartRef.current.destroy();
      }
      eventsChartRef.current = new Chart(eventsChartCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: eventTypeData.map((e) => e.type),
          datasets: [
            {
              data: eventTypeData.map((e) => e.count),
              backgroundColor: eventTypeData.map(
                (_, index) => `hsl(${index * 60}, 70%, 50%)`
              ),
              borderColor: eventTypeData.map(
                (_, index) => `hsl(${index * 60}, 70%, 50%)`
              ),
              borderWidth: 1.5,
            },
          ],
        },
        options: doughnutChartOptions,
        plugins: [ChartDataLabels, centerTextPlugin],
      });
    }

    if (peakHoursChartCanvasRef.current) {
      peakHoursChartRef.current = new Chart(peakHoursChartCanvasRef.current, {
        type: "bar",
        data: peakHoursData,
        options: {
          ...commonChartOptions,
          plugins: {
            ...commonChartOptions.plugins,
            tooltip: {
              ...commonChartOptions.plugins.tooltip,
              callbacks: {
                label: function (context) {
                  return ` ${context.parsed.y}% des sessions`;
                },
              },
            },
          },
          scales: {
            y: {
              ...commonChartOptions.scales.y,
              max: 100,
              ticks: {
                ...commonChartOptions.scales.y.ticks,
                callback: function (value) {
                  return value + "%";
                },
              },
            },
            x: {
              ...commonChartOptions.scales.x,
            },
          },
        },
      });
    }

    if (registrationChartCanvasRef.current && registrationData.length > 0) {
      if (registrationChartRef.current) {
        registrationChartRef.current.destroy();
      }
      registrationChartRef.current = new Chart(
        registrationChartCanvasRef.current,
        {
          type: "line",
          data: {
            labels: registrationData.map((item) => item.month),
            datasets: [
              {
                label: "Inscriptions",
                data: registrationData.map((item) => item.count),
                borderColor: "#6366f1",
                backgroundColor: "rgba(99, 102, 241, 0.15)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#ffffff",
                pointBorderColor: "#6366f1",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            ...commonChartOptions,
            plugins: {
              ...commonChartOptions.plugins,
              legend: {
                ...commonChartOptions.plugins.legend,
                display: true,
                position: "bottom",
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  color: darkMode ? "#cbd5e1" : "#4a5568",
                },
              },
              tooltip: {
                ...commonChartOptions.plugins.tooltip,
                callbacks: {
                  label: function (context) {
                    return ` ${context.dataset.label}: ${context.parsed.y}`;
                  },
                },
              },
              datalabels: {
                color: darkMode ? "#E5E7EB" : "#374151",
                anchor: "end",
                align: "top",
                formatter: (value) => value,
              },
            },
          },
          plugins: [ChartDataLabels],
        }
      );
    }

    return () => {
      revenueChartRef.current?.destroy();
      eventsChartRef.current?.destroy();
      peakHoursChartRef.current?.destroy();
      registrationChartRef.current?.destroy();
    };
  }, [
    commonChartOptions,
    doughnutChartOptions,
    eventTypeData,
    registrationData,
    darkMode,
    peakHoursData,
  ]);

  const eventPercentage =
    totalEventMax > 0 ? ((eventCount / totalEventMax) * 100).toFixed(1) : "0.0";

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${bgClass}`}
    >
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Utilisateurs Totaux"
              value={`${userRate}%`}
              icon={MdPeople}
              trend={12.5}
              color="blue"
            />
            <StatsCard
              title="Événements Créés"
              value={`${eventPercentage}%`}
              icon={MdEvent}
              trend={22.1}
              color="green"
            />
            <StatsCard
              title="Revenus Totaux"
              value={revenueTotal}
              icon={MdTrendingUp}
              trend={18.9}
              color="purple"
            />
            <StatsCard
              title="Organisateurs"
              value={`${organizerRate}%`}
              icon={MdPerson}
              trend={5.5}
              color="orange"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Graphique des Revenus */}
            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-1`}
                  >
                    Évolution des Revenus
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Performance mensuelle sur les {selectedPeriod} derniers mois
                  </p>
                </div>
                <div className="relative mt-4 sm:mt-0">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className={`appearance-none ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
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
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={revenueChartCanvasRef}></canvas>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-1`}
                  >
                    Types d'Événements
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Répartition des événements par catégorie
                  </p>
                </div>
                <button
                  className={`flex items-center space-x-2 mt-4 sm:mt-0 ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } text-sm`}
                >
                  <span>Voir détails</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div
                className="chart-container flex items-center justify-center"
                style={{ height: "300px" }}
              >
                <canvas ref={eventsChartCanvasRef}></canvas>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-1`}
                  >
                    Évolution des Inscriptions
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Nouvelles inscriptions par mois
                  </p>
                </div>
                <div className="relative mt-4 sm:mt-0">
                  <select
                    className={`appearance-none ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-300 text-gray-800"
                    } border rounded-lg pl-3 pr-9 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer`}
                  >
                    <option>7 derniers mois</option>
                    <option>12 derniers mois</option>
                    <option>3 derniers mois</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={registrationChartCanvasRef}></canvas>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h3
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-1`}
                  >
                    Heures de Pointe
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Pourcentage d'activité des organisateurs par heure
                  </p>
                </div>
                <button
                  className={`flex items-center space-x-2 mt-4 sm:mt-0 ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-800"
                  } text-sm`}
                >
                  <span>Rapport détaillé</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={peakHoursChartCanvasRef}></canvas>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p
                  className={`text-xs flex items-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Heure la plus fréquentée:{" "}
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      20h-22h
                    </span>{" "}
                    (basé sur l'activité des organisateurs)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold flex items-center space-x-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-5`}
              >
                <MdEvent className="text-emerald-400" />
                <span>Utilisation des Tables</span>
              </h3>
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-md"></div>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Tables VIP
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div
                      className={`w-full sm:w-32 h-2.5 rounded-full ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="h-2.5 bg-green-500 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                    <span className="text-green-500 text-sm font-semibold">
                      85%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-md"></div>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Tables Standard
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div
                      className={`w-full sm:w-32 h-2.5 rounded-full ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="h-2.5 bg-blue-500 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                    <span className="text-blue-500 text-sm font-semibold">
                      72%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-md"></div>
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Tables Extérieures
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div
                      className={`w-full sm:w-32 h-2.5 rounded-full ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className="h-2.5 bg-yellow-500 rounded-full"
                        style={{ width: "43%" }}
                      ></div>
                    </div>
                    <span className="text-yellow-500 text-sm font-semibold">
                      43%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-7 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p
                  className={`text-xs flex items-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Taux d'occupation moyen:{" "}
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      67%
                    </span>{" "}
                    ce mois
                  </span>
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold flex items-center space-x-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-5`}
              >
                <MdPerson className="text-yellow-400" />
                <span>Satisfaction Client</span>
              </h3>
              {satisfactionStats ? (
                <div className="text-center py-4">
                  <div
                    className={`text-6xl font-extrabold mb-3 leading-none ${
                      darkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    {averageRating}
                    <span
                      className={`text-3xl ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      /5
                    </span>
                  </div>
                  <div className="flex justify-center space-x-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <MdStar
                        key={`star-${i}`}
                        className={`${
                          darkMode ? "text-yellow-400" : "text-yellow-500"
                        } ${i < Math.round(averageRating) ? "" : "opacity-50"}`}
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Excellent</span>
                        <span>{satisfactionStats.excellent.toFixed(1)}%</span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2.5 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${satisfactionStats.excellent}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Très bien</span>
                        <span>{satisfactionStats.tres_bien.toFixed(1)}%</span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2.5 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="bg-blue-500 h-2.5 rounded-full"
                          style={{ width: `${satisfactionStats.tres_bien}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Bien</span>
                        <span>{satisfactionStats.bien.toFixed(1)}%</span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2.5 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="bg-teal-500 h-2.5 rounded-full"
                          style={{ width: `${satisfactionStats.bien}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Moyen</span>
                        <span>{satisfactionStats.moyen.toFixed(1)}%</span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2.5 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: `${satisfactionStats.moyen}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`flex justify-between text-sm mb-1 ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <span>Décevant</span>
                        <span>{satisfactionStats.decevant.toFixed(1)}%</span>
                      </div>
                      <div
                        className={`w-full rounded-full h-2.5 ${
                          darkMode ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className="bg-red-500 h-2.5 rounded-full"
                          style={{ width: `${satisfactionStats.decevant}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Chargement des données de satisfaction...
                  </p>
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl p-6 border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold flex items-center space-x-3 ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-5`}
              >
                <MdCalendarToday className="text-teal-400" />
                <span>Heures de Pointe</span>
              </h3>
              <div className="chart-container" style={{ height: "220px" }}>
                <canvas ref={peakHoursChartCanvasRef}></canvas>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p
                  className={`text-xs flex items-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Heure la plus fréquentée:{" "}
                    <span
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      20h-22h
                    </span>{" "}
                    (basé sur l'activité des organisateurs)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl p-6 border mb-12 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-2xl font-bold flex items-center space-x-3 ${
                darkMode ? "text-white" : "text-gray-900"
              } mb-8`}
            >
              <MdTrendingUp className="text-indigo-400" />
              <span>Tendances Récentes</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                className={`rounded-xl p-5 border ${
                  darkMode
                    ? "border-green-500/20 bg-gray-700/30"
                    : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-green-500/20" : "bg-green-100"
                    }`}
                  >
                    <MdEvent className="text-green-400 text-xl" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl font-extrabold mb-1 leading-none ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      +34%
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Réservations ce mois
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-xl p-5 border ${
                  darkMode
                    ? "border-red-500/20 bg-gray-700/30"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-red-500/20" : "bg-red-100"
                    }`}
                  >
                    <MdCancel className="text-red-400 text-xl" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl font-extrabold mb-1 leading-none ${
                        darkMode ? "text-red-400" : "text-red-600"
                      }`}
                    >
                      -12%
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Taux d'annulation
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-xl p-5 border ${
                  darkMode
                    ? "border-yellow-500/20 bg-gray-700/30"
                    : "border-yellow-200 bg-yellow-50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${
                      darkMode ? "bg-yellow-500/20" : "bg-yellow-100"
                    }`}
                  >
                    <MdAttachMoney className="text-yellow-400 text-xl" />
                  </div>
                  <div>
                    <div
                      className={`text-3xl font-extrabold mb-1 leading-none ${
                        darkMode ? "text-yellow-400" : "text-yellow-600"
                      }`}
                    >
                      +8%
                    </div>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Revenus par client
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statique;