import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  MdLocationCity,
  MdRoom,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdCheck,
  MdCalendarToday,
  MdExpandMore,
  MdExpandLess,
  MdSearch,
  MdFilterList,
  MdRefresh
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";

const API_URL = "http://localhost:3000/locations";

const LocationSalle = () => {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newSalleName, setNewSalleName] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [editLocationId, setEditLocationId] = useState(null);
  const [editLocationName, setEditLocationName] = useState("");
  const [editSalleId, setEditSalleId] = useState(null);
  const [editSalleName, setEditSalleName] = useState("");
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { darkMode } = useDarkMode();

  // Fetch all locations with memoization
  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const response = await axios.get(API_URL);
      setLocations(response.data);
      setError(null);
      
      // Initialize expanded state for each location
      const expandedState = {};
      response.data.forEach(loc => {
        expandedState[loc.id] = expandedLocations[loc.id] || false;
      });
      setExpandedLocations(expandedState);
    } catch (err) {
      setError("Erreur lors du chargement des lieux");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Filter locations based on search term and active tab
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (location.salles && location.salles.some(salle => 
        salle.nom.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "withRooms") return matchesSearch && location.salles && location.salles.length > 0;
    if (activeTab === "withoutRooms") return matchesSearch && (!location.salles || location.salles.length === 0);
    
    return matchesSearch;
  });

  // Toggle location expansion
  const toggleLocation = (id) => {
    setExpandedLocations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Expand all locations
  const expandAll = () => {
    const allExpanded = {};
    locations.forEach(loc => {
      allExpanded[loc.id] = true;
    });
    setExpandedLocations(allExpanded);
  };

  // Collapse all locations
  const collapseAll = () => {
    setExpandedLocations({});
  };

  // Create a new location
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) {
      setError("Le nom du lieu est requis");
      return;
    }
    try {
      setIsLoading(true);
      await axios.post(API_URL, { nom: newLocationName });
      setNewLocationName("");
      await fetchLocations();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du lieu");
      console.error("Create location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a location
  const handleUpdateLocation = async (id) => {
    if (!editLocationName.trim()) {
      setError("Le nom du lieu est requis");
      return;
    }
    try {
      setIsLoading(true);
      await axios.put(`${API_URL}/${id}`, { nom: editLocationName });
      setEditLocationId(null);
      setEditLocationName("");
      await fetchLocations();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du lieu");
      console.error("Update location error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete handlers
  const openDeleteLocationModal = (id, nom) => {
    setDeleteItem({ type: "location", id, nom });
    setShowDeleteModal(true);
  };

  const openDeleteSalleModal = (id, nom) => {
    setDeleteItem({ type: "salle", id, nom });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    const { type, id } = deleteItem;
    try {
      setIsLoading(true);
      if (type === "location") {
        await axios.delete(`${API_URL}/${id}`);
        setLocations(locations.filter((loc) => loc.id !== id));
      } else if (type === "salle") {
        await axios.delete(`${API_URL}/salles/${id}`);
        await fetchLocations();
      }
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Erreur lors de la suppression de la ${type}`
      );
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  // Create a new salle
  const handleCreateSalle = async (locationId) => {
    if (!newSalleName.trim()) {
      setError("Le nom de la salle est requis");
      return;
    }
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/${locationId}/salles`, {
        nom: newSalleName,
      });
      setNewSalleName("");
      setSelectedLocationId(null);
      await fetchLocations();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création de la salle");
      console.error("Create salle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a salle
  const handleUpdateSalle = async (id) => {
    if (!editSalleName.trim()) {
      setError("Le nom de la salle est requis");
      return;
    }
    try {
      setIsLoading(true);
      await axios.put(`${API_URL}/salles/${id}`, { nom: editSalleName });
      setEditSalleId(null);
      setEditSalleName("");
      await fetchLocations();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour de la salle");
      console.error("Update salle error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loader for locations
  const LocationSkeleton = () => (
    <div className={`p-6 rounded-lg shadow-xs border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-100"}`}>
      <div className="animate-pulse flex justify-between items-center mb-4">
        <div className={`h-6 rounded w-1/3 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        <div className="flex space-x-2">
          <div className={`h-8 w-8 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
          <div className={`h-8 w-8 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        </div>
      </div>
      <div className="animate-pulse">
        <div className={`h-4 rounded w-1/4 mb-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        <div className={`h-10 rounded w-full mb-2 ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}></div>
        <div className={`h-10 rounded w-full ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}></div>
      </div>
    </div>
  );

  // Skeleton loader for table rows
  const TableRowSkeleton = () => (
    <tr>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`h-5 w-5 rounded mr-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
          <div className={`h-4 rounded w-3/4 ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex justify-end space-x-2">
          <div className={`h-8 w-8 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
          <div className={`h-8 w-8 rounded ${darkMode ? "bg-gray-600" : "bg-gray-200"}`}></div>
        </div>
      </td>
    </tr>
  );

  const gradientTitle = darkMode 
    ? "bg-gradient-to-r from-blue-400 via-violet-400 to-purple-300 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";

  const gradientButton = darkMode
    ? "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-500 text-white"
    : "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}`}>
      <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        {/* Main Content */}
        <div className={`shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          {/* Panel Header */}
          <div className={`px-6 py-4 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-none"}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                <h2 className={`text-2xl sm:text-3xl font-bold flex items-center ${gradientTitle}`}>
                  <MdLocationCity className={`mr-2 sm:mr-3 ${darkMode ? "text-blue-400" : "text-blue-700"}`} /> 
                  Gestion des Lieux & Salles
                </h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2 mb-1">
              <div className={`mt-4 flex space-x-1 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "all" ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-indigo-600 border-b-2 border-indigo-600') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setActiveTab("withRooms")}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "withRooms" ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-indigo-600 border-b-2 border-indigo-600') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                >
                  Avec salles
                </button>
                <button
                  onClick={() => setActiveTab("withoutRooms")}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === "withoutRooms" ? (darkMode ? 'text-blue-400 border-b-2 border-blue-400' : 'text-indigo-600 border-b-2 border-indigo-600') : (darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                >
                  Sans salles
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className={darkMode ? "text-gray-400" : "text-gray-400"} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-500 text-white" : "border-gray-300 focus:ring-indigo-500"}`}
                  />
                </div>
                <div className="relative">
                  <button className={`flex items-center px-3 py-2 border rounded-lg transition ${darkMode ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    <MdFilterList className="mr-2" />
                    <span>Filtrer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mx-6 mt-4 p-4 rounded-lg border flex items-start ${darkMode ? "bg-red-900 bg-opacity-30 border-red-800 text-red-200" : "bg-red-50 border-red-200 text-red-700"}`}
            >
              <div className="flex-1">{error}</div>
              <button 
                onClick={() => setError(null)}
                className={darkMode ? "text-red-300 hover:text-red-100 ml-2" : "text-red-700 hover:text-red-900 ml-2"}
              >
                <MdClose />
              </button>
            </motion.div>
          )}

          {/* Create Location Form */}
          <div className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <MdAdd className={`mr-2 ${darkMode ? "text-blue-400" : "text-indigo-600"}`} /> 
              Ajouter un nouveau lieu
            </h3>
            <form onSubmit={handleCreateLocation} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Nom du lieu (ex: Ivato)"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-500 text-white" : "border-gray-300 focus:ring-indigo-500"}`}
                />
                <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Minimum 3 caractères</p>
              </div>
              <button
                type="submit"
                disabled={!newLocationName.trim() || newLocationName.trim().length < 3}
                className={`p-3 rounded-lg transition duration-200 flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${gradientButton}`}
              >
                <MdAdd className="text-xl" />
                <span className="ml-2">Ajouter Lieu</span>
              </button>
            </form>
          </div>

          {/* Bulk Actions */}
          <div className={`px-6 py-3 border-b flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {filteredLocations.length} {filteredLocations.length > 1 ? 'lieux trouvés' : 'lieu trouvé'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={expandAll}
                className={`px-3 py-1 text-xs border rounded-lg transition ${darkMode ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                Tout développer
              </button>
              <button
                onClick={collapseAll}
                className={`px-3 py-1 text-xs border rounded-lg transition ${darkMode ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                Tout réduire
              </button>
            </div>
          </div>

          {/* Locations List */}
          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {isLoading ? (
              <div className="p-6 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <LocationSkeleton key={i} />
                ))}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-8 text-center">
                <div className={`mx-auto h-24 w-24 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <MdLocationCity className="w-full h-full" />
                </div>
                <h3 className={`mt-2 text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-900"}`}>Aucun lieu trouvé</h3>
                <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par ajouter un nouveau lieu."}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <button
                      onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                      className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-800" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"}`}
                    >
                      <MdAdd className="-ml-1 mr-2 h-5 w-5" />
                      Ajouter un lieu
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div key={location.id} className={`p-6 transition ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                  {/* Location Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleLocation(location.id)}
                        className={`transition flex-shrink-0 ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        {expandedLocations[location.id] ? (
                          <MdExpandLess className="text-xl" />
                        ) : (
                          <MdExpandMore className="text-xl" />
                        )}
                      </button>
                      {editLocationId === location.id ? (
                        <div className="flex gap-3 items-center flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={editLocationName}
                              onChange={(e) => setEditLocationName(e.target.value)}
                              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-500 text-white" : "border-gray-300 focus:ring-indigo-500"}`}
                              autoFocus
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateLocation(location.id)}
                              disabled={!editLocationName.trim()}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Sauvegarder"
                            >
                              <MdSave className="text-xl" />
                            </button>
                            <button
                              onClick={() => setEditLocationId(null)}
                              className={`p-2 rounded-lg transition duration-200 ${darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Annuler"
                            >
                              <MdClose className="text-xl" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center min-w-0">
                          <MdRoom className={`mr-3 text-xl flex-shrink-0 ${darkMode ? "text-blue-400" : "text-indigo-500"}`} />
                          <h3 className={`text-lg font-medium truncate ${darkMode ? "text-gray-300" : "text-gray-800"}`} title={location.nom}>
                            {location.nom}
                          </h3>
                          {location.salles && location.salles.length > 0 && (
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}>
                              {location.salles.length} {location.salles.length > 1 ? 'salles' : 'salle'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {editLocationId !== location.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditLocationId(location.id);
                              setEditLocationName(location.nom);
                            }}
                            className={`p-2 rounded-lg transition duration-200 shadow-xs ${darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                            title="Modifier le lieu"
                          >
                            <MdEdit className="text-xl" />
                          </button>
                          <button
                            onClick={() =>
                              openDeleteLocationModal(location.id, location.nom)
                            }
                            className={`p-2 rounded-lg transition duration-200 shadow-xs ${darkMode ? "bg-gray-700 text-red-400 hover:bg-gray-600" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                            title="Supprimer le lieu"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Location Content (Animated) */}
                  <AnimatePresence>
                    {expandedLocations[location.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pl-10 sm:pl-12"
                      >
                        {/* Add Salle Form */}
                        {selectedLocationId === location.id ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`mb-6 p-4 rounded-lg border ${darkMode ? "bg-blue-900 bg-opacity-30 border-blue-800" : "bg-blue-50 border-blue-100"}`}
                          >
                            <h4 className={`text-sm font-semibold mb-3 flex items-center ${darkMode ? "text-blue-300" : "text-blue-800"}`}>
                              <MdAdd className="mr-2" /> Nouvelle salle pour {location.nom}
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                              <div className="flex-1 w-full">
                                <input
                                  type="text"
                                  value={newSalleName}
                                  onChange={(e) => setNewSalleName(e.target.value)}
                                  placeholder="Nom de la salle (ex: Salle de réunion A)"
                                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${darkMode ? "bg-gray-700 border-blue-800 focus:ring-blue-500 text-white" : "border-blue-200 focus:ring-blue-500 bg-white"}`}
                                  autoFocus
                                />
                                <p className={`mt-1 text-xs ${darkMode ? "text-blue-300" : "text-blue-600"}`}>Maximum 50 caractères</p>
                              </div>
                              <div className="flex space-x-2 w-full sm:w-auto">
                                <button
                                  onClick={() => handleCreateSalle(location.id)}
                                  disabled={!newSalleName.trim() || newSalleName.length > 50}
                                  className={`flex-1 sm:flex-none p-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                                >
                                  <MdCheck className="text-xl" />
                                  <span className="ml-2 hidden sm:inline">Confirmer</span>
                                </button>
                                <button
                                  onClick={() => setSelectedLocationId(null)}
                                  className={`flex-1 sm:flex-none p-3 rounded-lg transition duration-200 ${darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                >
                                  <MdClose className="text-xl" />
                                  <span className="ml-2 hidden sm:inline">Annuler</span>
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setSelectedLocationId(location.id)}
                            className={`mb-4 px-4 py-2 rounded-lg transition duration-200 flex items-center text-sm font-medium shadow-xs ${darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                          >
                            <MdAdd className="mr-2" />
                            Ajouter une salle
                          </button>
                        )}

                        {/* Salles List */}
                        {location.salles && location.salles.length > 0 ? (
                          <div className="mt-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className={darkMode ? "bg-gray-800" : "bg-gray-50"}>
                                  <tr>
                                    <th scope="col" className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                      Nom de la salle
                                    </th>
                                    <th scope="col" className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${darkMode ? "divide-gray-700 bg-gray-800" : "divide-gray-200 bg-white"}`}>
                                  {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                      <TableRowSkeleton key={i} />
                                    ))
                                  ) : (
                                    location.salles.map((salle) => (
                                      <tr key={salle.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                                        {editSalleId === salle.id ? (
                                          <td colSpan="2" className="px-4 py-3">
                                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                              <div className="flex-1 w-full">
                                                <input
                                                  type="text"
                                                  value={editSalleName}
                                                  onChange={(e) => setEditSalleName(e.target.value)}
                                                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-500 text-white" : "border-gray-300 focus:ring-indigo-500"}`}
                                                  autoFocus
                                                />
                                              </div>
                                              <div className="flex space-x-2 w-full sm:w-auto">
                                                <button
                                                  onClick={() => handleUpdateSalle(salle.id)}
                                                  disabled={!editSalleName.trim()}
                                                  className="flex-1 sm:flex-none p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                  title="Sauvegarder"
                                                >
                                                  <MdSave className="text-xl" />
                                                  <span className="ml-1 hidden sm:inline">Sauvegarder</span>
                                                </button>
                                                <button
                                                  onClick={() => setEditSalleId(null)}
                                                  className={`flex-1 sm:flex-none p-2 rounded-lg transition duration-200 ${darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                                  title="Annuler"
                                                >
                                                  <MdClose className="text-xl" />
                                                  <span className="ml-1 hidden sm:inline">Annuler</span>
                                                </button>
                                              </div>
                                            </div>
                                          </td>
                                        ) : (
                                          <>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                <MdCalendarToday className={`flex-shrink-0 h-5 w-5 mr-2 ${darkMode ? "text-gray-400" : "text-gray-400"}`} />
                                                <div className={`text-sm font-medium truncate max-w-xs ${darkMode ? "text-gray-300" : "text-gray-900"}`} title={salle.nom}>
                                                  {salle.nom}
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <div className="flex justify-end space-x-2">
                                                <button
                                                  onClick={() => {
                                                    setEditSalleId(salle.id);
                                                    setEditSalleName(salle.nom);
                                                  }}
                                                  className={`p-2 rounded-lg transition shadow-xs ${darkMode ? "text-blue-400 hover:text-blue-300 bg-gray-700 hover:bg-gray-600" : "text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100"}`}
                                                  title="Modifier"
                                                >
                                                  <MdEdit className="text-xl" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    openDeleteSalleModal(salle.id, salle.nom)
                                                  }
                                                  className={`p-2 rounded-lg transition shadow-xs ${darkMode ? "text-red-400 hover:text-red-300 bg-gray-700 hover:bg-gray-600" : "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"}`}
                                                  title="Supprimer"
                                                >
                                                  <MdDelete className="text-xl" />
                                                </button>
                                              </div>
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className={`mt-4 p-4 rounded-lg border text-center ${darkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
                            <p>Aucune salle disponible pour ce lieu</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-xl shadow-xl max-w-md w-full overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <div className="p-6">
                <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full ${darkMode ? "bg-red-900 bg-opacity-30" : "bg-red-100"}`}>
                  <MdDelete className={`text-3xl ${darkMode ? "text-red-400" : "text-red-600"}`} />
                </div>
                <h3 className={`mt-4 text-lg font-semibold text-center ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                  Confirmer la suppression
                </h3>
                <p className={`mt-2 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Êtes-vous sûr de vouloir supprimer {deleteItem.type === "location" ? "le lieu" : "la salle"} "
                  <span className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-900"}`}>{deleteItem.nom}</span>" ? Cette action est irréversible.
                </p>
                <div className="mt-6 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteItem(null);
                    }}
                    className={`px-6 py-2 border rounded-lg shadow-sm transition ${darkMode ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className={`px-6 py-2 rounded-lg transition flex items-center shadow-sm ${darkMode ? "bg-red-700 hover:bg-red-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                  >
                    <MdDelete className="mr-2" />
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LocationSalle;