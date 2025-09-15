// AdminList.jsx
import React from 'react';
import { useDarkMode } from '../../context/DarkModeContext';
import { FaUserCircle, FaTrash, FaEnvelope, FaTag, FaCalendarAlt, FaSignInAlt, FaCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { formatDate } from 'date-fns';

const AdminList = ({ admins, onDelete }) => {
  const { darkMode } = useDarkMode();
  
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
    <>
      {/* Section Tableau pour les écrans larges (Tablettes et PC) */}
      <div
        className={`overflow-x-auto rounded-xl shadow-xl transition-all duration-300 md:block hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead
            className={`text-xs uppercase ${
              darkMode
                ? "bg-gray-900/55 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            <tr>
              <th scope="col" className="px-6 py-3">
                Nom
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Rôle
              </th>
              <th scope="col" className="px-6 py-3">
                Date de création
              </th>
              <th scope="col" className="px-6 py-3">
                Dernière connexion
              </th>
              <th scope="col" className="px-6 py-3">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {admins.map((admin) => (
              <motion.tr
                key={admin.id}
                className={`border-b ${
                  darkMode
                    ? "border-gray-700 hover:bg-gray-700/50"
                    : "border-gray-200 hover:bg-gray-100"
                } transition duration-300`}
                variants={itemVariants}
              >
                <td
                  scope="row"
                  className={`px-6 py-4 font-medium whitespace-nowrap flex items-center gap-3 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {admin.photoEmail ? <img src={admin.photoEmail} alt={admin.name} className="w-10 h-10 rounded-full object-cover" /> : <FaUserCircle className="text-2xl text-purple-500" />}
                  {admin.name}
                </td>
                <td
                  className={`px-6 py-4 ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {admin.email}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      admin.role === "super_admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                    }`}
                  >
                    {admin.role}
                  </span>
                </td>
                <td
                  scope="row"
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {formatDate(admin?.createdAt, "dd/MM/yyyy HH:mm:ss")}
                </td>
                <td
                  scope="row"
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
                    darkMode ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {formatDate(admin?.lastLogin, "dd/MM/yyyy HH:mm:ss")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      admin.isOnline
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {admin.isOnline ? "Actif" : "Non actif"}
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
          </motion.tbody>
        </table>
      </div>

      {/* Section Cartes pour les petits écrans (Mobile) */}
      <div className="md:hidden block">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 p-4"
        >
          {admins.map((admin) => (
            <motion.div
              key={admin.id}
              variants={itemVariants}
              className={`p-4 rounded-xl shadow-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-700"
              } transition-all duration-300 relative`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-2xl text-purple-500" />
                  <div>
                    <h3 className="text-base font-semibold">{admin.name}</h3>
                    <p className="text-xs opacity-70 flex items-center gap-1 mt-1">
                      <FaEnvelope className="text-gray-400" />
                      {admin.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                    admin.isOnline
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  <FaCircle className={`h-2 w-2 ${admin.isOnline ? 'text-green-500' : 'text-red-500'}`} />
                  {admin.isOnline ? "Actif" : "Non actif"}
                </span>
              </div>
              
              <div className="border-t border-dashed my-3 opacity-30 ${darkMode ? 'border-gray-600' : 'border-gray-300'}"></div>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FaTag className="text-gray-400 text-sm" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Rôle</span>
                    <p className="text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          admin.role === "super_admin"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                        }`}
                      >
                        {admin.role}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400 text-sm" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Création</span>
                    <p className="text-sm truncate">{formatDate(admin?.createdAt, "dd/MM/yyyy")}</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <FaSignInAlt className="text-gray-400 text-sm" />
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Dernière connexion</span>
                    <p className="text-sm truncate">{formatDate(admin?.lastLogin, "dd/MM/yyyy HH:mm")}</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-20 right-4">
                <button
                  onClick={() => onDelete(admin.id)}
                  className={`text-red-500 hover:text-red-700 transition duration-300 p-2 rounded-full hover:bg-red-100 ${
                    darkMode
                      ? "hover:bg-red-900/50"
                      : "hover:bg-red-300/50"
                  }`}
                  aria-label="Supprimer l'administrateur"
                >
                  <FaTrash className="inline-block text-lg" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );

};

export default AdminList;