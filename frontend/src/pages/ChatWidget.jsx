import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  // État pour gérer le texte affiché progressivement pour chaque message
  const [displayedMessages, setDisplayedMessages] = useState([]);

  // Fonction pour simuler l'effet de typing
  const typeMessage = (fullText, messageIndex) => {
    let currentText = '';
    let charIndex = 0;

    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        currentText += fullText[charIndex];
        setDisplayedMessages((prev) =>
          prev.map((msg, idx) =>
            idx === messageIndex ? { ...msg, displayedText: currentText } : msg
          )
        );
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30); // Vitesse de l'animation (30ms par caractère, ajustable)
  };

  // Met à jour displayedMessages à chaque changement de messages
  useEffect(() => {
    setDisplayedMessages(
      messages.map((msg, idx) => ({
        ...msg,
        displayedText: msg.role === 'user' ? msg.text : '', // Les messages utilisateur s'affichent immédiatement
      }))
    );

    // Lancer l'effet de typing pour le dernier message du bot
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'bot') {
      typeMessage(lastMessage.text, messages.length - 1);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/mastertable/chat', { prompt });
      const botMessage = { role: 'bot', text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "❌ Erreur lors de la communication avec l’IA." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 z-50 cursor-pointer"
        onClick={() => {
          if (!isOpen && messages.length === 0) {
            setMessages([{ role: 'bot', text: '👋 Bonjour ! Je suis l’assistant MasterTable. Comment puis-je vous aider ?' }]);
          }
          setIsOpen(!isOpen);
        }}
        aria-label="Ouvrir le chat"
      >
        💬
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 right-6 w-80 max-h-[80vh] bg-white border border-indigo-200 shadow-xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-indigo-600 text-white px-4 py-3 font-semibold flex justify-between items-center">
              <span>🤖 Assistant MasterTable</span>
              <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold cursor-pointer">
                ×
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 text-sm">
              {displayedMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-100 text-gray-800'
                    } shadow`}
                  >
                    {msg.displayedText || msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-gray-400 italic text-center">L’assistant rédige une réponse...</div>
              )}
            </div>

            <div className="p-3 bg-white flex gap-2 items-end shadow-[0_0_6px_rgba(99,102,241,0.3)] rounded-b-2xl border-t border-indigo-100">
              <textarea
                rows={1}
                className="flex-1 resize-none rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 max-h-[120px] overflow-y-auto leading-snug bg-white border border-indigo-200 shadow-sm focus:shadow-md transition"
                style={{ height: 'auto' }}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.overflowY = 'hidden';
                  if (el.scrollHeight <= 120) {
                    el.style.height = `${el.scrollHeight}px`;
                  } else {
                    el.style.height = '120px';
                    el.style.overflowY = 'auto';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Pose ta question... "
              />
              <button
                onClick={sendMessage}
                className="self-end h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-md hover:from-indigo-600 hover:to-violet-600 transition cursor-pointer"
              >
                Envoyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}