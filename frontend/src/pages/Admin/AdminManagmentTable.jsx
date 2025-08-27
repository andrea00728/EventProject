import React, { useState } from 'react';
import { useDarkMode } from '../../context/DarkModeContext'; 
import AdminList from '../Admin/AdminList';
import AdminForm from '../Admin/AdminForm';
import AdminFilters from '../Admin/AdminFilters';
import ActionButton from '../Admin/ActionBoutton';
import { FaUserPlus, FaFileExport } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const initialAdmins = [
  { id: 1, name: "Alice blue", email: "alice.b@colorie.com", role: "Super Admin", status: "Actif" },
  { id: 2, name: "Bob Marley", email: "bob.m@reggae.com", role: "Rédacteur", status: "Inactif" },
  { id: 3, name: "Charlie Le rock", email: "charlie.R@metal.com", role: "Modérateur", status: "Actif" },
];

const glows = ["0 0 15px rgba(59, 130, 246, 0.6)", "0 0 15px rgba(168, 85, 247, 0.6)"];
const MotionLink = motion(Link);

export default function AdminManagementPage() {
  const { darkMode } = useDarkMode();
  const [admins, setAdmins] = useState(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ query: '', role: '' });
  
  // Le reste du code...
  const addAdmin = (newAdmin) => {
    setAdmins([...admins, { ...newAdmin, id: Date.now(), status: "Actif" }]);
    setIsModalOpen(false);
  };
  
  const deleteAdmin = (id) => {
    setAdmins(admins.filter(admin => admin.id !== id));
  };
  
  const filteredAdmins = admins.filter(admin => {
    const matchesName = admin.name.toLowerCase().includes(filters.query.toLowerCase());
    const matchesRole = filters.role === '' || admin.role === filters.role;
    return matchesName && matchesRole;
  });

  const exportAdmins = () => {
    // ... (votre code d'exportation)
  };
  
  const pageBg = darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-50 text-gray-800";

  return (
    <div className={`min-h-screen p-1 sm:p-6 md:p-6 w-full mx-auto transition duration-500 ${pageBg}`}>

        {/* <h1 className="text-4xl font-extrabold text-gray-800 mb-2 dark:text-gray-100">
          Gestion des Administrateurs
        </h1> */}
        <p className="text-gray-500 mb-8 dark:text-gray-400">
          Gestion des comptes des administrateurs ainsi que leurs permissions.
        </p>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-auto">
            <AdminFilters onFilterChange={setFilters} />
          </div>
          <div className="flex space-x-2">
            <motion.div whileHover={{ scale: 1.05, boxShadow: glows[0] }}>
                <ActionButton 
                    icon={<FaUserPlus />} 
                    label="Ajouter un Admin" 
                    onClick={() => setIsModalOpen(true)} 
                    className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 text-white" 
                />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, boxShadow: glows[1] }}>
                <ActionButton 
                    icon={<FaFileExport />} 
                    label="Exporter CSV" 
                    onClick={exportAdmins} 
                    className="bg-gradient-to-r from-green-500 via-emerald-600 to-lime-500 text-white" 
                />
            </motion.div>
          </div>
        </div>

        <AdminList admins={filteredAdmins} onDelete={deleteAdmin} />

      {isModalOpen && <AdminForm onAdd={addAdmin} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}