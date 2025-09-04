import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
} from "react-icons/fa";
import { FaBell, FaEnvelope } from "react-icons/fa6";
import { FiLayout } from "react-icons/fi";
import { ChevronDown, X } from "lucide-react";
import {
  MdAdminPanelSettings,
  MdCalendarToday,
  MdHistory,
  MdQueryStats,
  MdRoom,
} from "react-icons/md";
import { useDarkMode } from "../context/DarkModeContext";
import { useStateContext } from "../context/ContextProvider";
import Dropdown from "./Dropdown";
import Modalist from "./modal";
import LogoutModal from "../pages/Admin/LogoutModal";
import { logout } from "../services/firebase/authService";
import { format } from "date-fns";
import {
  getIfAdminHasPassword,
  getUserIdForToken,
} from "../services/userService";
import { fr } from "date-fns/locale";
import { useSocket } from "../socket";
import { motion, AnimatePresence } from "framer-motion";
import { url } from "../api/url";
import { io } from "socket.io-client";
import { PasswordSetupModal } from "../pages/Admin/PasswordSetupModal";
import md5 from "blueimp-md5"; // npm i blueimp-md5 si pas déjà fait
import ConversationModal from "./ConversationModal";


export default function AdminLayout() {
  const { isAuthenticated, role, isLoading, setUser, user, handleLogout } =
    useStateContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // 'notifications', 'messages', null

  const [messages, setMessages] = useState([]);
  const [showModalModifyPassword, setShowModalModifyPassword] = useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const res = await getIfAdminHasPassword(user.sub);
        const hidden = localStorage.getItem("hidePasswordModal");
        if (res.hasPassword == false && hidden == "false") {
          setTimeout(() => {
            setShowModalModifyPassword(true);
          }, 2000);
        } else {
          setShowModalModifyPassword(false);
        }
      }
      // console.log("Connaître si l'admin a un mot de passe : ", res);
    };
    fetchData();
  }, []);

  // console.log("Auth State:", { isLoading, isAuthenticated, role, user });

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
    case "super_admin":
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

  const handleShowLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    handleLogout();
    setShowLogoutModal(false);
    navigate("/login-site/super/admin");
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
  // {
  //   path: "/AdminHistorique",
  //   name: "Historique d'activité",
  //   icon: <MdHistory className="text-lg" />,
  // },
  {
    path: "/AdminStats",
    name: "Statistique",
    icon: <MdQueryStats className="text-lg" />,
  },
  // On ajoute la condition proprement
  ...(user.role !== "admin"
    ? [
        {
          path: "/AdminManagement",
          name: "Gestion Admin",
          icon: <MdAdminPanelSettings className="text-lg" />,
        },
      ]
    : []),
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

  const gravatarUrl = (email) => {
    if (!email) return "/default-avatar.png";
    return `https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon&s=200`;
  };

  const getUserDisplayName = (user) => {
    if (user?.name && user.name.trim()) return user.name.trim();
    if (user?.email && typeof user.email === "string") {
      const local = user.email.split("@")[0];
      return local || "Utilisateur";
    }
    return "Utilisateur";
  };

  const getGravatarUrl = (email, { size = 80, d = "identicon" } = {}) => {
    if (!email || typeof email !== "string") {
      // fallback universel
      return `https://www.gravatar.com/avatar/?d=${encodeURIComponent(d)}&s=${size}`;
    }
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=${encodeURIComponent(d)}&s=${size}`;
  };

  

  const NotificationModal = ({ show, onClose, notification, darkMode }) => {
    // Si on n'a pas de notification ou si le modal est fermé, ne rien afficher
    if (!show || !notification) return null;

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-gray-900 bg-opacity-30 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`w-full max-w-md rounded-lg shadow-xl ${
              darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
            } flex flex-col`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.25 } }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Header avec image */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {notification.organizerImage && (
                  <img
                    src={notification.organizerImage}
                    alt="Organisateur"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <h3 className="font-semibold">
                  {notification.title || "Notification"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-2">
              <p className="text-sm">{notification.message}</p>
              {notification.time && (
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {notification.time}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ============= MODIFIÉ: AdminHeader avec modal =============
  const AdminHeader = ({ currentPageName, darkMode }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showConversationModal, setShowConversationModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showMessagesModal, setShowMessagesModal] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPhoto, setUserPhoto] = useState("");
    const { user } = useStateContext();
    const notifRef = useRef(null);
    const msgRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const [notifFilter, setNotifFilter] = useState("all");
    const [msgFilter, setMsgFilter] = useState("all");
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);

    const filteredNotifications = notifications.filter((n) => {
      if (notifFilter === "all") return true;
      if (notifFilter === "unread") return !n.read;
      return n.read;
    });

    const filteredMessages = messages.filter((m) => {
      if (msgFilter === "all") return true;
      if (msgFilter === "unread") return !m.read;
      return m.read;
    });

    const handleRedirect = () => {
      navigate("/AdminParametre");
    };

    const READ_MESSAGES_KEY = "readMessages";
    const READ_NOTIFS_KEY = "readNotifications";

    const getReadSet = (key) =>
      new Set((JSON.parse(localStorage.getItem(key)) || []).map(String));

    const upsertReadId = (id, key) => {
      const set = getReadSet(key);
      const sid = String(id);
      if (!set.has(sid)) {
        set.add(sid);
        localStorage.setItem(key, JSON.stringify([...set]));
      }
    };

    const applyLocalRead = (items, key) => {
      const readSet = getReadSet(key);
      return items.map((it) =>
        readSet.has(String(it.id)) ? { ...it, read: true } : it
      );
    };

    const dedupeById = (items) => {
      const map = new Map();
      for (const it of items) {
        map.set(String(it.id), { ...map.get(String(it.id)), ...it });
      }
      return [...map.values()];
    };

    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/auth/messages`
          );
          if (!response.ok) throw new Error("Erreur lors de la récupération des messages");
          const data = await response.json();

          const formatted = data.map((msg) => ({
            ...msg,
            from: `${msg.firstName} ${msg.lastName}`,
            text: msg.message,
            read: !!msg.read,            // valeur serveur si dispo
          }));

          // ✅ merge + dédupe + applique localStorage
          setMessages((prev) =>
            applyLocalRead(dedupeById([...prev, ...formatted]), READ_MESSAGES_KEY)
          );
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

        // 🔹 Récupérer IDs lus depuis localStorage
        const readIds =
          JSON.parse(localStorage.getItem("readNotifications")) || [];

        // 🔹 Harmonisation : backend => `isRead`, frontend => `read`
        const formatted = data.map((notif) => ({
          ...notif,
          read: readIds.includes(notif.id) ? true : notif.isRead || false,
        }));

        setNotifications(formatted);
      } catch (error) {
        console.error("Erreur fetchNotifications:", error);
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
        const socket = io(`${url}`, {
          path: "/socket.io/",
          transports: ["websocket", "polling"],
          auth: { userId },
        });

        try {
          if (!socket) return;

          socket.on("notifRegister", (notif) => {
            console.log(
              "NotifRegister reçu:",
              notif,
              "Listener ID:",
              Date.now()
            );
            setNotifications((prevNotifications) => {
              // Vérifier si la notification existe déjà pour éviter les doublons
              console.log("notif vaovao", notif);
              const exists = prevNotifications.some(
                (n) => n.id === (notif.id || Date.now().toString())
              );
              if (exists) {
                console.log("Notification déjà existante, ignorée:", notif);
                return prevNotifications;
              }
              return [
                {
                  ...notif,
                  id: notif.id || Date.now().toString(),
                  read: false,
                },
                ...prevNotifications,
              ];
            });
          });


          //notification pour un nouveau evenement
          socket.on("notifNewEventForAdmin", (notif) => {
            console.log(
              "NotifNewEvent reçu:",
              notif,
              "Listener ID:",
              Date.now()
            );
            setNotifications((prevNotifications) => {
              // Vérifier si la notification existe déjà pour éviter les doublons
              console.log("notif vaovao", notif);
              const exists = prevNotifications.some(
                (n) => n.id === (notif.id || Date.now().toString())
              );
              if (exists) {
                console.log("Notification déjà existante, ignorée:", notif);
                return prevNotifications;
              }
              return [
                {
                  ...notif,
                  id: notif.id || Date.now().toString(),
                  read: false,
                },
                ...prevNotifications,
              ];
            });
          });

          //notification pour une suppression evenement
          socket.on("notifDeleteEventForAdmin", (notif) => {
            console.log(
              "NotifDeleteEvent reçu:",
              notif,
              "Listener ID:",
              Date.now()
            );
            setNotifications((prevNotifications) => {
              // Vérifier si la notification existe déjà pour éviter les doublons
              console.log("notif vaovao", notif);
              const exists = prevNotifications.some(
                (n) => n.id === (notif.id || Date.now().toString())
              );
              if (exists) {
                console.log("Notification déjà existante, ignorée:", notif);
                return prevNotifications;
              }
              return [
                {
                  ...notif,
                  id: notif.id || Date.now().toString(),
                  read: false,
                },
                ...prevNotifications,
              ];
            });
          });

          socket.on("notificationMessageAdmin", (value) => {
            const formatted1 = data.map((msg) => ({
              ...msg,
              from: `${msg.firstName} ${msg.lastName}`,
              text: msg.message,
              read: msg.isRead || false, // ou msg.read si tu ajoutes ce champ dans la DB
            }));
            const formatted2 = value.data.map((msg) => ({
              ...msg,
              from: `${msg.firstName} ${msg.lastName}`, 
              text: msg.message,
              read: msg.isRead || false, // ou msg.read si tu ajoutes ce champ dans la DB
            }));
            setMessages([...formatted2, ...formatted1]);
          });
        } catch (error) {
          console.error("Erreur de connexion au socket :", error);
        }
      }

      fetchNotifications();
      fetchMessages();
      connectSocket();

      // return () => {
      //   if (socket) {
      //     console.log("Nettoyage des listeners socket");
      //     socket.off("connect");
      //     socket.off("connect_error");
      //     socket.off("disconnect");
      //     socket.off("notifRegister");
      //     socket.off("notificationMessageAdmin");
      //   }
      // };
    }, []);

    // Handle click outside for dropdowns
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
          setShowNotifications(false);
          setOpenDropdown((prev) => (prev === "notifications" ? null : prev));
        }
        if (msgRef.current && !msgRef.current.contains(event.target)) {
          setShowMessages(false);
          setOpenDropdown((prev) => (prev === "messages" ? null : prev));
        }
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setShowProfile(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
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

    const markAsRead = async (id, type) => {
      try {
        if (type === "message") {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, read: true } : m))
          );
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/contact_messages/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({ read: true }),
            }
          );
        } else if (type === "notification") {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
          await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/notification/${id}`,
            {
              method: "PATCH",
              body: JSON.stringify({ read: true }),
            }
          );
        }
      } catch (error) {
        console.error("markAsRead error:", error);
      }
    };

    const handleMessageClick = async (item) => {
      await markAsRead(item.id, "message");
      setOpenDropdown(null);
      setSelectedConversation({ content: item });
      setShowConversationModal(true);
    };

    const handleNotificationClick = async (item) => {
      await markAsRead(item.id, "notification");

      // 🔹 Mets à jour localStorage
      const readIds =
        JSON.parse(localStorage.getItem("readNotifications")) || [];
      if (!readIds.includes(item.id)) {
        readIds.push(item.id);
        localStorage.setItem("readNotifications", JSON.stringify(readIds));
      }

      setOpenDropdown(null);
      setSelectedConversation({ content: item });

      // 🔹 Mets à jour ton state pour affichage instantané
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setShowNotificationModal(true); // on ouvre le modal
    };

    const handleDeleteMessage = async (id) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/contact_messages/${id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Erreur lors de la suppression");
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== id)
        );
      } catch (error) {
        console.error("Suppression message impossible:", error);
      }
    };

    const handleDeleteNotification = async (notificationId) => {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_BASE_URL}/notification/${notificationId}`
        );
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (error) {
        console.error("Erreur lors de la suppression notification:", error);
      }
    };

    useEffect(() => {
      const readNotifIds =
        JSON.parse(localStorage.getItem("readNotifications")) || [];
      const readMsgIds = JSON.parse(localStorage.getItem("readMessages")) || [];

      setNotifications((prev) =>
        prev.map((n) =>
          readNotifIds.includes(n.id) ? { ...n, read: true } : n
        )
      );

      setMessages((prev) =>
        prev.map((m) => (readMsgIds.includes(m.id) ? { ...m, read: true } : m))
      );
    }, []); // ✅ tableau vide → ne s’exécute qu’une seule fois au montage

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
              show={openDropdown === "notifications"}
              setShow={() =>
                setOpenDropdown(
                  openDropdown === "notifications" ? null : "notifications"
                )
              }
              icon={<FaBell className="text-lg sm:text-xl" />}
              label="Notifications"
              count={filteredNotifications.filter((n) => !n.read).length}
              items={filteredNotifications}
              onItemClick={handleNotificationClick}
              onDelete={handleDeleteNotification}
              onViewMore={() => console.log("Voir plus de notifications")}
            >
              {/* Filtres */}
              <div className="flex gap-2 p-2">
                <button
                  onClick={() => setNotifFilter("all")}
                  className={`px-3 py-1 rounded-full ${
                    notifFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Tout ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter("unread")}
                  className={`px-3 py-1 rounded-full ${
                    notifFilter === "unread"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Non lus ({notifications.filter((n) => !n.read).length})
                </button>
                <button
                  onClick={() => setNotifFilter("read")}
                  className={`px-3 py-1 rounded-full ${
                    notifFilter === "read"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Lus ({notifications.filter((n) => n.read).length})
                </button>
              </div>
            </Dropdown>

            <Dropdown
              ref={msgRef}
              show={openDropdown === "messages"}
              setShow={() =>
                setOpenDropdown(openDropdown === "messages" ? null : "messages")
              }
              icon={<FaEnvelope className="text-lg sm:text-xl" />}
              label="Messages"
              count={filteredMessages.filter((m) => !m.read).length}
              items={filteredMessages}
              onItemClick={async (item) => {
                // Marquer comme lu
                if (!item.read) {
                  const readIds =
                    JSON.parse(localStorage.getItem("readMessages")) || [];
                  if (!readIds.includes(item.id)) {
                    readIds.push(item.id);
                    localStorage.setItem(
                      "readMessages",
                      JSON.stringify(readIds)
                    );
                  }

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === item.id ? { ...m, read: true } : m
                    )
                  );

                  // Appel API pour marquer comme lu côté backend
                  try {
                    await fetch(
                      `${import.meta.env.VITE_API_BASE_URL}/contact_messages/${item.id}`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isRead: true }),
                      }
                    );
                  } catch (error) {
                    console.error("Erreur mark as read:", error);
                  }
                }

                setSelectedConversation({ content: item });
                setOpenDropdown(null);
                setShowConversationModal(true);
              }}
              onDelete={async (id) => {
                try {
                  await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/contact_messages/${id}`,
                    {
                      method: "DELETE",
                    }
                  );
                  setMessages((prev) => prev.filter((m) => m.id !== id));

                  // Supprimer aussi du localStorage si présent
                  const readIds =
                    JSON.parse(localStorage.getItem("readMessages")) || [];
                  const newReadIds = readIds.filter((rid) => rid !== id);
                  localStorage.setItem(
                    "readMessages",
                    JSON.stringify(newReadIds)
                  );
                } catch (error) {
                  console.error("Erreur suppression message:", error);
                }
              }}
              onViewMore={() => setShowMessagesModal(true)}
            >
              <div className="flex gap-2 p-2">
                <button
                  onClick={() => setMsgFilter("all")}
                  className={`px-3 py-1 rounded-full ${
                    msgFilter === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Tout ({messages.length})
                </button>
                <button
                  onClick={() => setMsgFilter("unread")}
                  className={`px-3 py-1 rounded-full ${
                    msgFilter === "unread"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Non lus ({messages.filter((m) => !m.read).length})
                </button>
                <button
                  onClick={() => setMsgFilter("read")}
                  className={`px-3 py-1 rounded-full ${
                    msgFilter === "read"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Lus ({messages.filter((m) => m.read).length})
                </button>
              </div>
            </Dropdown>

            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`flex items-center gap-2 p-2 rounded-full transition-all duration-200 ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                aria-label="Menu profil"
              >
                {/* Avatar = photo basée sur l'email (Gravatar) */}
                <div className="relative">
                  <img
                    //src={getGravatarUrl(user?.email, { size: 96 })}
                    src={`${user.photo}`}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      // Sécurité: fallback si jamais l’URL échoue
                      e.currentTarget.src = getGravatarUrl(null, { size: 96 });
                    }}
                  />
                </div>

                {/* Nom dynamique – plus jamais "Admin" */}
                <span className="hidden sm:inline text-sm font-medium">
                  {getUserDisplayName(user)}
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
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  } z-50 transition-all duration-200 ${
                    window.innerWidth < 640 ? "left-4 right-4" : "right-0"
                  }`}
                >
                  <div className="p-2">
                    <div
                      className={`flex items-center gap-3 px-3 py-2 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <img
                        // src={getGravatarUrl(user?.email, { size: 80 })}
                        src={`${user.photo}`}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getGravatarUrl(null, {
                            size: 80,
                          });
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-medium">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="truncate text-xs">
                          {user?.email || "aucun email"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                    />

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

                    <div className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`} />

                    <button
                      onClick={handleShowLogout}
                      className={`w-full text-left px-3 py-2 text-sm ${
                        darkMode ? "hover:bg-gray-700 text-red-400" : "hover:bg-gray-100 text-red-600"
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
        <NotificationModal
          show={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          notification={selectedNotification}
          darkMode={darkMode}
        />
        <Modalist
          show={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
          title="Toutes les notifications"
          items={notifications}
          onItemClick={handleNotificationClick}
          onDelete={handleDeleteNotification}
        />
        <Modalist
          show={showMessagesModal}
          onClose={() => setShowMessagesModal(false)}
          title="Tous les messages"
          items={messages}
          onItemClick={handleMessageClick}
          onDelete={handleDeleteMessage}
        />
      </>
    );
  };

  return (
    <div
      className={`flex h-screen flex-row ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <button
        className={`fixed z-30 top-4 left-4 p-2 rounded-lg transition-all duration-300 lg:hidden ${
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
        } lg:translate-x-0 lg:relative lg:w-72 ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="../../src/assets/LogoAmsterTable.png"
                alt="Logo"
                className="w-15 h-auto object-cover transition-transform duration-300 hover:scale-110"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Master Table
              </h1>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 hover:rotate-90"
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
                onClick={handleShowLogout}
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
          className={`flex-1 overflow-auto scrollable transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          } ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
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
        <PasswordSetupModal
          show={showModalModifyPassword}
          onClose={() => setShowModalModifyPassword(false)}
        />
      </div>
    </div>
  );
}