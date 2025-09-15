import { AlertTriangle, CheckCircle } from "lucide-react";

// Nouveau composant : Modal de confirmation professionnel
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "delete" }) => {
  if (!isOpen) return null;

  const icon = type === "delete" ? AlertTriangle : CheckCircle;
  const bgColor = type === "delete" ? "from-red-50 to-rose-50" : "from-emerald-50 to-green-50";
  const textColor = type === "delete" ? "text-red-800" : "text-emerald-800";
  const borderColor = type === "delete" ? "border-red-200" : "border-emerald-200";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${bgColor} border`}>
              <icon className={`w-6 h-6 ${textColor}`} />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center mb-2">{title}</h2>
          <p className="text-gray-600 text-center mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-white rounded-xl transition-all hover:scale-105 shadow-md bg-gradient-to-r ${type === "delete" ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600"}`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;