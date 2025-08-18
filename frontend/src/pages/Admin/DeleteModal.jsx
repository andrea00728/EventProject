import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";
import { useDarkMode } from "../../context/DarkModeContext"; // Assurez-vous que le chemin est correct

export default function DeleteModal({ isOpen, onClose, onConfirm, managerName }) {
  const { darkMode } = useDarkMode();

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    hidden: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/70"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className={`rounded-2xl shadow-2xl p-8 w-[90%] max-w-md relative border transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-white text-gray-900 border-gray-200"
            }`}
            variants={modalVariants}
          >
            <button
              onClick={onClose}
              className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors ${
                darkMode ? "dark:text-gray-400 dark:hover:text-gray-200" : ""
              }`}
            >
              <MdClose size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className={`mb-4 p-3 rounded-full transition-colors duration-300 ${
                  darkMode ? "bg-red-900" : "bg-red-100"
                }`}
              >
                <TbAlertTriangle className="text-red-500 text-5xl" />
              </div>
              <h2
                className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Supprimer l'organisateur ?
              </h2>
              <p
                className={`transition-colors duration-300 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } mb-6`}
              >
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className={`font-extrabold transition-colors duration-300 ${
                    darkMode ? "text-gray-200" : "text-gray-800"
                }`}>
                  {managerName}
                </span>{" "}
                ? Cette action est <strong className="text-red-500">irréversible</strong>.
              </p>

              <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-4">
                <button
                  onClick={onClose}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300`}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}