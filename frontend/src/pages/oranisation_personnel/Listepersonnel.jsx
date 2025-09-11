import { useEffect, useState, useCallback } from "react";
import { getPersonnelByEventId } from "../../services/personnel_service";
import * as XLSX from "xlsx";
import { Grid2X2, List, Search, X, Star } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  TextField
} from "@mui/material";
import axiosClient from "../../api/axios-client";

// Thème de couleurs
const theme = {
  primary: "#4f46e5",
  primaryHover: "#3730a3",
  primaryLight: "#a5b4fc",
  secondary: "#3b82f6",
  secondaryHover: "#1d4ed8",
  accent: "#06b6d4",
  success: "#10b981",
  danger: "#ef4444",
  dangerHover: "#dc2626",
  warning: "#f59e0b",
  neutral: "#f8fafc",
  neutralDark: "#e2e8f0",
  text: "#1e293b",
  textLight: "#64748b",
  background: "#ffffff",
  gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradientCard: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
};

// Rôles prédéfinis avec leurs labels et couleurs
const predefinedRoleLabels = {
  accueil: "🛎 Accueil",
  caissier: "💰 Caissier",
  cuisinier: "👨‍🍳 Cuisinier",
};

// Fonction pour générer un label pour les rôles personnalisés
const generateRoleLabel = (role) => {
  if (predefinedRoleLabels[role]) {
    return predefinedRoleLabels[role];
  }
  // Pour les rôles personnalisés, on ajoute une étoile et on capitalise
  return `⭐ ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}`;
};

// Fonction pour générer une couleur basée sur le nom du rôle
const getRoleColor = (role, index) => {
  if (predefinedRoleLabels[role]) {
    // Couleurs pour les rôles prédéfinis
    const predefinedColors = {
      accueil: "bg-blue-100 text-blue-800",
      caissier: "bg-green-100 text-green-800",
      cuisinier: "bg-yellow-100 text-yellow-800",
    };
    return predefinedColors[role];
  }

  // Couleurs pour les rôles personnalisés (basé sur l'index)
  const customColors = [
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
    "bg-red-100 text-red-800",
    "bg-orange-100 text-orange-800",
    "bg-teal-100 text-teal-800",
    "bg-cyan-100 text-cyan-800",
    "bg-lime-100 text-lime-800",
    "bg-emerald-100 text-emerald-800",
    "bg-violet-100 text-violet-800",
  ];

  return customColors[index % customColors.length];
};

const statusLabels = {
  confirmed: { label: "✅ Confirmé", style: "bg-green-100 text-green-800" },
  pending: { label: "🕒 En attente", style: "bg-yellow-100 text-yellow-800" },
};

