import { useEffect, useState, useCallback } from "react";
import { getPersonnelByEventId } from "../../services/personnel_service";
import * as XLSX from "xlsx";
import { Grid2X2, List, Search, X } from "lucide-react";

const roleLabels = {
  accueil: "🛎️ Accueil",
  caissier: "💰 Caissier",
  cuisinier: "👨‍🍳 Cuisinier",
};

const statusLabels = {
  confirmed: { label: "✅ Confirmé", style: "bg-green-100 text-green-800" },
  pending: { label: "🕒 En attente", style: "bg-yellow-100 text-yellow-800" },
};

export default function ListePersonnel({ eventId, token, refreshTrigger }) {
  const [personnels, setPersonnels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fonction de filtrage mémoïsée
  const applyFilters = useCallback((data) => {
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
          (roleLabels[p.role] && roleLabels[p.role].toLowerCase().includes(term)) ||
          (statusLabels[p.status]?.label && statusLabels[p.status].label.toLowerCase().includes(term))
      );
    }
    
    setFiltered(result);
  }, [selectedRole, selectedStatus, searchTerm]);

  // Chargement des données
  useEffect(() => {
    if (!eventId || !token) return;
    
    const fetchPersonnels = async () => {
      try {
        setLoading(true);
        const data = await getPersonnelByEventId(eventId, token);
        setPersonnels(data);
        applyFilters(data);
      } catch (err) {
        setError("Erreur lors du chargement des personnels.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonnels();
    const interval = setInterval(fetchPersonnels, 6000);
    return () => clearInterval(interval);
  }, [eventId, token, refreshTrigger, applyFilters]);

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
      Rôle: roleLabels[p.role] || p.role,
      Statut: statusLabels[p.status]?.label || p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnels");
    XLSX.writeFile(workbook, `personnels_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "card" : "list");
  };

  return (
  <div className="space-y-6">
    {/* Header avec statistiques */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard Personnel</h1>
          <p className="text-blue-100">Vue d'ensemble de votre équipe</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
        <div className={`relative flex-1 ${isSearchFocused ? 'ring-2 ring-purple-500' : ''} rounded-xl transition-all duration-300`}>
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
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
          Filtrer par rôle :
        </span>
        <div className="flex flex-wrap gap-2">
          {["all", ...Object.keys(roleLabels)].map((role, index) => (
            <button
              key={role}
              onClick={() => handleFilter(role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedRole === role
                  ? index % 5 === 0 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : index % 5 === 1
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                    : index % 5 === 2
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-500/25"
                    : index % 5 === 3
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                  : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white border border-slate-200 hover:border-slate-300"
              }`}
            >
              {role === "all" ? "Tous les rôles" : roleLabels[role]}
            </button>
          ))}
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
            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-bold text-slate-800">Nom</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-800">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-800">Rôle</th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-slate-800">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p, index) => (
                  <tr key={p.id} className="hover:bg-white/50 transition-colors duration-200">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-slate-900">{p.nom}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{p.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        index % 5 === 0 ? 'bg-blue-100 text-blue-800'
                        : index % 5 === 1 ? 'bg-purple-100 text-purple-800'
                        : index % 5 === 2 ? 'bg-pink-100 text-pink-800'
                        : index % 5 === 3 ? 'bg-orange-100 text-orange-800'
                        : 'bg-amber-100 text-amber-800'
                      }`}>
                        {roleLabels[p.role] || p.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        statusLabels[p.status]?.style || "bg-slate-100 text-slate-800"
                      }`}>
                        {statusLabels[p.status]?.label || p.status}
                      </span>
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
              <div className={`h-2 ${
                index % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : index % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                : index % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                : index % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}></div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 ${
                    index % 5 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                    : index % 5 === 1 ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                    : index % 5 === 2 ? 'bg-gradient-to-r from-pink-500 to-pink-600'
                    : index % 5 === 3 ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                  }`}>
                    {p.nom.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-slate-800 transition-colors">
                      {p.nom}
                    </h3>
                    <p className="text-sm text-slate-600 truncate">{p.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                    index % 5 === 0 ? 'bg-blue-100 text-blue-800'
                    : index % 5 === 1 ? 'bg-purple-100 text-purple-800'
                    : index % 5 === 2 ? 'bg-pink-100 text-pink-800'
                    : index % 5 === 3 ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                  }`}>
                    {roleLabels[p.role] || p.role}
                  </span>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                    statusLabels[p.status]?.style || "bg-slate-100 text-slate-800"
                  }`}>
                    {statusLabels[p.status]?.label || p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

}