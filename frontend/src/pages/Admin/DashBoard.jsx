import React, { useState, useRef, useEffect } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import {
  FaCogs,
  FaUsers,
  FaUser,
  FaBell,
  FaEnvelope,
  FaUserCircle,
  FaRegUserCircle,
} from "react-icons/fa";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdAttachMoney,
  MdEventAvailable,
  MdEventNote,
} from "react-icons/md";
import { ChevronDown } from "lucide-react";
import {
  getLastTransactions,
  getRevenuMensuel,
  getSumForUsersForfait,
} from "../../services/forfaitService";
import { getCountForAllEventStats } from "../../services/evenementServ";
import { getOrgStats, getUserCount } from "../../services/userService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaRegMoneyBill1 } from "react-icons/fa6";

export default function Dashboard() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [engagementChartType, setEngagementChartType] = useState("progress");

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  const [totalRevenu, setTotalRevenu] = useState(0);
  const [statEvent, setStatEvent] = useState({
    total: 0,
    passes: 0,
    avenir: 0,
  });
  const [orgStats, setOrgStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  // Ajout de l'état sessionStats
  const [sessionStats, setSessionStats] = useState({});
  // État pour engagementStats
  const [engagementStats, setEngagementStats] = useState([
    { label: "Taux d'ouverture", value: "0%", progress: 0 },
    {
      label: "Taux de participation aux événements",
      value: "50%",
      progress: 50,
    },
    {
      label: "Taux de réponse aux notifications/messages",
      value: "60%",
      progress: 60,
    },
    {
      label: "Temps moyen passé par utilisateur (min)",
      value: "0 min",
      progress: 0,
    },
  ]);

  useEffect(() => {
    document.title = "Tableau de bord - Admin";
    const fetchData = async () => {
      try {
        const SumForUsersForfait = await getSumForUsersForfait();
        const CountForAllEventStats = await getCountForAllEventStats();
        const orgaStat = await getOrgStats();
        const transaction = await getLastTransactions();
        // Requête pour le Taux d'ouverture
        const userStats = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/user/stats`).then(res => res.json());

        // Requête pour les statistiques de temps passé
        const sessionStats = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/session-stats`).then(res => res.json())

        setTransactions(transaction);
        setOrgStats(orgaStat);
        setStatEvent(CountForAllEventStats);
        setTotalRevenu(SumForUsersForfait);
        setSessionStats(sessionStats);

        // Mise à jour des statistiques d'engagement
        setEngagementStats(prevStats =>
          prevStats.map(stat => {
            if (stat.label === "Taux d'ouverture") {
              return {
                ...stat,
                value: Number(userStats.onlinePercentage) % 1 === 0
                  ? `${Math.floor(Number(userStats.onlinePercentage))}%`
                  : `${Number(userStats.onlinePercentage).toFixed(2)}%`,
                progress: parseFloat(userStats.onlinePercentage),
              };
            }
            if (stat.label === "Temps moyen passé par utilisateur (min)") {
              return {
                ...stat,
                value: `${sessionStats.averageSessionDuration} min`,
                progress: Math.min(parseFloat(sessionStats.averageSessionDuration), 100), // Limiter à 100 pour la barre de progression
              };
            }
            return stat;
          })
        );
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };
    fetchData();
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const payments = [
    { user: "Alice", amount: 250, date: "20/07/2025" },
    { user: "Bob", amount: 100, date: "18/07/2025" },
    { user: "Charlie", amount: 300, date: "15/07/2025" },
  ];

  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);

  const stats = [
    {
      label: "Nombre d'événements",
      value: statEvent.total,
      icon: <MdCalendarToday />,
    },
    {
      label: "Total des revenus",
      value: `$${totalRevenu}`,
      icon: <MdAttachMoney />,
    },
    {
      label: "Événements passés",
      value: statEvent.passes,
      icon: <MdOutlineCalendarMonth />,
    },
    {
      label: "Événements actifs",
      value: statEvent.avenir,
      icon: <MdEventAvailable />,
    },
    { label: "Organisateurs", value: orgStats.count, icon: <FaUsers /> },
  ];

  const quickActions = [
    { label: "Gérer utilisateurs", icon: <FaUsers /> },
    { label: "Paramètres", icon: <FaCogs /> },
    { label: "Voir rapports", icon: <MdEventNote /> },
  ];

  const notifications = [
    "Nouvel organisateur inscrit",
    "Événement 'Conférence Tech' mis à jour",
    "Paiement reçu pour 'Atelier React'",
    "Nouveau message de support",
  ];

  const messages = [
    { from: "Alice", text: "Bonjour, j’ai une question sur l’événement." },
    { from: "Bob", text: "Le planning a été modifié." },
    { from: "Charlie", text: "Merci pour la confirmation." },
  ];

  const recentOrganizers = [
    { name: "Claire Dupont", email: "claire.dupont@mail.com" },
    { name: "Jean Martin", email: "jean.martin@mail.com" },
    { name: "Sophie Lemoine", email: "sophie.lemoine@mail.com" },
  ];

  const engagementGradientColors = [
    "bg-gradient-to-r from-blue-400 to-blue-600",
    "bg-gradient-to-r from-green-400 to-green-600",
    "bg-gradient-to-r from-purple-400 to-purple-600",
    "bg-gradient-to-r from-yellow-400 to-yellow-600",
  ];

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";

  const gradients = [
    "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 text-white shadow-lg shadow-blue-500/30",
    "bg-gradient-to-r from-red-500 via-pink-600 to-rose-500 text-white shadow-lg shadow-rose-500/30",
    "bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30",
  ];
  const glowEffects = [
    "0 0 15px rgba(59, 130, 246, 0.6)",
    "0 0 15px rgba(244, 63, 94, 0.6)",
    "0 0 15px rgba(74, 222, 128, 0.6)",
  ];

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";

  return (
<<<<<<< HEAD
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${pageBg}`}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`flex-1 min-w-[150px] sm:min-w-[180px] max-w-[230px] pt-5 px-6 rounded-2xl shadow-xl transition duration-300 cursor-pointer ${darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-white text-gray-900"
                  }`}
              >
                <h3 className={`font-semibold ${gradientTitle}`}>
                  {stat.label}
                </h3>
                <div className="flex justify-between items-center pt-8 pb-3">
                  <span className="text-[20px] sm:text-[22px] font-bold">
                    {stat.value}
                  </span>
                  <span className="text-[24px] sm:text-[26px] text-gray-500 dark:text-gray-400">
                    {stat.icon}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
=======
    <div className="p-8 h-screen overflow-y-auto bg-gradient-to-r from-white to-gray-50">
      <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <MdDashboard className="mr-3" /> Tableau de bord
        </h2>
      </div>
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)

          <div className="flex flex-wrap gap-6 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-900"
                }`}
            >
              <EventChart darkMode={darkMode} eventData={statEvent.eventTypeStat} />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-900"
                }`}
            >
              <MoneyChart darkMode={darkMode} />
            </motion.div>
          </div>

          <SectionWrapper
            title="Statistiques d’engagement"
            darkMode={darkMode}
            gradientTitle={gradientTitle}
          >
            {/* Affichage des statistiques existantes */}
            {engagementStats.map(({ label, value, progress }, i) => (
              <div key={`engagement-${i}`} className="mb-4">
                <div className="flex justify-between font-semibold mb-1">
                  {label} : {value}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div
                    className={`${engagementGradientColors[i % engagementGradientColors.length]} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </SectionWrapper>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 flex-shrink-0 w-full lg:max-w-md">
          <SectionWrapper
            title="Organisateurs récents"
            darkMode={darkMode}
            gradientTitle={gradientTitle}
          >
            {Array.isArray(orgStats?.lastOrganizers) &&
              orgStats.lastOrganizers.length > 0 ? (
              <ul className="space-y-3">
                {orgStats.lastOrganizers.map(
                  ({ name, email, photo, createdAt }, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-4 p-3 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <FaUserCircle className="text-4xl text-purple-500" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm sm:text-base ">
                          <p className={`font-semibold text-base sm:text-lg text-gray-100 dark:text-gray-100 ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-200"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}>
                            {name}
                          </p>
                          <p className={`text-xs sm:text-sm text-gray-300 dark:text-gray-400 mt-1 sm:mt-0 ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-200"
                              : "bg-white border-gray-200 text-gray-900"
                          }`}>
                            Inscrit le{" "}
                            {format(new Date(createdAt), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <p className={`text-sm text-gray-300 dark:text-gray-400 truncate ${
                          darkMode
                            ? "bg-gray-800 border-gray-700 text-gray-200"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}>
                          {email}
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                <FaRegUserCircle className="text-5xl mb-2 text-purple-400" />
                <p className="text-lg font-semibold">
                  Aucun organisateur récemment inscrit
                </p>
                <p className="text-sm">
                  Les nouveaux organisateurs s’afficheront ici dès leur
                  inscription.
                </p>
              </div>
            )}
          </SectionWrapper>

          <SectionWrapper
            title="Derniers paiements"
            darkMode={darkMode}
            gradientTitle={gradientTitle}
          >
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto scrollable">
                <table className="w-full text-left border-collapse min-w-[450px]">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-700 text-sm sm:text-base">
                      <th className="p-3">Utilisateur</th>
                      <th className="p-3">Montant</th>
                      <th className="p-3">Date d'expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(({ name, amount, date, photo }, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                      >
                        <td className="p-3 flex items-center gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <FaUserCircle className="text-2xl text-purple-500" />
                          )}
                          <span className="font-medium text-sm sm:text-base">
                            {name}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-green-600 dark:text-green-400">
                          ${Number(amount).toFixed(2)}
                        </td>
                        <td className={`p-3 text-sm text-gray-300 dark:text-gray-400 ${
                          darkMode
                            ? "bg-gray-800 border-gray-700 text-gray-200"
                            : "bg-white border-gray-200 text-gray-900"
                        }`}>
                          {format(new Date(date), "dd MMM yyyy, HH:mm", {
                            locale: fr,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                <FaRegMoneyBill1 className="text-5xl mb-2 text-purple-400" />
                <p className="text-lg font-semibold">Aucun paiement récent</p>
              </div>
            )}
          </SectionWrapper>

          <div className="flex flex-col gap-4">
            {quickActions.map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1, boxShadow: glowEffects[i] }}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 font-semibold rounded-xl shadow-md hover:scale-105 transition ${gradients[i]}`}
              >
                {action.icon}
                {action.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
          className={`relative p-2 rounded-full transition-all duration-200 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
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
            className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-900"
              } z-50 transition-all duration-200 ${isMobile ? "left-4 right-4" : "right-0"
              }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              {React.cloneElement(icon, { className: "w-5 h-5" })}
              <h4 className="font-semibold text-sm sm:text-base">{label}</h4>
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
                    className={`p-3 transition-colors duration-150 border-b ${darkMode
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
                      className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                    >
                      Il y a {Math.floor(Math.random() * 60)} min
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
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

function SectionWrapper({ children, title, darkMode, gradientTitle }) {
  return (
    <section
      className={`p-5 sm:p-6 rounded-2xl shadow-xl ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        }`}
    >
      <h3 className={`text-xl font-semibold mb-4 ${gradientTitle}`}>{title}</h3>
      {children}
    </section>
  );
}

function EventChart({ darkMode, eventData }) {
  const filteredData = eventData?.filter((item) => item.type) || [];

  const labels = filteredData.map(item => item.type);
  const totals = filteredData.map(item => item.total);
  const percentages = filteredData.map(item => item.percentage);

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Événements par type
      </h3>
      <BarChart
        series={[
          {
            data: totals,
            label: "Nombre total",
            LabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
          },
          {
            data: percentages,
            label: "Pourcentage",
            LabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
          },
        ]}
        xAxis={[
          {
            data: labels,
            tickLabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
          },
        ]}
        height={270}
        margin={{ top: 20, right: 10, bottom: 20, left: 5 }}
        width={480}
        className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          }`}
      />
    </div>
  );
}