export default function ListePersonnel({ eventId}) {
  const [personnels, setPersonnels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [uniqueRoles, setUniqueRoles] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [form, setForm] = useState({ nom: "", email: "", role: "", status: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fonction pour charger les données (déplacée pour être réutilisable)
  const fetchPersonnels = async () => {
    try {
      setLoading(true);
      const data = await getPersonnelByEventId(eventId);
      setPersonnels(data);

      // Extraire les rôles uniques
      const roles = [...new Set(data.map((p) => p.role))];
      setUniqueRoles(roles);

      applyFilters(data);
    } catch (err) {
      setError("Erreur lors du chargement des personnels.");
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de confirmation de suppression
  const handleOpenDeleteConfirm = (item) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Fermer le modal de confirmation de suppression
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      // Appel API pour supprimer l'élément (corrigé avec headers d'auth si nécessaire, mais supposant que le token est géré ailleurs ou non requis pour cet exemple)
      await axiosClient.delete(`/personnel/${itemToDelete.id}`, {
        withCredentials: true,
      });
      setSnackbar({
        open: true,
        message: `Utilisateur ${itemToDelete.nom} supprimé avec succès`,
        severity: "success",
      });
      handleCloseDeleteConfirm();
      fetchPersonnels(); // Recharger les données après suppression
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression",
        severity: "error",
      });
    }
  };

  // Ouvrir le modal de modification
  const handleOpenEditForm = (item) => {
    setItemToEdit(item);
    setForm({
      nom: item.nom || "",
      email: item.email || "",
      role: item.role || "",
      status: item.status || "",
    });
    setEditFormOpen(true);
  };

  // Fermer le modal de modification
  const handleCloseEditForm = () => {
    setEditFormOpen(false);
    setItemToEdit(null);
  };

  // Enregistrer les modifications
  const handleSaveEdit = async () => {
    if (!itemToEdit) return;
    try {
      // Appel API pour modifier l'élément (corrigé avec headers d'auth si nécessaire)
      await axiosClient.patch(`/personnel/${itemToEdit.id}`, form, {
        withCredentials: true,
      }
      );
      setSnackbar({
        open: true,
        message: `Utilisateur ${form.nom} modifié avec succès`,
        severity: "success",
      });
      handleCloseEditForm();
      fetchPersonnels(); // Recharger les données après modification
    } catch (err) {
      console.error("Erreur lors de la modification :", err);
      setSnackbar({
        open: true,
        message: "Erreur lors de la modification",
        severity: "error",
      });
    }
  };

  // Fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fonction de filtrage mémoïsée
  const applyFilters = useCallback(
    (data) => {
      let result = [...data];

      // Filtre par rôle
      if (selectedRole !== "all") {
        result = result.filter((p) => p.role === selectedRole);
      }

      // Filtre par statut
      if (selectedStatus !== "all") {
        result = result.filter((p) => p.status === selectedStatus);
      }

      // Filtre par recherche
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (p) =>
            p.nom.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term) ||
            p.role.toLowerCase().includes(term) ||
            generateRoleLabel(p.role).toLowerCase().includes(term) ||
            (statusLabels[p.status]?.label &&
              statusLabels[p.status].label.toLowerCase().includes(term))
        );
      }

      setFiltered(result);
    },
    [selectedRole, selectedStatus, searchTerm]
  );

  // Chargement des données
  useEffect(() => {
    if (!eventId) return;
    fetchPersonnels();
  }, [eventId]);

  // Application des filtres quand ils changent
  useEffect(() => {
    applyFilters(personnels);
  }, [selectedRole, selectedStatus, searchTerm, applyFilters, personnels]);

  const handleFilter = (role) => {
    setSelectedRole(role);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleExportExcel = () => {
    const data = filtered.map((p) => ({
      Nom: p.nom,
      Email: p.email,
      Rôle: generateRoleLabel(p.role),
      Statut: statusLabels[p.status]?.label || p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnels");
    XLSX.writeFile(workbook, `personnels_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "card" : "list");
  };

  // Séparer les rôles prédéfinis des rôles personnalisés
  const predefinedRoles = uniqueRoles.filter((role) => predefinedRoleLabels[role]);
  const customRoles = uniqueRoles.filter((role) => !predefinedRoleLabels[role]);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Dashboard Personnel</h1>
            <p className="text-blue-100">Vue d'ensemble de votre équipe</p>
            {uniqueRoles.length > 0 && (
              <div className="mt-2 text-sm text-blue-100">
                {uniqueRoles.length} rôle{uniqueRoles.length > 1 ? "s" : ""} différent
                {uniqueRoles.length > 1 ? "s" : ""}
                {customRoles.length > 0 && (
                  <span className="ml-2 text-blue-200">
                    ({customRoles.length} personnalisé{customRoles.length > 1 ? "s" : ""})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-bold">{filtered.length}</div>
              <div className="text-sm text-blue-100">
                {filtered.length > 1 ? "Personnels" : "Personnel"}
              </div>
            </div>
            <button
              onClick={handleExportExcel}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
              disabled={filtered.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Exporter Excel
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et contrôles */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div
            className={`relative flex-1 ${isSearchFocused ? "ring-2 ring-purple-500" : ""
              } rounded-xl transition-all duration-300`}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Rechercher par nom, email, rôle..."
              className="pl-12 pr-12 py-3 w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              value={searchTerm}
              onChange={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              </button>
            )}
          </div>

          {/* Bouton vue */}
          <button
            onClick={toggleViewMode}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {viewMode === "list" ? (
              <>
                <Grid2X2 className="w-5 h-5" /> Vue Cartes
              </>
            ) : (
              <>
                <List className="w-5 h-5" /> Vue Liste
              </>
            )}
          </button>
        </div>

        {/* Filtres */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
              Filtrer par rôle :
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilter("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedRole === "all"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-slate-300"
                  }`}
              >
                Tous les rôles ({uniqueRoles.length})
              </button>

              {/* Rôles prédéfinis */}
              {predefinedRoles.map((role, index) => (
                <button
                  key={role}
                  onClick={() => handleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedRole === role
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-slate-300"
                    }`}
                >
                  {generateRoleLabel(role)}
                </button>
              ))}

              {/* Rôles personnalisés */}
              {customRoles.map((role, index) => (
                <button
                  key={role}
                  onClick={() => handleFilter(role)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-1 ${selectedRole === role
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25"
                      : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <Star className="w-3 h-3" />
                  {generateRoleLabel(role)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="animate-fade-in">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 absolute top-0"></div>
            </div>
            <p className="text-slate-600 mt-4 font-medium">Chargement des données...</p>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-red-500 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Aucun résultat trouvé</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              {searchTerm
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun personnel ne correspond aux filtres sélectionnés"}
            </p>
            {(searchTerm || selectedRole !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <tr>
                    <th
                      scope="col"
                      className="py-4 pl-6 pr-3 text-left text-sm font-bold text-slate-800"
                    >
                      Nom
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-bold text-slate-800"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-bold text-slate-800"
                    >
                      Rôle
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-bold text-slate-800"
                    >
                      Statut
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-bold text-slate-800"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p, index) => (
                    <tr
                      key={p.id}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-slate-900">
                        {p.nom}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {p.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${getRoleColor(
                            p.role,
                            index
                          )}`}
                        >
                          {generateRoleLabel(p.role)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusLabels[p.status]?.style || "bg-slate-100 text-slate-800"
                            }`}
                        >
                          {statusLabels[p.status]?.label || p.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenEditForm(p)}
                            sx={{
                              bgcolor: theme.neutral,
                              color: theme.primary,
                              "&:hover": {
                                bgcolor: theme.primary,
                                color: "white",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            <FaEdit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDeleteConfirm(p)}
                            sx={{
                              bgcolor: theme.neutral,
                              color: theme.danger,
                              "&:hover": {
                                bgcolor: theme.danger,
                                color: "white",
                                transform: "scale(1.1)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            <FaTrash />
                          </IconButton>
                        </Box>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, index) => (
              <div
                key={p.id}
                className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105 overflow-hidden"
              >
                <div
                  className={`h-2 ${predefinedRoleLabels[p.role]
                      ? index % 3 === 0
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : index % 3 === 1
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                    }`}
                ></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${predefinedRoleLabels[p.role]
                          ? index % 3 === 0
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : index % 3 === 1
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                    >
                      {predefinedRoleLabels[p.role] ? (
                        p.nom.charAt(0).toUpperCase()
                      ) : (
                        <Star className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-slate-800 transition-colors">
                        {p.nom}
                      </h3>
                      <p className="text-sm text-slate-600 truncate">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${getRoleColor(
                        p.role,
                        index
                      )}`}
                    >
                      {generateRoleLabel(p.role)}
                    </span>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusLabels[p.status]?.style || "bg-slate-100 text-slate-800"
                        }`}
                    >
                      {statusLabels[p.status]?.label || p.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Dialog de confirmation de suppression */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleCloseDeleteConfirm}
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4 } }}
        >
          <DialogTitle
            sx={{
              color: theme.danger,
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontWeight: "bold",
            }}
          >
            <FaTrash />
            Confirmer la suppression
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography variant="body1">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>{itemToDelete?.nom}</strong> ?
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textLight, mt: 1 }}>
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDeleteConfirm}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                bgcolor: theme.danger,
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: theme.dangerHover,
                  transform: "translateY(-1px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
        {/* Dialog de modification */}
        <Dialog
          open={editFormOpen}
          onClose={handleCloseEditForm}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.neutral} 100%)`,
            },
          }}
        >
          <DialogTitle
            sx={{
              background: theme.gradientCard,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            <FaEdit />
            Modifier l'utilisateur
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box sx={{ display: "grid", gap: 3, mt: 2 }}>
              {[
                { field: "nom", label: "Nom", type: "text" },
                { field: "email", label: "Email", type: "email" },
                { field: "role", label: "Rôle", type: "text" },
                { field: "status", label: "Statut", type: "text" },
              ].map(({ field, label, type }) => (
                <TextField
                  key={field}
                  label={label}
                  value={form[field] || ""}
                  type={type}
                  fullWidth
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover fieldset": { borderColor: theme.primary },
                      "&.Mui-focused fieldset": { borderColor: theme.primary },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                  }}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseEditForm}
              variant="outlined"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                borderColor: theme.textLight,
                color: theme.textLight,
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveEdit}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: theme.gradientCard,
                fontWeight: "bold",
                "&:hover": {
                  background: theme.gradientCard,
                  opacity: 0.9,
                },
              }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar pour notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%", borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}