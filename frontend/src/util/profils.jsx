import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Camera, LogOut, Mail, Settings, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Profil() {

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const { user, isLoading } = useStateContext();
  const [userName, setUserName] = useState("Utilisateur");
  const [userEmail, setUserEmail] = useState("email@example.com");
  const [userPhoto, setUserPhoto] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "Utilisateur");
      setUserEmail(user.email || "email@example.com");
      setUserPhoto(user.photo);
    }
  }, [user]);
  if (isLoading) return <p>Chargement...</p>;

  const [isOpenProfil, setIsOpenProfil] = useState(false)

  const [confirmLogOut, setConfirmLogOut] = useState(false);
  const handleDelete = () => {
    if (confirmLogOut) {
      // Logic to delete the event goes here
      console.log("Event deleted");
      setConfirmLogOut(false);
    } else {
      setConfirmLogOut(true);
    }
  };


  const handleLogOut = () => {
    sessionStorage.removeItem("ACCES_TOKEN");
    window.location.href = "/pagepublic";
  };

  return (
    <>
      <div className="flex items-center gap-4 cursor-pointer hover:scale-105 duration-300" onClick={() => setIsOpenProfil(true)}>
        <img
          src={userPhoto}
          alt="Profil"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover"
        />
      </div>

      <AnimatePresence>
        {isOpenProfil && (
          <div className="fixed top-0 h-screen left-0 w-screen z-50 flex justify-center sm:justify-end items-start p-4 sm:pr-10 pt-20 sm:pt-28" onClick={() => setIsOpenProfil(false)}>
            <motion.div
              className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm transform transition-all duration-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Gradient Background Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-3xl" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpenProfil(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100/80 flex items-center justify-center transition-all duration-200 cursor-pointer z-10"
              >
                <span className="text-gray-500 text-lg">×</span>
              </button>

              <div className="relative z-10">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-5 sm:mb-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                      <img
                        src={userPhoto}
                        alt="Profil"
                        className="w-full h-full rounded-full object-cover border-2 border-white"
                      />
                    </div>

                    {/* Camera Icon Overlay */}
                    <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-100 group-hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                      <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text break-words">
                    {userName}
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 flex items-center justify-center gap-2 break-all">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{userEmail}</span>
                  </p>

                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                    En ligne
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 sm:space-y-3">
                  <button className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                    Paramètres
                  </button>

                  <button className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    Mon Profil
                  </button>

                  <button
                    className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base"
                    onClick={() => setConfirmLogOut(true)}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    Déconnexion
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20" />
              <div className="absolute bottom-3 right-10 sm:bottom-4 sm:right-12 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20" />
              <div className="absolute top-8 right-6 sm:top-12 sm:right-8 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            {/* Backdrop avec effet de flou */}
            <div className="absolute inset-0 h-screen flex items-center justify-center bg-black/30 backdrop-blur-sm">
              {/* Contenu du modal */}
              <motion.div
                className="relative bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 max-w-xs sm:max-w-md w-full mx-4 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header avec dégradé */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-500 p-4 sm:p-6 text-white relative">
                  <motion.button
                    onClick={() => setConfirmLogOut(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={18} className="sm:w-5 sm:h-5" />
                  </motion.button>

                  <div className="flex flex-col sm:flex-row items-center justify-center mb-2">
                    <div className="p-2.5 sm:p-3 bg-white/20 rounded-full mb-2 sm:mb-0">
                      <LogOut size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-center sm:ml-5">Confirmation</h2>
                  </div>
                </div>

                {/* Corps du modal */}
                <div className="p-6 sm:p-8 text-center">
                  <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                    Êtes-vous sûr de vouloir vous déconnecter de votre session ?
                  </p>

                  {/* Boutons d'action */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <motion.button
                      onClick={handleLogOut}
                      className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-400 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 min-w-[100px] cursor-pointer text-sm sm:text-base order-2 sm:order-1"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Oui
                    </motion.button>

                    <motion.button
                      onClick={() => setConfirmLogOut(false)}
                      className="cursor-pointer px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 min-w-[100px] text-sm sm:text-base order-1 sm:order-2"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Non
                    </motion.button>
                  </div>
                </div>

                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
