import { X, Minus, Maximize, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";

const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
  const [emailData, setEmailData] = useState({ subject: "", message: "" });
  const [showDetails, setShowDetails] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const email = conversation?.content?.email;
    if (!email) return;

    console.log("Fetch messages pour email:", email);

    fetch(`http://localhost:3000/contact_messages/email/${email}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erreur inconnue du serveur");
        }
        return res.json();
      })
      .then((data) => setMessages(data))
      .catch((err) => {
        console.error("Erreur chargement messages:", err);
        toast.error("Impossible de charger les messages !");
        setMessages([]); // sécurité
      });
  }, [conversation?.content?.email]);

  const handleChange = (e) =>
    setEmailData({ ...emailData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) setAttachedFile(e.target.files[0]);
  };

  const removeFile = () => setAttachedFile(null);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailData.message) {
      toast.warning("⚠️ Veuillez écrire un message avant d'envoyer.");
      return;
    }

    const body = {
      originalMessageId: conversation?.content?.id,
      responseContent: emailData.message,
    };

    try {
      const res = await fetch("http://localhost:3000/contact_messages/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      await res.json();
      toast.success(`✅ Email envoyé et sauvegardé pour ${conversation.content.email}`);
      setEmailData({ subject: "", message: "" });
      onClose();
    } catch (err) {
      console.error("Erreur envoi email:", err);
      toast.error("❌ Impossible d’envoyer l’email ou sauvegarder dans la DB.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 right-4 z-[101] flex items-end justify-end p-4 w-full">
      <div
        className={`rounded-t-xl shadow-[0_6px_16px_rgba(0,0,0,0.3)] transition-all duration-300
        ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"}
        ${maximized ? "w-[40vw] h-[40vh]" : "w-full max-w-[1000px]"}
        ${minimized ? "h-[100px] overflow-hidden" : "h-auto"} 
        flex flex-col font-sans text-base`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2 border-b ${
            darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-100"
          }`}
        >
          <h2 className={`font-normal text-sm ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
            Nouveau message
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setMinimized(!minimized)} className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
              <Minus className={darkMode ? "w-4 h-4 text-gray-200" : "w-4 h-4 text-gray-600"} />
            </button>
            <button onClick={() => setMaximized(!maximized)} className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
              <Maximize className={darkMode ? "w-4 h-4 text-gray-200" : "w-4 h-4 text-gray-600"} />
            </button>
            <button onClick={onClose} className={`p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}>
              <X className={darkMode ? "w-4 h-4 text-gray-200" : "w-4 h-4 text-gray-600"} />
            </button>
          </div>
        </div>

        {/* Previous Messages */}
        {!minimized && conversation?.content && (
          <div
            className={`px-4 py-2 border-b ${
              darkMode
                ? "border-gray-700 bg-gray-700 text-gray-300"
                : "border-gray-200 bg-gray-50 text-gray-600"
            } text-xs`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              <p className="font-medium">Previous Messages</p>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>

            {showDetails && (
            <div className="mt-2 flex flex-col space-y-2">
              {/* Messages échangés */}
              {messages.length > 0 ? (
                messages.map((msg) => {
                const isSentByUser = msg.isSent; // true = support
                const supportInitial = "M"; // Exemple: MasterTable → "M"
                const userInitial = conversation?.content?.firstName?.[0]?.toUpperCase() || "U";
                const senderEmail = isSentByUser ? "mastertable37@gmail.com" : conversation.content.email;


                return (
                  <div key={msg.id} className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end space-x-2 max-w-[70%] ${isSentByUser ? "flex-row-reverse" : ""}`}>
                      <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                        {isSentByUser ? supportInitial : userInitial}
                      </div>
                      <div
                        className={`p-3 rounded-xl shadow-sm break-words
                          ${isSentByUser
                            ? "bg-blue-600 text-white"
                            : darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-gray-200 text-gray-900"}`}
                      >
                        <p className="italic text-sm">{senderEmail}</p>  {/* ← ici */}
                        <p className="italic text-sm">{msg.message}</p>
                        <p className="text-xs text-gray-400 mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
              ) : (
                <p className="text-center text-gray-500 italic mt-2">
                  Aucun message échangé pour cet email.
                </p>
              )}
            </div>
          )}


          </div>
        )}

        {/* Email Form */}
        {!minimized && (
          <form onSubmit={handleSendEmail} className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col px-4 py-2 space-y-2">
              <input
                disabled
                type="email"
                value={conversation?.content?.email || ""}
                className={`w-full px-2 py-1 border-b ${darkMode ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none text-sm`}
                placeholder="To"
              />

              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleChange}
                className={`w-full px-2 py-1 border-b ${darkMode ? "bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"} focus:outline-none text-sm`}
                placeholder="Subject"
              />

              <textarea
                name="message"
                rows="8"
                value={emailData.message}
                onChange={handleChange}
                className={`w-full h-full px-2 py-2 border-none resize-none ${darkMode ? "bg-gray-800 text-gray-200 placeholder-gray-400" : "bg-white text-gray-900 placeholder-gray-500"} focus:outline-none text-sm font-sans leading-relaxed`}
                placeholder="Compose email"
                required
              />

              {attachedFile && (
                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  📎 {attachedFile.name}
                  <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-between px-4 py-3 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <button type="submit" className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors">
                <FaPaperPlane className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConversationModal;
