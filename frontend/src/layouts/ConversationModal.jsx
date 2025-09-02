import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaPaperPlane, FaUser } from "react-icons/fa";

const ConversationModal = ({ show, onClose, conversation, darkMode }) => {
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
      if (conversation) {
        setMessages([
          {
            id: 1,
            text:
              typeof conversation.content === "object"
                ? conversation.content.text
                : conversation,
            sender:
              typeof conversation.content === "object"
                ? conversation.content.from
                : "Utilisateur",
            timestamp: new Date(Date.now() - 30 * 60000),
            isAdmin: false,
          },
          {
            id: 2,
            text: "Bonjour et bienvenue 👋. Merci de nous avoir contactés. Un conseiller prendra en charge votre demande dans les plus brefs délais. En attendant, n’hésitez pas à préciser l’objet de votre message.",
            sender: "Support Automatique",
            timestamp: new Date(Date.now() - 25 * 60000),
            isAdmin: true,
          },
        ]);
      }
    }, [conversation]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
      e.preventDefault();
      if (newMessage.trim()) {
        const message = {
          id: messages.length + 1,
          text: newMessage,
          sender: "Admin",
          timestamp: new Date(),
          isAdmin: true,
        };
        setMessages([...messages, message]);
        setNewMessage("");
      }
    };

    const formatTime = (date) => {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-30 z-[101] flex items-center justify-center p-4">
        <div
          className={`w-full max-w-2xl h-[80vh] rounded-lg shadow-xl ${
            darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"
          } flex flex-col`}
        >
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            } flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <FaUser className="text-sm" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {typeof conversation?.content === "object"
                    ? conversation.content.from
                    : "Utilisateur"}
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  En ligne
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isAdmin ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isAdmin
                      ? "bg-blue-500 text-white"
                      : darkMode
                        ? "bg-gray-700 text-gray-200"
                        : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isAdmin
                        ? "text-blue-100"
                        : darkMode
                          ? "text-gray-400"
                          : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSendMessage}
            className={`p-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default ConversationModal;