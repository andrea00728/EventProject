import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaSignOutAlt, FaTimes } from "react-icons/fa";

const LogoutModal = ({ isOpen, onClose, onConfirm, darkMode }) => {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isOpen]);

  const bgOverlay = darkMode
    ? "bg-opacity-70 backdrop-blur-sm"
    : "bg-opacity-50 backdrop-blur-sm";


  const modalBg = darkMode
    ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200"
    : "bg-white text-gray-800";

  const btnCancel = darkMode
    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  const btnConfirm = "bg-red-500 text-white hover:bg-red-600";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 flex items-center justify-center z-50 ${bgOverlay}`}
          // className={`fixed inset-0 flex items-center justify-center z-50 ${bgOverlay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 ${modalBg} transition-transform`}
            initial={{ scale: 0.8, y: -50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <FaExclamationTriangle className="text-yellow-400 text-5xl mb-4" />
              <h2 className="text-2xl font-bold mb-2">Déconnexion ?</h2>
              <p className="text-sm sm:text-base opacity-80">
                Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button
                ref={cancelButtonRef}
                onClick={onClose}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${btnCancel}`}
              >
                <FaTimes />
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${btnConfirm}`}
              >
                <FaSignOutAlt />
                Déconnexion
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;
