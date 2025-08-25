import React, { useState, useEffect, useRef } from "react";
import {
  Outlet,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import {
  FaCogs,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaUser,
  FaPaperPlane,
  // FaUserCircle
} from "react-icons/fa";
import { FaBell, FaEnvelope } from "react-icons/fa6";
import { FiLayout } from "react-icons/fi";
import { ChevronDown, X } from "lucide-react";
import {
  MdCalendarToday,
  MdHistory,
  MdQueryStats,
  MdRoom,
} from "react-icons/md";
import { useDarkMode } from "../context/DarkModeContext";
import { useStateContext } from "../context/ContextProvider";
import Dropdown from "./Dropdown";
import LogoutModal from "../pages/Admin/LogoutModal";
import { logout } from "../services/firebase/authService";
import { format } from "date-fns";
import { getUserIdForToken } from "../services/userService";
import { fr } from "date-fns/locale";
import io from "socket.io-client";
import { useSocket } from "../socket";

export default function AdminLayout() {
  const { isAuthenticated, role, isLoading, setUser, user } = useStateContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) return <div>Chargement ...</div>;

  if (!isAuthenticated) return <Navigate to="/pagepublic" replace />;

  switch (role) {
    case "admin":
      break;
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    case "organisateur":
      return <Navigate to="/pagepublic" replace />;
    default:
      return <Navigate to={location.pathname || "/AdminAccueil"} replace />;
  }

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    console.log("Déconnexion Confirmée");
    setUser(null);
    logout();
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const menuItems = [
    {
      path: "/AdminAccueil",
      name: "Tableau de bord",
      icon: <FiLayout className="text-lg" />,
    },
    {
      path: "/AdminEvenement",
      name: "Événements",
      icon: <MdCalendarToday className="text-lg" />,
    },
    {
      path: "/AdminOrganisateur",
      name: "Organisateurs",
      icon: <FaUsers className="text-lg" />,
    },
    {
      path: "/LocationSalle",
      name: "Salles & Localisation",
      icon: <MdRoom className="text-lg" />,
    },
    {
      path: "/AdminHistorique",
      name: "Historique d'activité",
      icon: <MdHistory className="text-lg" />,
    },
    {
      path: "/AdminStats",
      name: "Statistique",
      icon: <MdQueryStats className="text-lg" />,
    },
    {
      path: "/AdminParametre",
      name: "Paramètres",
      icon: <FaCogs className="text-lg" />,
    },
  ];

  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const bgClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gradient-to-r from-white to-gray-50 text-gray-800";

  const currentPage = menuItems.find((item) => item.path === location.pathname);
  const currentPageName = currentPage ? currentPage.name : "Page Inconnue";
  const currentPageIcon = currentPage ? currentPage.icon : null;

  const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
      if (conversation) {
        setMessages([
          {
            id: 1,
            text:
              typeof conversation.content === "object"
                ? conversation.content.text
                : conversation,
            sender:
              typeof conversation.content === "object"
                ? conversation.content.from
                : "Utilisateur",
            timestamp: new Date(Date.now() - 30 * 60000),
            isAdmin: false,
          },
          {
            id: 2,
            text: "Bonjour ! Comment puis-je vous aider ?",
            sender: "Admin",
            timestamp: new Date(Date.now() - 25 * 60000),
            isAdmin: true,
          },
        ]);
      }
    }, [conversation]);

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (newMessage.trim()) {
        const message = {
          id: messages.length + 1,
          text: newMessage,
          sender: "Admin",
          timestamp: new Date(),
          isAdmin: true,
        };
        setMessages([...messages, message]);
        setNewMessage("");
      }
    };

    const formatTime = (date) => {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-[60] flex items-center justify-center p-4">
        <div
          className={`w-full max-w-2xl h-[80vh] rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          } flex flex-col`}
        >
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <FaUser className="text-sm" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {typeof conversation?.content === "object"
                    ? conversation.content.from
                    : "Utilisateur"}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  En ligne
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isAdmin
                      ? "bg-blue-500 text-white"
                      : darkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isAdmin
                        ? "text-blue-100"
                        : darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className={`p-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============= MODIFIÉ: AdminHeader avec modal =============
  const AdminHeader = ({ currentPageName, darkMode }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhoto, setUserPhoto] = useState("");
    const { user } = useStateContext();
    const socket = useSocket();
    const notifRef = useRef(null);
    const msgRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    const handleRedirect = () => {
      navigate("/AdminParametre");
    };

    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/auth/messages`
          );
          if (!response.ok)
            throw new Error("Erreur lors de la récupération des messages");
          const data = await response.json();

          // Adapter le format au même style que ton tableau statique
          const formatted = data.map((msg) => ({
            ...msg,
            from: `${msg.firstName} ${msg.lastName}`,
            text: msg.message,
            read: msg.read || false, // ou msg.read si tu ajoutes ce champ dans la DB
          }));

          setMessages(formatted);
        } catch (error) {
          console.error("Erreur lors de la récupération des messages :", error);
          setMessages([]);
        }
      };
      const fetchNotifications = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/auth/notifications`
          );
          if (!response.ok)
            throw new Error("Erreur lors de la récupération des notifications");
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des notifications :",
            error
          );
          setNotifications([]);
        }
      };

      async function connectSocket() {
        const userId = await getUserIdForToken();
        if (!userId) return;
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/messages`
        );
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des messages");
        const data = await response.json();
        try {
          if (!socket) return;

          socket.on("notificationMessageAdmin", (value) => {
            console.log("nana ", value);
            const formatted1 = data.map((msg) => ({
              ...msg,
              from: `${msg.firstName} ${msg.lastName}`,
              text: msg.message,
              read: msg.read || false, // ou msg.read si tu ajoutes ce champ dans la DB
            }));
            const formatted2 = value.data.map((msg) => ({
              ...msg,
              from: `${msg.firstName} ${msg.lastName}`,
              text: msg.message,
              read: msg.read || false, // ou msg.read si tu ajoutes ce champ dans la DB
            }));
            setMessages([...formatted1, ...formatted2]);
          });
        } catch (error) {
          console.error("Erreur de connexion au socket :", error);
        }
      }

      fetchNotifications();
      fetchMessages();
      connectSocket();

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }, []);

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

      document.removeEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (user) {
        setUserName(user.name || "Utilisateur");
        setUserEmail(user.email || "email@example.com");
        setUserPhoto(user.photo || "/default-avatar.png");
      }
    }, [user]);

    const markMessageAsRead = (message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? { ...msg, read: true } : msg
        )
      );
    };

    const handleMessageClick = (item) => {
      setSelectedConversation({ content: item });
      markMessageAsRead(item);
      setShowConversationModal(true);
      setShowMessages(false);
    };

    const handleDeleteMessage = async (id) => {
      try {
        // Appel à ton backend pour supprimer en base
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/contact_messages/${id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }

        // Mise à jour locale après confirmation de la suppression
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== id)
        );
      } catch (error) {
        console.error("Suppression impossible :", error);
      }
    };

    const pageBg = darkMode
      ? "bg-gray-900 text-gray-200"
      : "bg-gray-50 text-gray-800";

    return (
      <>
        <header
          className={`flex flex-col md:flex-row justify-between items-center gap-4 pt-8 pl-8 pr-8 ${pageBg}`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}
          >
            {currentPageIcon && (
              <span className="mr-2 sm:mr-3 text-blue-700">
                {currentPageIcon}
              </span>
            )}
            {currentPageName}
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
              count={messages.filter((msg) => !msg.read).length}
              items={messages}
              onDelete={handleDeleteMessage}
              onItemClick={handleMessageClick}
              noScroll={true}
            />
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                aria-label="Menu profil"
              >
                <div className="relative">
                  {(
                    <img
                      src={userPhoto}
                      alt=""
                      className="w-8 rounded-[50%]"
                    />
                  ) || <FaUser className="w-5 h-5" />}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {userName || "Admin"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showProfile ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showProfile && (
                <div
                  className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-48 rounded-lg shadow-lg border ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } z-50 transition-all duration-200 ${
                    window.innerWidth < 640 ? "left-4 right-4" : "right-0"
                  }`}
                >
                  <div className="p-2">
                    <div
                      className={`px-3 py-2 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <p className="font-medium">Connecté en tant que</p>
                      <p className="truncate">{user?.name || "Admin"}</p>
                    </div>
                    <div
                      className={`border-t ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    ></div>
                    <button
                      onClick={handleRedirect}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-200"
                          : "hover:bg-gray-100 text-gray-800"
                      } transition-colors duration-150`}
                    >
                      Mon profil
                    </button>
                    <button
                      onClick={handleRedirect}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-200"
                          : "hover:bg-gray-100 text-gray-800"
                      } transition-colors duration-150`}
                    >
                      Paramètres
                    </button>
                    <div
                      className={`border-t ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    ></div>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        darkMode
                          ? "hover:bg-gray-700 text-red-400"
                          : "hover:bg-gray-100 text-red-600"
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
                  ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              } transition-colors duration-200`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <FaSun className="text-lg" />
              ) : (
                <FaMoon className="text-lg" />
              )}
            </button>
          </div>
        </header>
        <ConversationModal
          show={showConversationModal}
          onClose={() => setShowConversationModal(false)}
          conversation={selectedConversation}
          darkMode={darkMode}
        />
      </>
    );
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <button
        className={`fixed z-30 top-4 left-4 p-2 rounded-lg transition-all duration-300 md:hidden ${
          darkMode
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
            : "bg-white text-gray-600 hover:bg-gray-100"
        } shadow-md hover:scale-105`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>
      <aside
        className={`fixed z-50 top-0 left-0 h-full w-64 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-72 ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="../../public/images/logo_4.png"
                alt="Logo"
                className="w-10 h-10 rounded-lg object-cover transition-transform duration-300 hover:scale-110"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Master Table
              </h1>
            </div>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 hover:rotate-90"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform ${
                      location.pathname === item.path
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]"
                        : `${
                            darkMode
                              ? "text-gray-200 hover:bg-gray-700 hover:text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } hover:translate-x-1 hover:scale-[1.02]`
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <span
                      className={`text-lg transition-transform duration-300 ${
                        location.pathname === item.path
                          ? "text-white scale-110"
                          : darkMode
                            ? "text-gray-300 group-hover:scale-110"
                            : "text-gray-500 group-hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="transition-all duration-300">
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4">
            <div className="flex flex-col space-y-3 mb-4">
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform ${
                  darkMode
                    ? "bg-gray-700 text-blue-300 hover:bg-gray-600 hover:scale-[1.02]"
                    : "bg-gray-100 text-blue-600 hover:bg-gray-200 hover:scale-[1.02]"
                }`}
              >
                {darkMode ? (
                  <>
                    <FaSun className="text-lg transition-transform duration-300 hover:rotate-12" />
                    <span className="text-sm font-medium">Mode Clair</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="text-lg transition-transform duration-300 hover:rotate-12" />
                    <span className="text-sm font-medium">Mode Sombre</span>
                  </>
                )}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform ${
                  darkMode
                    ? "text-red-300 hover:bg-gray-700 hover:bg-opacity-50 hover:scale-[1.02]"
                    : "text-red-500 hover:bg-red-50 hover:scale-[1.02]"
                }`}
              >
                <FaSignOutAlt className="text-lg transition-transform duration-300 hover:translate-x-1" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
            <p
              className={`text-xs text-center transition-colors duration-300 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              © {new Date().getFullYear()} Master Table
            </p>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader currentPageName={currentPageName} darkMode={darkMode} />
        <main
          className={`flex-1 overflow-auto scrollable ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
        >
          <div className={`h-full ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            <Outlet />
          </div>
        </main>
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={cancelLogout}
          onConfirm={confirmLogout}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}
