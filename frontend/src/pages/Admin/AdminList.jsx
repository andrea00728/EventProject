// AdminList.jsx
import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { FaTrash, FaEdit, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const AdminList = ({ admins, onDelete }) => {
  const { darkMode } = useDarkMode(); // Utilisation du contexte
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`overflow-x-auto rounded-xl shadow-xl transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <motion.table 
        className="w-full text-left text-sm text-gray-500 dark:text-gray-400"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th scope="col" className="px-6 py-3">Nom</th>
            <th scope="col" className="px-6 py-3">Email</th>
            <th scope="col" className="px-6 py-3">Rôle</th>
            <th scope="col" className="px-6 py-3">Statut</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <motion.tr 
              key={admin.id} 
              className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700/50 transition duration-300`}
              variants={itemVariants}
            >
              <td scope="row" className={`px-6 py-4 font-medium whitespace-nowrap flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                <FaUserCircle className="text-2xl text-purple-500" />
                {admin.name}
              </td>
              <td className="px-6 py-4">{admin.email}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${admin.role === 'Super Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'}`}>
                  {admin.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${admin.status === 'Actif' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                  {admin.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onDelete(admin.id)} 
                  className="text-red-500 hover:text-red-700 transition duration-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                  aria-label="Supprimer l'administrateur"
                >
                  <FaTrash className="inline-block" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};

export default AdminList;