function MoneyChart({ darkMode }) {
  const margin = { right: 24 };
  const [revenus, setRevenus] = useState([]);
  const [labels, setLabels] = useState([]);

  const colorsMap = {
    freemium: "#a3a3a3",
    starter: "#60a5fa",
    pro: "#34d399",
    premium: "#fbbf24",
    gold: "#f59e0b",
  };

  const fetchData = async () => {
    try {
      const res = await getRevenuMensuel();
      const xLabels = res.map((item) => item.name);
      const yData = res.map((item) => item.percentage);
      setLabels(xLabels);
      setRevenus(yData);
    } catch (err) {
      console.error("Erreur lors du chargement des revenus", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Revenus par Forfait
      </h3>
      <BarChart
        series={[
          {
            data: revenus,
            label: "Affichage de revenus par poucentage (%)",
            color: "#a855f7",
          },
        ]}
        xAxis={[
          {
            scaleType: "band",
            data: labels,
            tickLabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
          },
        ]}
        yAxis={[
          {
            min: 0,
            max: 100,
            tickLabelStyle: {
              fill: darkMode ? "#ffffff" : "#000000",
            },
            valueFormatter: (value) => `${value} %`,
          },
        ]}
        height={270}
        margin={{ top: 20, right: 10, bottom: 20, left: 5 }}
        width={480}
        className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px]${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          }`}
      />
    </div>
  );
}