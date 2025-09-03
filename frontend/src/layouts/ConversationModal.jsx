import { X } from "lucide-react";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!emailData.to || !emailData.message) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    console.log("Email envoyé :", emailData);

    // 🔹 Ici tu peux connecter ton backend (NestJS, Laravel, Nodemailer, etc.)
    setEmailData({ to: "", subject: "", message: "" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-[101] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-lg shadow-xl ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } flex flex-col`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h3 className="font-semibold text-lg">Nouveau message</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ancien message + infos expéditeur */}
        {conversation?.content && (
          <div
            className={`px-4 py-3 border-b space-y-2 ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-gray-300"
                : "border-gray-100 bg-gray-50 text-gray-700"
            } text-sm`}
          >
            <p className="font-medium">Message précédent :</p>
            <p className="italic">{conversation.content.text}</p>
            <div className="mt-2">
              <p>
                <span className="font-medium">Nom :</span>{" "}
                {conversation.content.firstName} {conversation.content.lastName}
              </p>
              <p>
                <span className="font-medium">Email :</span>{" "}
                {conversation.content.email}
              </p>
            </div>
          </div>
        )}

        {/* Formulaire Email */}
        <form onSubmit={handleSendEmail} className="flex-1 flex flex-col">
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">À :</label>
              <input
                disabled
                type="email"
                name="to"
                value={conversation?.content?.email || ""}
                onChange={handleChange}
                placeholder="exemple@entreprise.com"
                className={`w-full px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message :</label>
              <textarea
                name="message"
                rows="8"
                value={emailData.message}
                onChange={handleChange}
                placeholder="Rédigez votre message ici..."
                className={`w-full px-3 py-2 rounded-lg border resize-none ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className={`p-4 border-t flex justify-end ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPaperPlane className="w-4 h-4" />
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationModal;
