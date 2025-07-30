import React, { useState, useRef, useEffect } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import { FaCogs, FaUsers, FaUser, FaBell, FaEnvelope, FaUserCircle } from "react-icons/fa";
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

export default function Dashboard() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [engagementChartType, setEngagementChartType] = useState('progress');

  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
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
    { label: "Nombre d'événements", value: "20", icon: <MdCalendarToday /> },
    { label: "Total des revenus", value: `$${totalRevenue}`, icon: <MdAttachMoney /> },
    { label: "Événements passés", value: "20", icon: <MdOutlineCalendarMonth /> },
    { label: "Événements actifs", value: "20", icon: <MdEventAvailable /> },
    { label: "Organisateurs", value: "20", icon: <FaUsers /> },
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

  const engagementStats = [
    { label: "Taux d'ouverture", value: "75%", progress: 75 },
    { label: "Taux de participation aux événements", value: "50%", progress: 50 },
    { label: "Taux de réponse aux notifications/messages", value: "60%", progress: 60 },
    { label: "Temps moyen passé par utilisateur (min)", value: "35 min", progress: 58 },
  ];

  const engagementGradientColors = [
      "bg-gradient-to-r from-blue-400 to-blue-600",     
      "bg-gradient-to-r from-green-400 to-green-600",   
      "bg-gradient-to-r from-purple-400 to-purple-600", 
      "bg-gradient-to-r from-yellow-400 to-yellow-600"  
  ];

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  // const gradientButton =
  //   "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";
  // const gradientButton1 = 
  //   "bg_gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-white";

  // const gradients = [
  //   "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white",
  //   // "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 text-white",
  //   "bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 text-white",
  //   // "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-400 text-white",
  //   "bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30",
  // ];

  const gradients = [
    "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 text-white shadow-lg shadow-blue-500/30", 
    "bg-gradient-to-r from-red-500 via-pink-600 to-rose-500 text-white shadow-lg shadow-rose-500/30",    
    "bg-gradient-to-r from-lime-400 via-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30" 
  ];
  const glowEffects = [
    "0 0 15px rgba(59, 130, 246, 0.6)", 
    "0 0 15px rgba(244, 63, 94, 0.6)",  
    "0 0 15px rgba(74, 222, 128, 0.6)"   
  ];

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${pageBg}`}>
      {/* <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}>
          <MdDashboard className="mr-2 sm:mr-3 text-blue-700" /> Tableau de bord
        </h2>

        <div className="flex items-center gap-3 sm:gap-6 relative">
          <Dropdown
            ref={notifRef}
            show={showNotifications}
            setShow={setShowNotifications}
            icon={<FaBell className="text-lg sm:text-xl" />}
            label="Notifications"
            count={notifications.length}
            items={notifications}
            noScroll={true}
          />

          <Dropdown
            ref={msgRef}
            show={showMessages}
            setShow={setShowMessages}
            icon={<FaEnvelope className="text-lg sm:text-xl" />}
            label="Messages"
            count={messages.length}
            items={messages.map((msg) => `${msg.from} : ${msg.text}`)}
            noScroll={true}
          />

          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              aria-label="Menu profil"
            >
              <div className="relative">
                <FaUser className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Admin</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                showProfile ? 'rotate-180' : ''
              }`} />
            </button>
            {showProfile && (
              <div
                className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-48 rounded-lg shadow-lg border ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } z-50 transition-all duration-200 ${
                  window.innerWidth < 640 ? 'left-4 right-4' : 'right-0'
                }`}
              >
                <div className="p-2">
                  <div className={`px-3 py-2 text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <p className="font-medium">Connecté en tant que</p>
                    <p className="truncate">admin@example.com</p>
                  </div>
                  <div className={`border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                    } transition-colors duration-150`}
                  >
                    Mon profil
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                    } transition-colors duration-150`}
                  >
                    Paramètres
                  </button>
                  <div className={`border-t ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}></div>
                  <button
                    className={`w-full text-left px-3 py-2 text-sm ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-red-400' 
                        : 'hover:bg-gray-100 text-red-600'
                    } transition-colors duration-150`}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              darkMode 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            } transition-colors duration-200`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div> */}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex flex-wrap gap-4 sm:gap-5 justify-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`flex-1 min-w-[150px] sm:min-w-[180px] max-w-[230px] pt-5 px-6 rounded-2xl shadow-xl transition duration-300 cursor-pointer ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                  }`}
              >
                <h3 className={`font-semibold ${gradientTitle}`}>{stat.label}</h3>
                <div className="flex justify-between items-center pt-8 pb-3">
                  <span className="text-[20px] sm:text-[22px] font-bold">{stat.value}</span>
                  <span className="text-[24px] sm:text-[26px] text-gray-500 dark:text-gray-400">{stat.icon}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                }`}
            >
              <EventChart darkMode={darkMode} />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
                }`}
            >
              <MoneyChart darkMode={darkMode} />
            </motion.div>
          </div>

          <SectionWrapper title="Statistiques d’engagement" darkMode={darkMode} gradientTitle={gradientTitle}>
              {engagementStats.map(({ label, value, progress }, i) => (
                  <div key={i} className="mb-4">
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
          <SectionWrapper title="Organisateurs récents" darkMode={darkMode} gradientTitle={gradientTitle}>
            <ul>
              {recentOrganizers.map(({ name, email }, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
                >
                  <FaUserCircle className="text-2xl sm:text-3xl text-purple-500" />
                  <div>
                    <p className="font-semibold text-base sm:text-lg">{name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionWrapper>

          <SectionWrapper title="Derniers paiements" darkMode={darkMode} gradientTitle={gradientTitle}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[300px]">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-700">
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(({ user, amount, date }, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
                    >
                      <td className="p-3">{user}</td>
                      <td className="p-3">${amount}</td>
                      <td className="p-3">{date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        className={`relative p-2 rounded-full transition-all duration-200 ${
          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
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
          className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${
            darkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-200' 
              : 'bg-white border-gray-200 text-gray-900'
          } z-50 transition-all duration-200 ${
            isMobile ? 'left-4 right-4' : 'right-0'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            {React.cloneElement(icon, { className: 'w-5 h-5' })}
            <h4 className="font-semibold text-sm sm:text-base">{label}</h4>
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
                  className={`p-3 transition-colors duration-150 border-b ${
                    darkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } cursor-pointer`}
                >
                  <p className="text-sm line-clamp-2">
                    {typeof item === 'object' ? `${item.from}: ${item.text}` : item}
                  </p>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Il y a {Math.floor(Math.random() * 60)} min
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
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

function EventChart({ darkMode }) {
  const data2020 = [10, 15, 20, 12, 17];
  const data2021 = [14, 18, 25, 22, 20];
  const months = ["Jan", "Feb", "Mar", "Apr", "May"];

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Événements par mois
      </h3>
      <BarChart
        series={[
          { data: data2020, label: "2020" },
          { data: data2021, label: "2021" },
        ]}
        xAxis={[
          {
            data: months,
            tickLabelStyle: {
              fill: darkMode ? '#ffffff' : '#000000', 
            },
            
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: darkMode ? '#ffffff' : '#000000', 
            },
            
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

function MoneyChart({ darkMode }) {
  const margin = { right: 24 };
  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    "Page A",
    "Page B",
    "Page C",
    "Page D",
    "Page E",
    "Page F",
    "Page G",
  ];

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-start my-3">Paiements</h3>
      <LineChart
        height={280}
        series={[
          { data: pData, label: "PV" },
          { data: uData, label: "UV" },
        ]}
        xAxis={[
          {
            scaleType: "point",
            data: xLabels,
            tickLabelStyle: {
              fill: darkMode ? '#ffffff' : '#000000', // Couleur des chiffres de l'axe X
            },
            // axisLabelStyle: {
            //   fill: darkMode ? '#ffffff' : '#000000', // Couleur du libellé de l'axe X
            // },
          },
        ]}
        yAxis={[
          {
            width: 50,
            tickLabelStyle: {
              fill: darkMode ? '#ffffff' : '#000000', // Couleur des chiffres de l'axe Y
            },
            // axisLabelStyle: {
            //   fill: darkMode ? '#ffffff' : '#000000', // Couleur du libellé de l'axe Y
            // },
          },
        ]}
        margin={margin}
        width={450}
        className={`p-4 rounded-2xl shadow-xl flex-1 min-w-[280px] sm:min-w-[300px] max-w-full lg:max-w-[550px] ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          }`}
      />
    </div>
  );
}