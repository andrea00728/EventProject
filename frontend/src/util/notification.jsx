{/* <div className="notif mx-5 p-2 rounded-full  hover:scale-110 cursor-pointer duration-300">
                <Bell className=""/>
              </div> */}

              import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Clock, AlertCircle, MessageSquare, UserPlus, Settings, Trash2 } from 'lucide-react';

const NotificationComponent = () => {
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
  {
    id: 1,
    type: 'message',
    title: 'Nouveau message',
    message: 'L\'admin Clara vous a envoyé un message concernant la disposition des tables',
    time: '2 min',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 2,
    type: 'friend',
    title: 'Nouvelle demande d\'ami',
    message: 'L\'organisateur Paul a demandé à rejoindre les administrateurs de l\'événement',
    time: '5 min',
    isRead: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 3,
    type: 'system',
    title: 'Mise à jour système',
    message: 'Un invité a été ajouté à la table 5 par l\'admin Sophie',
    time: '1h',
    isRead: true,
    avatar: null
  },
  {
    id: 4,
    type: 'warning',
    title: 'Attention requise',
    message: 'Une table dépasse la capacité prévue. Veuillez vérifier la table 3.',
    time: '2h',
    isRead: false,
    avatar: null
  },
  {
    id: 5,
    type: 'message',
    title: 'Message de groupe',
    message: 'Un message a été posté par les organisateurs dans "Coordination logistique"',
    time: '1j',
    isRead: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  }
]
    );

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  };

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'friend':
        return <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'system':
        return <Settings className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Bell className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return 'from-blue-500 to-cyan-500';
      case 'friend':
        return 'from-green-500 to-emerald-500';
      case 'system':
        return 'from-gray-500 to-slate-500';
      case 'warning':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Notification Bell Trigger */}
      <div className="relative">
        <div 
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer hover:scale-105 duration-300 transition-all"
          onClick={() => setIsOpenNotifications(true)}
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </div>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpenNotifications && (
          <div className="fixed top-0 h-screen left-0 w-screen z-50 flex justify-center sm:justify-end items-start p-4 sm:pr-10 pt-20 sm:pt-28" onClick={() => setIsOpenNotifications(false)}>
            <motion.div
              className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md transform transition-all duration-300 max-h-[80vh] flex flex-col"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl" />

              {/* Header */}
              <div className="relative z-10 p-6 sm:p-8 pb-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                      <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text">
                      Notifications
                    </h2>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpenNotifications(false)}
                    className="w-8 h-8 rounded-full bg-gray-100/80 flex items-center justify-center transition-all duration-200 hover:bg-gray-200/80"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Action Buttons */}
                {notifications.length > 0 && (
                  <div className="flex gap-2 text-sm">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors duration-200"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Tout lire
                      </button>
                    )}
                    <button
                      onClick={clearAllNotifications}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors duration-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Effacer tout
                    </button>
                  </div>
                )}
              </div>

              {/* Notifications List */}
              <div className="relative z-10 flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg font-medium mb-2">Aucune notification</p>
                    <p className="text-gray-400 text-sm">Vous êtes à jour !</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                          notification.isRead 
                            ? 'bg-white/60 border-gray-200/50 hover:bg-white/80' 
                            : 'bg-white/80 border-blue-200/60 hover:bg-white/90 shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Avatar or Icon */}
                          <div className="flex-shrink-0">
                            {notification.avatar ? (
                              <img
                                src={notification.avatar}
                                alt="Avatar"
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${getNotificationColor(notification.type)} flex items-center justify-center text-white shadow-sm`}>
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className={`text-sm sm:text-base font-semibold truncate ${
                                notification.isRead ? 'text-gray-700' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {notification.time}
                                </span>
                              </div>
                            </div>
                            <p className={`text-xs sm:text-sm line-clamp-2 ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-red-100 rounded-full"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20" />
              <div className="absolute bottom-4 right-12 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20" />
              <div className="absolute top-12 right-8 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationComponent;