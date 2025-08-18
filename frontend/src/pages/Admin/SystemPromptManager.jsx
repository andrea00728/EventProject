import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext"; // Assurez-vous que le chemin est correct
import { MdAdd, MdSave, MdCancel, MdEdit, MdDelete, MdCheckCircle, MdError } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

export default function EnhancedSystemPromptManager() {
  const { darkMode } = useDarkMode();
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/system-prompt`);
      setPrompts(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des prompts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCreate = async () => {
    if (!newPrompt.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/system-prompt`, { content: newPrompt });
      setNewPrompt('');
      fetchPrompts();
    } catch (err) {
      setError("Erreur lors de la création du prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingPrompt.content.trim()) return;
    setLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/system-prompt/${id}`, {
        content: editingPrompt.content,
        isActive: editingPrompt.isActive,
      });
      setEditingPrompt(null);
      fetchPrompts();
    } catch (err) {
      setError("Erreur lors de la mise à jour du prompt.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/system-prompt/${id}`);
      fetchPrompts();
    } catch (err) {
      setError("Erreur lors de la suppression du prompt.");
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = `min-h-auto py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
    darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
  }`;

  const cardClasses = `p-6 rounded-xl shadow-lg transition-colors duration-300 ${
    darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
  }`;

  const inputClasses = `w-full p-4 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300 ${
    darkMode
      ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500"
      : "bg-gray-50 border-gray-200 text-gray-800 focus:ring-indigo-500"
  }`;

  const activeLabelClasses = `inline-flex items-center font-medium transition-colors duration-300 ${
    darkMode ? "text-green-400" : "text-green-600"
  }`;

  const inactiveLabelClasses = `inline-flex items-center font-medium transition-colors duration-300 ${
    darkMode ? "text-red-400" : "text-red-600"
  }`;
  
  const textClasses = darkMode ? "text-gray-300" : "text-gray-800";
  const mutedTextClasses = darkMode ? "text-gray-500" : "text-gray-600";
  const dateTextClasses = darkMode ? "text-gray-400" : "text-gray-500";
  const checkboxClasses = `w-5 h-5 rounded transition-all duration-300 ${darkMode ? "text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500" : "text-indigo-600 border-gray-300 focus:ring-indigo-500"}`;

  return (
    <div className={containerClasses}>
      <div className="max-w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h3 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Gestion des Prompts de l'IA
          </h3>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 mb-6 rounded-lg shadow-md transition-colors duration-300 flex items-center ${
              darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700"
            }`}
          >
            <MdError className="text-2xl mr-3" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {/* Formulaire pour ajouter un nouveau prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cardClasses + " mb-8"}
        >
          <h4 className={`text-xl font-semibold mb-4 ${textClasses}`}>Ajouter un nouveau prompt</h4>
          <textarea
            className={inputClasses}
            rows="4"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            placeholder="Entrez un nouveau prompt pour l'IA..."
          />
          <div className="mt-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                darkMode
                  ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-600"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 w-5 h-5" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <MdAdd className="mr-2 w-5 h-5" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Liste des prompts */}
        <div className="space-y-6">
          <AnimatePresence>
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cardClasses}
              >
                {editingPrompt?.id === prompt.id ? (
                  <div>
                    <textarea
                      className={inputClasses}
                      rows="4"
                      value={editingPrompt.content}
                      onChange={(e) =>
                        setEditingPrompt({ ...editingPrompt, content: e.target.value })
                      }
                    />
                    <label className="flex items-center mt-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPrompt.isActive}
                        onChange={(e) =>
                          setEditingPrompt({ ...editingPrompt, isActive: e.target.checked })
                        }
                        className={checkboxClasses}
                      />
                      <span className={`ml-2 font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Actif</span>
                    </label>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => handleUpdate(prompt.id)}
                        disabled={loading}
                        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                          darkMode
                            ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-600"
                            : "bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
                        }`}
                      >
                        <MdSave className="mr-2 w-5 h-5" />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingPrompt(null)}
                        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                          darkMode
                            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                        }`}
                      >
                        <MdCancel className="mr-2 w-5 h-5" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className={`leading-relaxed mb-3 ${textClasses}`}>{prompt.content}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <span className={prompt.isActive ? activeLabelClasses : inactiveLabelClasses}>
                        {prompt.isActive ? (
                          <MdCheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <MdError className="w-4 h-4 mr-1" />
                        )}
                        {prompt.isActive ? "Actif" : "Inactif"}
                      </span>
                      <span className={dateTextClasses}>
                        Créé le{" "}
                        {new Date(prompt.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span className={dateTextClasses}>
                        Modifié le{" "}
                        {new Date(prompt.updatedAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        onClick={() => setEditingPrompt(prompt)}
                        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                          darkMode
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        <MdEdit className="mr-2 w-5 h-5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        disabled={loading}
                        className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                          darkMode
                            ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600"
                            : "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                        }`}
                      >
                        <MdDelete className="mr-2 w-5 h-5" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center mt-6 ${mutedTextClasses}`}
          >
            <FaSpinner className="animate-spin mx-auto h-6 w-6" />
            Chargement...
          </motion.div>
        )}
      </div>
    </div>
  );
}