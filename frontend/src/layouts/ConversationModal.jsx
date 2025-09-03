import { X, Minus, Maximize } from "lucide-react";
import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";


const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    // Vérifie que le message n'est pas vide
    if (!emailData.message) {
      toast.warning("⚠️ Veuillez écrire un message avant d'envoyer.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: conversation?.content?.email,
          subject: emailData.subject || "Réponse à votre message",
          message: emailData.message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`✅ Email envoyé avec succès à ${conversation.content.email}`);
        setEmailData({ subject: "", message: "" });
        onClose();
      } else if (res.status === 400) {
        toast.error("❌ Erreur : Email destinataire invalide");
      } else if (res.status === 403) {
        toast.error(
          "❌ Envoi interdit par SendGrid (403). Vérifie la clé API et l'adresse expéditeur."
        );
      } else {
        toast.error(`❌ Erreur inattendue : ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error("Erreur envoi email:", err);
      toast.error("❌ Impossible d’envoyer l’email (erreur réseau ou serveur).");
    }
  };


  if (!show) return null;

  return (
    <div className="fixed bottom-0 right-4 z-[101] flex items-end justify-end p-4">
      <div
        className={`w-full max-w-[640px] rounded-t-lg shadow-[0_1px_8px_rgba(0,0,0,0.2)] ${
          darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
        } flex flex-col font-sans text-sm`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
          }`}
        >
          <h2 className="font-normal text-sm text-gray-700 dark:text-gray-300">New Message</h2>
          <div className="flex items-center gap-1">
            <button
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <Maximize className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              }`}
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Previous Message Info */}
        {conversation?.content && (
          <div
            className={`px-4 py-2 border-b ${
              darkMode ? "border-gray-700 bg-gray-700 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-600"
            } text-xs`}
          >
            <p className="font-medium">Previous Message:</p>
            <p className="italic truncate">{conversation.content.text}</p>
            <div className="mt-1">
              <p>
                <span className="font-medium">From:</span>{" "}
                {conversation.content.firstName} {conversation.content.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {conversation.content.email}
              </p>
            </div>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSendEmail} className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col px-4 py-2 space-y-2">
            <div>
              <input
                disabled
                type="email"
                value={conversation?.content?.email || ""}
                className={`w-full px-2 py-1 border-b ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none text-sm`}
                placeholder="To"
              />
            </div>

            <div>
              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleChange}
                className={`w-full px-2 py-1 border-b ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none text-sm`}
                placeholder="Subject"
              />
            </div>

            <div className="flex-1">
              <textarea
                name="message"
                rows="12"
                value={emailData.message}
                onChange={handleChange}
                className={`w-full h-full px-2 py-2 border-none resize-none ${
                  darkMode
                    ? "bg-gray-800 text-gray-200 placeholder-gray-400"
                    : "bg-white text-gray-900 placeholder-gray-500"
                } focus:outline-none text-sm font-sans leading-relaxed`}
                placeholder="Compose email"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              <FaPaperPlane className="w-3.5 h-3.5" />
              Send
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`text-xs ${
                  darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Formatting options
              </button>
              <button
                type="button"
                className={`text-xs ${
                  darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Attach files
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationModal;