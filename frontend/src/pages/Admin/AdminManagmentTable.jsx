import React, { useEffect, useState } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import AdminList from "../Admin/AdminList";
import AdminForm from "../Admin/AdminForm";
import AdminFilters from "../Admin/AdminFilters";
import ActionButton from "../Admin/ActionBoutton";
import { FaUserPlus, FaFileExport } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import {
  createOneAdmin,
  deleteOneAdmin,
  getListOfAllAdmins,
} from "../../services/userService";
import { useStateContext } from "../../context/ContextProvider";
import { handleDownloadXLSX } from "../../services/downloadXLSX";

const glows = [
  "0 0 15px rgba(59, 130, 246, 0.6)",
  "0 0 15px rgba(168, 85, 247, 0.6)",
];
const MotionLink = motion(Link);

export default function AdminManagementPage() {
  const { darkMode } = useDarkMode();
  const [admins, setAdmins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ query: "", role: "" });

  // Ajouts pour la gestion des erreurs et du chargement
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user } = useStateContext();

  if (user?.role === "admin") {
    return <Navigate to="/AdminAccueil" replace />;
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getListOfAllAdmins();
        setAdmins(data);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des administrateurs :",
          error
        );
        setError(
          "Impossible de charger les administrateurs." ||
            error.response.data.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const getErrorMessage = (error, defaultMsg) => {
    // Axios error
    if (error?.response?.data?.message) return error.response.data.message;
    // Fetch / autre erreur
    if (error?.message) return error.message;
    return defaultMsg;
  };

  const addAdmin = async (newAdmin) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await createOneAdmin(newAdmin);
      if (res) {
        setAdmins([...admins, res]);
        setIsModalOpen(false);
        setSuccess("Administrateur ajouté avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la création d'un admin :", error.response);
      setError(getErrorMessage(error, "Échec de l'ajout de l'administrateur."));
    }
  };

  const deleteAdmin = async (id) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await deleteOneAdmin(id);
      if (res) {
        console.log("Admin deleted:", res);
        setAdmins(admins.filter((admin) => admin.id !== id));
        setSuccess("Administrateur supprimé avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setError(
        "Impossible de supprimer l'administrateur." ||
          error.response.data.message
      );
    }
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchesName = admin.name
      ?.toLowerCase()
      .includes(filters.query.toLowerCase());
    const matchesRole = filters.role === "" || admin.role === filters.role;
    return matchesName && matchesRole;
  });

  const handleExportExcel = () => {
    const page = (filteredAdmins.length != 0 && filteredAdmins).map(
      (value) => ({
        Nom: value.name,
        Email: value.email,
        Date_creation: value.createdAt,
        Derniere_connexion: value.lastLogin,
        Debut_connexion: value.lastLogin,
        Fin_connexion: value.lastLogout,
      })
    );
    handleDownloadXLSX(page, "liste_Admin");
  };

  const exportAdmins = () => {
    try {
      // ... (votre code d'exportation)
      handleExportExcel();
      setSuccess("Exportation réussie !");
    } catch (error) {
      console.error("Erreur d'exportation :", error);
      setError(
        "Échec de l'exportation des administrateurs." ||
          error.response.data.message
      );
    }
  };

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";

  return (
    <div
      className={`min-h-screen p-1 sm:p-6 md:p-6 w-full mx-auto transition duration-500 ${pageBg}`}
    >
      <p className="text-gray-500 mb-8 dark:text-gray-400 text-center md:text-left">
        Gestion des comptes des administrateurs ainsi que leurs permissions.
      </p>

      {/* Messages d’erreur ou de succès */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg shadow">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow">
          {success}
        </div>
      )}
      {loading && (
        <div className="mb-4 p-3 text-blue-500 animate-pulse">
          Chargement en cours...
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-0 mb-6 space-y-4 md:space-y-0 md:space-x-4">
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

      {isModalOpen && (
        <AdminForm onAdd={addAdmin} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
