import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Camera, LogOut, Mail, Settings, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profil() {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const { user, isLoading } = useStateContext();
  const [isOpenProfil, setIsOpenProfil] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openEditProfil, setOpenEditProfil] = useState(false);
  const [confirmLogOut, setConfirmLogOut] = useState(false);

  // States pour édition
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Initialiser les champs d'édition dès que l'user est disponible
  useEffect(() => {
    if (user) {
      setEditName(user.name || "Utilisateur");
      setEditEmail(user.email || "email@example.com");
    }
  }, [user]);

  if (isLoading) return <p>Chargement...</p>;

  const handleLogOut = () => {
    sessionStorage.removeItem("ACCES_TOKEN");
    window.location.href = "/pagepublic";
  };

  return (
    <>
      {/* Avatar clicable */}
      <div
        className="flex items-center gap-4 cursor-pointer hover:scale-105 duration-300"
        onClick={() => setIsOpenProfil(true)}
      >
        <img
          src={user?.photo || ""}
          alt="Profil"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
        />
      </div>

      {/* Profil Modal */}
      <AnimatePresence>
        {isOpenProfil && (
          <div
            className="fixed top-0 left-0 w-screen h-screen z-50 flex justify-center sm:justify-end items-start p-4 sm:pr-10 pt-20 sm:pt-28"
            onClick={() => setIsOpenProfil(false)}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpenProfil(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100/80 flex items-center justify-center transition-all duration-200 cursor-pointer z-10"
              >
                <X className="text-gray-500" size={18} />
              </button>

              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-5 sm:mb-6 relative">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                    <img
                      src={user?.photo || ""}
                      alt="Profil"
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  {/* Camera Icon */}
                  <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 group-hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 break-words">{user?.name || "Utilisateur"}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center justify-center gap-2 break-all">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">{user?.email || "email@example.com"}</span>
                </p>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                  En ligne
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 sm:space-y-3">
                <button
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  onClick={() => setOpenSettings(true)}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  Paramètres
                </button>

                <button
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-white text-gray-700 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all"
                  onClick={() => setOpenEditProfil(true)}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Éditer mon profil
                </button>

                <button
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  onClick={() => setConfirmLogOut(true)}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation LogOut Modal */}
      <AnimatePresence>
        {confirmLogOut && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setConfirmLogOut(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-xs sm:max-w-md w-full mx-4 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-4 sm:p-6 text-white relative">
                  <motion.button
                    onClick={() => setConfirmLogOut(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                  <h2 className="text-lg sm:text-xl font-bold text-center">Confirmation</h2>
                </div>
                <div className="p-6 sm:p-8 text-center">
                  <p className="text-gray-700 mb-6 sm:mb-8">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <motion.button
                      onClick={handleLogOut}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl min-w-[100px]"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Oui
                    </motion.button>
                    <motion.button
                      onClick={() => setConfirmLogOut(false)}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold min-w-[100px]"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Non
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {openSettings && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setOpenSettings(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-xs sm:max-w-md w-full mx-4 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-4 sm:p-6 text-white relative">
                  <motion.button
                    onClick={() => setOpenSettings(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                  <h2 className="text-lg sm:text-xl font-bold text-center">Paramètres</h2>
                </div>
                <div className="p-6 sm:p-8">
                  {/* Content similaire à ton ancien code */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Notifications</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Activées</option>
                      <option>Désactivées</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-700">Thème</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Clair</option>
                      <option>Sombre</option>
                    </select>

                    <label className="block text-sm font-medium text-gray-700">Langue</label>
                    <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Français</option>
                      <option>Anglais</option>
                      <option>Espagnol</option>
                    </select>

                    <button
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
                      onClick={() => setOpenSettings(false)}
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {openEditProfil && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={() => setOpenEditProfil(false)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <motion.div
                className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-xs sm:max-w-md w-full mx-4 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-4 sm:p-6 text-white relative">
                  <motion.button
                    onClick={() => setOpenEditProfil(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full"
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>
                  <h2 className="text-lg sm:text-xl font-bold text-center">Éditer mon profil</h2>
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
                    onClick={() => setOpenEditProfil(false)}
                  >
                    Enregistrer
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
