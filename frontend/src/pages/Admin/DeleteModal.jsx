import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";

export default function DeleteModal({ isOpen, onClose, onConfirm, managerName }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <MdClose size={22} />
            </button>

            <div className="flex flex-col items-center text-center">
              <TbAlertTriangle className="text-red-500 text-5xl mb-3" />
              <h2 className="text-xl font-semibold mb-2">Supprimer l'organisateur ?</h2>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer <span className="font-bold">{managerName}</span> ?
                Cette action est irréversible.
              </p>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={onConfirm}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
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
