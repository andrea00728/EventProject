import React, { useState, useEffect, useCallback, useRef } from "react";
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
  MdRefresh,
  MdFullscreen,
  MdFullscreenExit,
  MdCheckCircle,
  MdMap
} from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Définition de l'icône personnalisée
const customIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', // URL de l'image de l'icône
  iconSize: [25, 41], // Taille de l'icône
  iconAnchor: [12.5, 41], // Point d'ancrage de l'icône (la pointe)
  popupAnchor: [0, -41], // Point d'ancrage du popup pour qu'il soit au-dessus de l'icône
});

// Component to handle map click events
const MapClickHandler = ({ setGeocodeResult, setGeocodeResultText }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    const handleClick = async (e) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
        .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`)
        .openPopup();
      markerRef.current = marker;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
        );
        const data = await response.json();

        if (data.display_name) {
          setGeocodeResult({
            nom: data.display_name,
            latitude: lat,
            longitude: lng
          });
          setGeocodeResultText(`Lieu cliqué : ${data.display_name} (Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)})`);
        } else {
          setGeocodeResult({ nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
          setGeocodeResultText(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)} (Adresse non trouvée)`);
        }
      } catch (err) {
        console.error("Erreur reverse geocoding:", err);
        setGeocodeResult({ nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
        setGeocodeResultText(`Erreur lors du géocodage inversé (Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)})`);
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, setGeocodeResult, setGeocodeResultText]);

  return null;
};

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/locations`;

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [geocodeAddress, setGeocodeAddress] = useState("");
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeResultText, setGeocodeResultText] = useState("");
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showSaveConfirmationModal, setShowSaveConfirmationModal] = useState(false);
  const mapRef = useRef(null);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const response = await axios.get(API_URL);
      setLocations(response.data);
      setError(null);
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

  useEffect(() => {
    if (editingLocation && editingLocation.latitude != null && editingLocation.longitude != null) {
      setGeocodeAddress(editingLocation.nom);
      setGeocodeResult({
        nom: editingLocation.nom,
        latitude: parseFloat(editingLocation.latitude),
        longitude: parseFloat(editingLocation.longitude)
      });
      setGeocodeResultText(`Lieu actuel : ${editingLocation.nom} (Lat: ${editingLocation.latitude}, Lon: ${editingLocation.longitude})`);
    }
  }, [editingLocation]);

  // Recentrer la carte lorsque le modal de modification s'ouvre
  useEffect(() => {
    if (showAddModal && editingLocation && editingLocation.latitude != null && editingLocation.longitude != null && mapRef.current) {
      const lat = parseFloat(editingLocation.latitude);
      const lng = parseFloat(editingLocation.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 13);
      }
    }
  }, [showAddModal, editingLocation]);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.salles && location.salles.some(salle =>
        salle.nom.toLowerCase().includes(searchTerm.toLowerCase())));
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "withRooms") return matchesSearch && location.salles && location.salles.length > 0;
    if (activeTab === "withoutRooms") return matchesSearch && (!location.salles || location.salles.length === 0);
    return matchesSearch;
  });

  const toggleLocation = (id) => {
    setExpandedLocations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    locations.forEach(loc => {
      allExpanded[loc.id] = true;
    });
    setExpandedLocations(allExpanded);
  };

  const collapseAll = () => {
    setExpandedLocations({});
  };

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

  const handleGeocode = async () => {
    if (!geocodeAddress.trim()) {
      setGeocodeResultText("Veuillez entrer une adresse valide.");
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(geocodeAddress)}`);
      const data = await response.json();
      if (data.length > 0 && data[0].lat != null && data[0].lon != null) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setGeocodeResult({ nom: display_name, latitude, longitude });
        setGeocodeResultText(`Nom: ${display_name}, Latitude: ${lat}, Longitude: ${lon}`);
        if (mapRef.current && !isNaN(latitude) && !isNaN(longitude)) {
          mapRef.current.setView([latitude, longitude], 13);
        }
      } else {
        setGeocodeResult(null);
        setGeocodeResultText("Aucun résultat trouvé pour cette adresse.");
      }
    } catch (err) {
      setGeocodeResultText("Erreur lors du géocodage. Veuillez réessayer.");
      console.error("Geocode error:", err);
    }
  };

  const handleSave = async () => {
    if (!geocodeResult || geocodeResult.latitude == null || geocodeResult.longitude == null) return;
    if (editingLocation) {
      setShowEditConfirmationModal(true);
      return;
    }
    try {
      await axios.post(`${API_URL}/save`, {
        query: `${geocodeResult.nom}, ${geocodeResult.latitude}, ${geocodeResult.longitude}`
      });
      setGeocodeAddress("");
      setGeocodeResult(null);
      setGeocodeResultText("");
      await fetchLocations();
      setShowAddModal(false);
      setShowSaveConfirmationModal(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde de la localisation.");
      console.error("Save error:", err);
    }
  };

  const handleConfirmEdit = async () => {
    if (!geocodeResult || !editingLocation || geocodeResult.latitude == null || geocodeResult.longitude == null) return;
    try {
      await axios.put(`${API_URL}/geocode/${editingLocation.id}`, {
        query: `${geocodeResult.nom}, ${geocodeResult.latitude}, ${geocodeResult.longitude}`
      });
      setShowEditConfirmationModal(false);
      setShowAddModal(false);
      setEditingLocation(null);
      handleResetGeocode();
      await fetchLocations();
      setShowEditSuccessModal(true);
    } catch (err) {
      setError("Erreur lors de la modification du lieu.");
      console.error("Edit error:", err);
    }
  };

  const handleRefresh = async () => {
    await fetchLocations();
  };

  const handleEditInModal = async (id, currentNom) => {
    const newNom = prompt("Entrez le nouveau nom :", currentNom);
    if (newNom && newNom.trim() && newNom !== currentNom) {
      try {
        await axios.put(`${API_URL}/${id}`, { nom: newNom });
        await fetchLocations();
      } catch (err) {
        console.error("Edit error:", err);
      }
    }
  };

  const handleDeleteInModal = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        await fetchLocations();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleResetGeocode = () => {
    setGeocodeAddress("");
    setGeocodeResult(null);
    setGeocodeResultText("");
    setEditingLocation(null);
  };

  const openEditLocationWithMap = (location) => {
    setEditingLocation(location);
    setShowAddModal(true);
  };

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

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants = {
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    hidden: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
  };

  const gradientTitle = darkMode
    ? "bg-gradient-to-r from-blue-400 via-violet-400 to-purple-300 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";

  const gradientButton = darkMode
    ? "bg-gradient-to-r from-blue-600 via-violet-600 to-purple-500 text-white"
    : "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  return (
    <div className={`min-h-100vh ${darkMode ? "bg-gray-900 text-gray-200" : "bg-white text-gray-800"}`}>
      <div className={`h-full flex flex-col ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <div className={`shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className={`px-6 py-4 border-b ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-none"}`}>
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

          <div className={`p-6 border-b ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              <MdAdd className={`mr-2 ${darkMode ? "text-blue-400" : "text-indigo-600"}`} />
              Ajouter un nouveau lieu
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className={`p-3 rounded-lg transition duration-200 flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${gradientButton}`}
            >
              <MdAdd className="text-xl" />
              <span className="ml-2">Ajouter Lieu</span>
            </button>
          </div>

          <div className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            {isLoading ? (
              <div className="p-4 sm:p-6 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <LocationSkeleton key={i} />
                ))}
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <div className={`mx-auto h-20 w-20 sm:h-24 sm:w-24 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  <MdLocationCity className="w-full h-full" />
                </div>
                <h3 className={`mt-2 text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-900"}`}>Aucun lieu trouvé</h3>
                <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par ajouter un nouveau lieu."}
                </p>
                {!searchTerm && (
                  <div className="mt-4">
                    <button
                      onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                      className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-gray-800" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"}`}
                    >
                      <MdAdd className="-ml-1 mr-2 h-5 w-5" />
                      Ajouter un lieu
                    </button>
                  </div>
                )}
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div key={location.id} className={`p-4 sm:p-6 transition ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
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
                        <div className="flex gap-2 sm:gap-3 items-center flex-1 min-w-0 w-full">
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={editLocationName}
                              onChange={(e) => setEditLocationName(e.target.value)}
                              className={`w-full p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${darkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-500 text-white" : "border-gray-300 focus:ring-indigo-500"}`}
                              autoFocus
                            />
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => handleUpdateLocation(location.id)}
                              disabled={!editLocationName.trim()}
                              className="p-1 sm:p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Sauvegarder"
                            >
                              <MdSave className="text-lg sm:text-xl" />
                            </button>
                            <button
                              onClick={() => setEditLocationId(null)}
                              className={`p-1 sm:p-2 rounded-lg transition duration-200 ${darkMode ? "bg-gray-600 text-gray-300 hover:bg-gray-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                              title="Annuler"
                            >
                              <MdClose className="text-lg sm:text-xl" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center min-w-0 w-full">
                          <MdRoom className={`mr-1 sm:mr-3 text-lg sm:text-xl flex-shrink-0 ${darkMode ? "text-blue-400" : "text-indigo-500"}`} />
                          <h3 className={`text-base sm:text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-800"}`} title={location.nom}>
                            {location.nom}
                          </h3>
                          {location.salles && location.salles.length > 0 && (
                            <span className={`ml-1 sm:ml-3 inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}>
                              {location.salles.length} {location.salles.length > 1 ? 'salles' : 'salle'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                      {editLocationId !== location.id && (
                        <>
                          <button
                            onClick={() => openEditLocationWithMap(location)}
                            className={`p-1 sm:p-2 rounded-lg transition duration-200 shadow-xs ${darkMode ? "bg-gray-700 text-green-400 hover:bg-gray-600" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                            title="Modifier l'adresse avec la carte"
                          >
                            <MdMap className="text-lg sm:text-xl" />
                          </button>
                          <button
                            onClick={() => {
                              setEditLocationId(location.id);
                              setEditLocationName(location.nom);
                            }}
                            className={`p-1 sm:p-2 rounded-lg transition duration-200 shadow-xs ${darkMode ? "bg-gray-700 text-blue-400 hover:bg-gray-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                            title="Modifier le lieu"
                          >
                            <MdEdit className="text-lg sm:text-xl" />
                          </button>
                          <button
                            onClick={() => openDeleteLocationModal(location.id, location.nom)}
                            className={`p-1 sm:p-2 rounded-lg transition duration-200 shadow-xs ${darkMode ? "bg-gray-700 text-red-400 hover:bg-gray-600" : "bg-red-100 text-red-600 hover:bg-red-200"}`}
                            title="Supprimer le lieu"
                          >
                            <MdDelete className="text-lg sm:text-xl" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedLocations[location.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pl-10 sm:pl-12"
                      >
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

      <AnimatePresence>
        {showDeleteModal && deleteItem && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-50 bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full relative border transition-colors duration-300 ${darkMode
                ? "bg-gray-800 text-gray-100 border-gray-700"
                : "bg-white text-gray-900 border-gray-200"
                }`}
              variants={modalVariants}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
                className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? "dark:text-gray-400 dark:hover:text-gray-200" : ""}`}
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full transition-colors duration-300 ${darkMode ? "bg-red-900" : "bg-red-100"}`}>
                  <TbAlertTriangle className="text-red-500 text-5xl" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Confirmer la suppression
                </h2>
                <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
                  Êtes-vous sûr de vouloir supprimer {deleteItem.type === "location" ? "le lieu" : "la salle"} <span className={`font-extrabold transition-colors duration-300 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>"{deleteItem.nom}"</span> ? Cette action est <strong className="text-red-500">irréversible</strong>.
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteItem(null);
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center font-semibold transition-all duration-300 ${darkMode ? "bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-700/30" : "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30"}`}
                  >
                    <MdDelete className="mr-2 text-xl" />
                    Supprimer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveConfirmationModal && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-51 bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full relative border transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
              variants={modalVariants}
            >
              <button
                onClick={() => setShowSaveConfirmationModal(false)}
                className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? "dark:text-gray-400 dark:hover:text-gray-200" : ""}`}
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full transition-colors duration-300 ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                  <MdCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Lieu sauvegardé
                </h2>
                <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
                  Le lieu a été sauvegardé avec succès !
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-4">
                  <button
                    onClick={() => setShowSaveConfirmationModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveConfirmationModal(false);
                      setShowAddModal(true);
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center font-semibold transition-all duration-300 ${gradientButton}`}
                  >
                    <MdAdd className="mr-2 text-xl" />
                    Ajouter un autre lieu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditConfirmationModal && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-52 bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full relative border transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditConfirmationModal(false)}
                className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? "dark:text-gray-400 dark:hover:text-gray-200" : ""}`}
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full transition-colors duration-300 ${darkMode ? "bg-blue-900" : "bg-blue-100"}`}>
                  <TbAlertTriangle className="text-blue-500 text-5xl" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Confirmer la modification
                </h2>
                <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
                  Êtes-vous sûr de vouloir modifier le lieu <span className={`font-extrabold transition-colors duration-300 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>"{editingLocation?.nom}"</span> ?
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-4">
                  <button
                    onClick={() => setShowEditConfirmationModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmEdit}
                    className={`flex-1 px-6 py-3 rounded-xl flex items-center justify-center font-semibold transition-all duration-300 ${gradientButton}`}
                  >
                    <MdSave className="mr-2 text-xl" />
                    Confirmer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditSuccessModal && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-53 bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full relative border transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-200"}`}
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditSuccessModal(false)}
                className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? "dark:text-gray-400 dark:hover:text-gray-200" : ""}`}
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-4 p-3 rounded-full transition-colors duration-300 ${darkMode ? "bg-green-900" : "bg-green-100"}`}>
                  <MdCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                  Lieu modifié
                </h2>
                <p className={`transition-colors duration-300 ${darkMode ? "text-gray-400" : "text-gray-600"} mb-6`}>
                  Le lieu a été modifié avec succès !
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-4">
                  <button
                    onClick={() => setShowEditSuccessModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 flex justify-center items-center z-50 bg-black/70 p-4 sm:p-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className={`rounded-2xl shadow-2xl p-6 sm:p-8 relative border transition-colors duration-300 ${isModalFullScreen ? 'fixed inset-0 rounded-none overflow-y-auto' : 'max-w-4xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto'} ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
              variants={modalVariants}
            >
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsModalFullScreen(!isModalFullScreen)}
                  className={`text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? 'dark:text-gray-400 dark:hover:text-gray-200' : ''}`}
                >
                  {isModalFullScreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    handleResetGeocode();
                  }}
                  className={`text-gray-500 hover:text-gray-700 transition-colors ${darkMode ? 'dark:text-gray-400 dark:hover:text-gray-200' : ''}`}
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="flex flex-col space-y-4">
                <h2 className={`text-2xl font-bold ${gradientTitle}`}>
                  {editingLocation ? 'Modifier le lieu' : 'Chercher un lieu'}
                </h2>
                <input
                  type="text"
                  value={geocodeAddress}
                  onChange={(e) => setGeocodeAddress(e.target.value)}
                  placeholder="Entrez l'adresse ou cliquez sur la carte"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition ${darkMode ? 'bg-gray-700 border-gray-600 focus:ring-blue-500 text-white' : 'border-gray-300 focus:ring-indigo-500'}`}
                />
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button onClick={handleGeocode} className={`p-3 rounded-lg flex-1 ${gradientButton}`}>
                    Chercher
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!geocodeResult || geocodeResult.latitude == null || geocodeResult.longitude == null}
                    className={`p-3 rounded-lg flex-1 disabled:opacity-50 ${gradientButton}`}
                  >
                    {editingLocation ? 'Modifier' : 'Sauvegarder'}
                  </button>
                  <button onClick={handleResetGeocode} className={`p-3 rounded-lg flex-1 ${gradientButton}`}>
                    Réinitialiser
                  </button>
                </div>
                <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                  Résultat : {geocodeResultText || 'Aucun résultat pour le moment.'}
                </div>
                <div className="h-[40vh] sm:h-[50vh] max-h-[400px] rounded-lg overflow-hidden">
                  <MapContainer
                    center={
                      geocodeResult && geocodeResult.latitude != null && geocodeResult.longitude != null
                        ? [geocodeResult.latitude, geocodeResult.longitude]
                        : editingLocation && editingLocation.latitude != null && editingLocation.longitude != null
                        ? [parseFloat(editingLocation.latitude), parseFloat(editingLocation.longitude)]
                        : [48.8566, 2.3522]
                    }
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    // className={darkMode ? 'leaflet-dark' : ''}
                    ref={mapRef}
                  >
                    <TileLayer
                      // url={darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler
                      setGeocodeResult={setGeocodeResult}
                      setGeocodeResultText={setGeocodeResultText}
                    />
                    {geocodeResult && geocodeResult.latitude != null && geocodeResult.longitude != null && (
                      <Marker position={[geocodeResult.latitude, geocodeResult.longitude]} icon={customIcon}>
                        <Popup>{geocodeResult.nom}</Popup>
                      </Marker>
                    )}
                    {editingLocation && !geocodeResult && editingLocation.latitude != null && editingLocation.longitude != null && (
                      <Marker position={[parseFloat(editingLocation.latitude), parseFloat(editingLocation.longitude)]} icon={customIcon}>
                        <Popup>{editingLocation.nom}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
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