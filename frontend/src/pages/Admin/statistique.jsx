import React, { useEffect, useMemo, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";
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
import { useDarkMode } from "../../context/DarkModeContext";
import statsService from "../../services/statsService";
import { url } from "../../api/url";

// Register Chart.js plugins
Chart.register(ChartDataLabels);

// Center text plugin for doughnut charts
const centerTextPlugin = {
  id: "centerText",
  afterDraw(chart) {
    if (chart.config.type !== "doughnut") return;

    const { ctx, chartArea, width, height } = chart;
    ctx.save();

    // Calculate the center of the doughnut (accounting for chartArea)
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    // Detect mobile view (screen width < 640px)
    const isMobile = window.innerWidth < 640;

    // Responsive font size: smaller for mobile
    const fontSize = isMobile
      ? Math.min(height / 150, 12).toFixed(2) // Smaller font for mobile
      : Math.min(height / 120, 16).toFixed(2); // Default for larger screens
    ctx.font = `bold ${fontSize}em sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = chart.options.plugins?.centerText?.darkMode ? "#e2e8f0" : "#4a5568";

    // Calculate total
    const total = chart.data.datasets[0].data.reduce(
      (a, b) => (typeof a === "number" ? a : 0) + (typeof b === "number" ? b : 0),
      0
    );

    // Draw the text at the precise center
    ctx.fillText(`Total: ${total}`, centerX, centerY);
    ctx.restore();
  },
};

Chart.register(centerTextPlugin);

// StatsCard Component
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
      className={`relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`absolute -mr-4 -mt-4 h-20 w-20 rounded-full bg-gradient-to-br ${colors[color].bg} opacity-10`}
      />
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`mb-1 text-sm font-medium ${
              darkMode ? "text-blue-300" : "text-blue-600"
            }`}
          >
            {title}
          </p>
          <p className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
          {trend && (
            <div className="mt-1 flex items-center">
              <MdTrendingUp className={`mr-1 ${trend > 0 ? "text-green-500" : "text-red-500"}`} />
              <span className={`text-sm ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-full bg-gradient-to-br p-3 ${colors[color].bg} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

// Dropdown Component
const Dropdown = React.forwardRef(({ show, setShow, icon, label, count, items }, ref) => {
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
        className={`relative rounded-full p-2 transition-all duration-200 ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
        aria-label={label}
      >
        <div className="relative">
          {React.cloneElement(icon, { className: "h-5 w-5" })}
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
      </button>

      {show && (
        <div
          className={`fixed sm:absolute mt-2 max-h-[70vh] overflow-y-auto rounded-xl border shadow-xl transition-all duration-200 ${
            darkMode ? "border-gray-700 bg-gray-800 text-gray-200" : "border-gray-200 bg-white text-gray-900"
          } z-50 ${isMobile ? "left-4 right-4 w-[calc(100vw-2rem)]" : "right-0 w-80"}`}
        >
          <div className="flex items-center gap-2 border-b border-gray-200 p-4 dark:border-gray-700">
            {React.cloneElement(icon, { className: "h-5 w-5" })}
            <h4
              className={`text-sm font-semibold sm:text-base ${
                darkMode ? "text-purple-300" : "text-purple-600"
              }`}
            >
              {label}
            </h4>
            {count > 0 && (
              <span className="ml-auto rounded-full bg-blue-500 px-2 py-1 text-xs text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className={`cursor-pointer border-b p-3 transition-colors duration-150 ${
                    darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="line-clamp-2 text-sm">
                    {typeof item === "object" ? `${item.from}: ${item.text}` : item}
                  </p>
                  <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Il y a {Math.floor(Math.random() * 60)} min
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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

// Main Statique Component
const Statique = () => {
  const { darkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [satisfactionStats, setSatisfactionStats] = useState(null);
  const [userRate, setUserRate] = useState("0.0");
  const [organizerRate, setOrganizerRate] = useState("0.0");
  const [eventCount, setEventCount] = useState(0);
  const [revenueTotal, setRevenueTotal] = useState("€ 0");
  const [eventTypeData, setEventTypeData] = useState([]);
  const [registrationData, setRegistrationData] = useState([]);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({ revenue: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("12");

  const totalEventMax = 1000;

  const revenueChartRef = useRef(null);
  const eventsChartRef = useRef(null);
  const peakHoursChartRef = useRef(null);
  const registrationChartRef = useRef(null);
  const revenueChartCanvasRef = useRef(null);
  const eventsChartCanvasRef = useRef(null);
  const peakHoursChartCanvasRef = useRef(null);
  const registrationChartCanvasRef = useRef(null);

  // Fetch chart data
  const fetchChartData = async () => {
    try {
      setLoading(true);
      // console.log(`🔄 Chargement des données pour ${selectedPeriod} mois`);
      const response = await fetch(`${url}/forfait/dashboard-charts?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // console.log("📊 Données reçues:", data);
      setChartData(data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update revenue chart
  const updateRevenueChart = (revenueData) => {
    // console.log("📈 Mise à jour graphique revenus:", revenueData);
    if (revenueChartRef.current) {
      revenueChartRef.current.destroy();
    }

    if (!revenueChartCanvasRef.current) return;

    const ctx = revenueChartCanvasRef.current.getContext("2d");
    revenueChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: revenueData.map((item) => item.month),
        datasets: [
          {
            label: "Revenus (€)",
            data: revenueData.map((item) => item.total),
            borderColor: "#3B82F6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: darkMode ? "#ffffff" : "#000000" },
          },
        },
        scales: {
          x: {
            ticks: { color: darkMode ? "#9CA3AF" : "#6B7280" },
            grid: { color: darkMode ? "#374151" : "#E5E7EB" },
          },
          y: {
            ticks: { color: darkMode ? "#9CA3AF" : "#6B7280" },
            grid: { color: darkMode ? "#374151" : "#E5E7EB" },
          },
        },
      },
    });
  };

  // Update events chart
  const updateEventsChart = (eventsData) => {
    // console.log("🎯 Mise à jour graphique événements:", eventsData);
    if (eventsChartRef.current) {
      eventsChartRef.current.destroy();
    }

    if (!eventsChartCanvasRef.current) return;

    const ctx = eventsChartCanvasRef.current.getContext("2d");
    eventsChartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: eventsData.map((item) => item.type),
        datasets: [
          {
            data: eventsData.map((item) => item.count),
            backgroundColor: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: darkMode ? "#ffffff" : "#000000", padding: 20 },
          },
          centerText: { darkMode },
          datalabels: {
            formatter: (value, context) => {
              const rawData = context.chart.data.datasets[0].data;
              const total = rawData.reduce((a, b) => a + b, 0);
              return `${((value / total) * 100).toFixed(1)}%`;
            },
            color: darkMode ? "#fff" : "#1a202c",
            font: { weight: "bold", size: 14 },
            display: "auto",
          },
        },
      },
      plugins: [ChartDataLabels, centerTextPlugin],
    });
  };

  // Common chart options
  const commonChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: darkMode ? "rgba(22, 33, 62, 0.9)" : "rgba(255, 255, 255, 0.9)",
          titleColor: darkMode ? "#e2e8f0" : "#1a202c",
          bodyColor: darkMode ? "#cbd5e1" : "#4a5568",
          borderColor: darkMode ? "rgba(74, 85, 104, 0.5)" : "rgba(226, 232, 240, 0.5)",
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
            color: darkMode ? "rgba(74, 85, 104, 0.1)" : "rgba(226, 232, 240, 0.1)",
            drawBorder: false,
          },
          ticks: { color: darkMode ? "#a0aec0" : "#718096" },
        },
        x: {
          grid: { display: false },
          ticks: { color: darkMode ? "#a0aec0" : "#718096" },
        },
      },
    }),
    [darkMode]
  );

  // Doughnut chart options
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
            return `${((value / total) * 100).toFixed(1)}%`;
          },
          color: darkMode ? "#fff" : "#1a202c",
          font: { weight: "bold", size: 14 },
          display: "auto",
        },
        centerText: { darkMode },
      },
    }),
    [commonChartOptions, darkMode]
  );

  // Fetch stats
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

  // Fetch session stats
  useEffect(() => {
    const fetchSessionStats = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/auth/session-stats`);
        setSessionStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des sessionStats:", error);
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

  // Fetch satisfaction stats
  useEffect(() => {
    const fetchSatisfactionStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/commentaire/satisfaction/statistics`
        );
        setSatisfactionStats(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des satisfactionStats:", error);
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

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!satisfactionStats) return 0;
    const weights = { decevant: 1, moyen: 2, bien: 3, tres_bien: 4, excellent: 5 };
    const total =
      (satisfactionStats.decevant * weights.decevant +
        satisfactionStats.moyen * weights.moyen +
        satisfactionStats.bien * weights.bien +
        satisfactionStats.tres_bien * weights.tres_bien +
        satisfactionStats.excellent * weights.excellent) /
      100;
    return total.toFixed(1);
  }, [satisfactionStats]);

  // Prepare peak hours data
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

    const organizers = sessionStats.individualStats.filter((stat) => stat.role === "organisateur");
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

    const totalDuration = organizers.reduce(
      (sum, stat) => sum + (parseFloat(stat.lastSessionDuration) || 0),
      0
    );

    organizers.forEach((stat) => {
      const startHour = stat.sessionStartTime
        ? new Date(stat.sessionStartTime).getHours()
        : Math.floor(Math.random() * 24);
      const duration = parseFloat(stat.lastSessionDuration) || 0;
      const range = hourRanges.find((r) => startHour >= r.start && startHour < r.end);
      if (range) data[range.index] += duration;
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

  // Chart updates
  useEffect(() => {
    if (!loading && chartData.revenue?.length > 0) {
      updateRevenueChart(chartData.revenue);
    }
  }, [chartData.revenue, darkMode, loading]);

  useEffect(() => {
    if (!loading && chartData.events?.length > 0) {
      updateEventsChart(chartData.events);
    }
  }, [chartData.events, darkMode, loading]);

  useEffect(() => {
    fetchChartData();
  }, [selectedPeriod]);

  useEffect(() => {
    if (revenueChartCanvasRef.current) {
      if (revenueChartRef.current) revenueChartRef.current.destroy();
      revenueChartRef.current = new Chart(revenueChartCanvasRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
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
                label: (context) => ` ${context.parsed.y}K€`,
              },
            },
            legend: {
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
      if (eventsChartRef.current) eventsChartRef.current.destroy();
      eventsChartRef.current = new Chart(eventsChartCanvasRef.current, {
        type: "doughnut",
        data: {
          labels: eventTypeData.map((e) => e.type),
          datasets: [
            {
              data: eventTypeData.map((e) => e.count),
              backgroundColor: eventTypeData.map((_, index) => `hsl(${index * 60}, 70%, 50%)`),
              borderColor: eventTypeData.map((_, index) => `hsl(${index * 60}, 70%, 50%)`),
              borderWidth: 1.5,
            },
          ],
        },
        options: {
          ...doughnutChartOptions,
          plugins: {
            ...doughnutChartOptions.plugins,
            centerText: { darkMode },
          },
        },
        plugins: [ChartDataLabels, centerTextPlugin],
      });
    }

    if (peakHoursChartCanvasRef.current) {
      if (peakHoursChartRef.current) peakHoursChartRef.current.destroy();
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
                label: (context) => ` ${context.parsed.y}% des sessions`,
              },
            },
          },
          scales: {
            y: {
              ...commonChartOptions.scales.y,
              max: 100,
              ticks: {
                ...commonChartOptions.scales.y.ticks,
                callback: (value) => `${value}%`,
              },
            },
            x: { ...commonChartOptions.scales.x },
          },
        },
      });
    }

    if (registrationChartCanvasRef.current && registrationData.length > 0) {
      if (registrationChartRef.current) registrationChartRef.current.destroy();
      registrationChartRef.current = new Chart(registrationChartCanvasRef.current, {
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
                label: (context) => ` ${context.dataset.label}: ${context.parsed.y}`,
              },
            },
            datalabels: {
              color: darkMode ? "#E5E7EB" : "#374151",
              anchor: "end",
              align: "top",
              formatter: (value) => value,
            },
          },
          plugins: [ChartDataLabels],
        },
      });
    }

    return () => {
      revenueChartRef.current?.destroy();
      eventsChartRef.current?.destroy();
      peakHoursChartRef.current?.destroy();
      registrationChartRef.current?.destroy();
    };
  }, [commonChartOptions, doughnutChartOptions, eventTypeData, registrationData, darkMode, peakHoursData]);

  const notifications = [
    "Nouvel utilisateur inscrit",
    "Nouvel événement créé",
    "Paiement reçu pour un événement",
  ];

  const messages = [
    { from: "Organisateur", text: "Besoin d'aide pour créer un événement" },
    { from: "Utilisateur", text: "Problème avec ma réservation" },
  ];

  const eventPercentage =
    totalEventMax > 0 ? ((eventCount / totalEventMax) * 100).toFixed(1) : "0.0";

  return (
    <div
      className={`mx-auto min-h-screen w-full p-4 transition duration-500 sm:p-6 md:p-8 ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800"
      }`}
    >
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!loading && !error && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                <div>
                  <h3 className={`mb-1 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
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
                    className={`appearance-none rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                      darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"
                    }`}
                  >
                    <option value="12">12 derniers mois</option>
                    <option value="6">6 derniers mois</option>
                    <option value="3">3 derniers mois</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={revenueChartCanvasRef} />
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                <div>
                  <h3 className={`mb-1 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Types d'Événements
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray- Or400" : "text-gray-600"}`}>
                    Répartition des événements par catégorie
                  </p>
                </div>
              </div>
              <div className="chart-container flex items-center justify-center" style={{ height: "300px" }}>
                <canvas ref={eventsChartCanvasRef} />
              </div>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                <div>
                  <h3 className={`mb-1 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Évolution des Inscriptions
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Nouvelles inscriptions par mois
                  </p>
                </div>
                <div className="relative mt-4 sm:mt-0">
                  <select
                    className={`appearance-none rounded-lg border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                      darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-800"
                    }`}
                  >
                    <option>7 derniers mois</option>
                    <option>12 derniers mois</option>
                    <option>3 derniers mois</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={registrationChartCanvasRef} />
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                <div>
                  <h3 className={`mb-1 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Heures de Pointe
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Pourcentage d'activité des organisateurs par heure
                  </p>
                </div>
                {/* <button
                  className={`mt-4 flex items-center space-x-2 text-sm sm:mt-0 ${
                    darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  <span>Rapport détaillé</span>
                  <ChevronDown className="h-4 w-4" />
                </button> */}
              </div>
              <div className="chart-container" style={{ height: "300px" }}>
                <canvas ref={peakHoursChartCanvasRef} />
              </div>
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className={`flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Heure la plus fréquentée:{" "}
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      20h-22h
                    </span>{" "}
                    (basé sur l'activité des organisateurs)
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`mb-5 flex items-center space-x-3 text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                <MdEvent className="text-emerald-400" />
                <span>Utilisation des Tables</span>
              </h3>
              <div className="space-y-5">
                {[
                  { label: "Tables VIP", color: "green-500", percentage: 85 },
                  { label: "Tables Standard", color: "blue-500", percentage: 72 },
                  { label: "Tables Extérieures", color: "yellow-500", percentage: 43 },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                    <div className="mb-2 flex items-center space-x-3 sm:mb-0">
                      <div className={`h-4 w-4 rounded-full bg-${item.color} shadow-md`} />
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.label}</span>
                    </div>
                    <div className="flex w-full items-center space-x-3 sm:w-auto">
                      <div className={`h-2.5 w-full rounded-full sm:w-32 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                        <div className={`h-2.5 rounded-full bg-${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                      <span className={`text-sm font-semibold text-${item.color}`}>{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className={`flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Taux d'occupation moyen:{" "}
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>67%</span> ce mois
                  </span>
                </p>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`mb-5 flex items-center space-x-3 text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                <MdPerson className="text-yellow-400" />
                <span>Satisfaction Client</span>
              </h3>
              {satisfactionStats ? (
                <div className="py-4 text-center">
                  <div className={`mb-3 text-6xl font-extrabold leading-none ${darkMode ? "text-green-400" : "text-green-600"}`}>
                    {averageRating}
                    <span className={`text-3xl ${darkMode ? "text-gray-400" : "text-gray-500"}`}>/5</span>
                  </div>
                  <div className="mb-5 flex justify-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <MdStar
                        key={`star-${i}`}
                        className={`${darkMode ? "text-yellow-400" : "text-yellow-500"} ${
                          i < Math.round(averageRating) ? "" : "opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Excellent", value: satisfactionStats.excellent, color: "green-500" },
                      { label: "Très bien", value: satisfactionStats.tres_bien, color: "blue-500" },
                      { label: "Bien", value: satisfactionStats.bien, color: "teal-500" },
                      { label: "Moyen", value: satisfactionStats.moyen, color: "yellow-500" },
                      { label: "Décevant", value: satisfactionStats.decevant, color: "red-500" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className={`mb-1 flex justify-between text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span>{item.label}</span>
                          <span>{item.value.toFixed(1)}%</span>
                        </div>
                        <div className={`h-2.5 w-full rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                          <div className={`h-2.5 rounded-full bg-${item.color}`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Chargement des données de satisfaction...
                  </p>
                </div>
              )}
            </div>

            {/* <div
              className={`rounded-2xl border p-6 ${
                darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
              <h3 className={`mb-5 flex items-center space-x-3 text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                <MdCalendarToday className="text-teal-400" />
                <span>Heures de Pointe</span>
              </h3>
              <div className="chart-container" style={{ height: "220px" }}>
                <canvas ref={peakHoursChartCanvasRef} />
              </div>
              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className={`flex items-center text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <MdInfo className="mr-2 text-indigo-400" />
                  <span>
                    Heure la plus fréquentée:{" "}
                    <span className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      20h-22h
                    </span>{" "}
                    (basé sur l'activité des organisateurs)
                  </span>
                </p>
              </div>
            </div> */}
          </div>

          <div
            className={`mb-12 rounded-2xl border p-6 ${
              darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
            }`}
          >
            <h3 className={`mb-8 flex items-center space-x-3 text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              <MdTrendingUp className="text-indigo-400" />
              <span>Tendances Récentes</span>
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: MdEvent,
                  value: "+34%",
                  label: "Réservations ce mois",
                  color: "green",
                  bgOpacity: darkMode ? "bg-green-500/20" : "bg-green-100",
                  border: darkMode ? "border-green-500/20" : "border-green-200",
                },
                {
                  icon: MdCancel,
                  value: "-12%",
                  label: "Taux d'annulation",
                  color: "red",
                  bgOpacity: darkMode ? "bg-red-500/20" : "bg-red-100",
                  border: darkMode ? "border-red-500/20" : "border-red-200",
                },
                {
                  icon: MdAttachMoney,
                  value: "+8%",
                  label: "Revenus par client",
                  color: "yellow",
                  bgOpacity: darkMode ? "bg-yellow-500/20" : "bg-yellow-100",
                  border: darkMode ? "border-yellow-500/20" : "border-yellow-200",
                },
              ].map((trend) => (
                <div
                  key={trend.label}
                  className={`rounded-xl border p-5 ${trend.border} ${darkMode ? "bg-gray-700/30" : `bg-${trend.color}-50`}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-lg p-3 ${trend.bgOpacity}`}>
                      <trend.icon className={`text-${trend.color}-400 text-xl`} />
                    </div>
                    <div>
                      <div
                        className={`text-3xl font-extrabold leading-none ${
                          darkMode ? `text-${trend.color}-400` : `text-${trend.color}-600`
                        }`}
                      >
                        {trend.value}
                      </div>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{trend.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statique;