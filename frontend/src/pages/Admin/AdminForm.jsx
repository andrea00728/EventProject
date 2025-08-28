// AdminForm.jsx
import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { motion } from 'framer-motion';

const AdminForm = ({ onAdd, onClose }) => {
  const { darkMode } = useDarkMode();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Rédacteur');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !role) return;
    onAdd({ name, email, role });
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`relative p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${darkMode ? "bg-gray-800 text-gray-200" : "bg-white text-gray-900"}`}
        variants={modalVariants}
      >
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" onClick={onClose}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Ajouter un nouvel Administrateur</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} htmlFor="name">Nom</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300'}`}
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet de l'administrateur"
            />
          </div>
          <div className="mb-4">
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} htmlFor="email">Email</label>
            <input
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300'}`}
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email de l'administrateur"
            />
          </div>
          {/* <div className="mb-6">
            <label className={`block font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} htmlFor="role">Rôle</label>
            <select
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300'}`}
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Super Admin</option>
              <option>Modérateur</option>
              <option>Rédacteur</option>
            </select>
          </div> */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${darkMode ? "bg-gray-600 text-gray-100 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdminForm;