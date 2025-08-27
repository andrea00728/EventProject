// AdminFilters.jsx
import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';

const AdminFilters = ({ onFilterChange }) => {
  const { darkMode } = useDarkMode(); // Utilisation du contexte

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full">
      <div className="relative w-full md:w-1/2">
        <input
          type="text"
          placeholder="Rechercher par nom..."
          onChange={(e) => onFilterChange(prev => ({ ...prev, query: e.target.value }))}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300'}`}
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.9 14.32a8 8 0 111.41-1.41l5.35 5.33-1.42 1.42-5.33-5.35zM8 14A6 6 0 108 2a6 6 0 000 12z" />
        </svg>
      </div>
      <div className="w-full md:w-1/2">
        <select
          onChange={(e) => onFilterChange(prev => ({ ...prev, role: e.target.value }))}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-100 border-gray-300'}`}
        >
          <option value="">Tous les rôles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Modérateur">Modérateur</option>
          <option value="Rédacteur">Rédacteur</option>
        </select>
      </div>
    </div>
  );
};

export default AdminFilters;