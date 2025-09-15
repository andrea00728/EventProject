// src/components/Evenementform.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  createEvent,
  getSallesByLocation,
  saveLocation,
  createSalle,
  getLocationsByCreator,
  getLocationsByCreatorAndAdmin,
} from "../services/evenementServ";
import { textControll } from "../services/controll_champs/controll_champs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { useStateContext } from "../context/ContextProvider";
import axios from "axios";
import {
  MdLocationCity,
  MdRoom,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSave,
  MdClose,
  MdCheckCircle,
  MdFullscreen,
  MdFullscreenExit,
  MdExpandMore,
  MdExpandLess,
  MdImage,
} from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Liste des types et thèmes d'événements
const EVENT_TYPES = [
  { value: "mariage", label: "Mariage" },
  { value: "reunion", label: "Réunion" },
  { value: "anniversaire", label: "Anniversaire" },
  { value: "engagement", label: "Engagement" },
  { value: "fiançailles", label: "Fiançailles" },
  { value: "bapteme", label: "Baptême" },
  { value: "communion", label: "Communion" },
  { value: "confirmation", label: "Confirmation" },
  { value: "bar_mitsva", label: "Bar Mitsva" },
  { value: "reunion_famille", label: "Réunion de famille" },
  { value: "conference", label: "Conférence" },
  { value: "seminaire", label: "Séminaire" },
  { value: "formation", label: "Formation" },
  { value: "team_building", label: "Team Building" },
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "gala", label: "Gala" },
  { value: "banquet", label: "Banquet" },
  { value: "degustation", label: "Dégustation" },
  { value: "inauguration", label: "Inauguration" },
  { value: "exposition", label: "Exposition" },
  { value: "foire", label: "Foire" },
  { value: "competition", label: "Compétition" },
  { value: "match", label: "Match" },
  { value: "tournoi", label: "Tournoi" },
  { value: "remise_diplome", label: "Remise de diplôme" },
  { value: "soiree", label: "Soirée" },
  { value: "enterrement_vie_garcon", label: "Enterrement de vie de garçon" },
  { value: "enterrement_vie_fille", label: "Enterrement de vie de jeune fille" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "gender_reveal", label: "Gender Reveal" },
  { value: "funerailles", label: "Funérailles" },
  { value: "religieux", label: "Religieux" },
  { value: "culturel", label: "Culturel" },
  { value: "caritatif", label: "Caritatif" },
  { value: "politique", label: "Politique" },
  { value: "autre", label: "Autre" },
];

const EVENT_THEMES = [
  { value: "classique", label: "Classique" },
  { value: "vintage", label: "Vintage" },
  { value: "boheme", label: "Bohème" },
  { value: "moderne", label: "Moderne" },
  { value: "rustique", label: "Rustique" },
  { value: "glamour", label: "Glamour" },
  { value: "nature", label: "Nature" },
  { value: "plage", label: "Plage" },
  { value: "urbain", label: "Urbain" },
  { value: "retro", label: "Rétro" },
  { value: "futuriste", label: "Futuriste" },
  { value: "minimaliste", label: "Minimaliste" },
  { value: "luxueux", label: "Luxueux" },
  { value: "romantique", label: "Romantique" },
  { value: "fantaisie", label: "Fantaisie" },
  { value: "culturel", label: "Culturel" },
  { value: "sportif", label: "Sportif" },
  { value: "cinema", label: "Cinéma" },
  { value: "musique", label: "Musique" },
  { value: "histoire", label: "Histoire" },
  { value: "technologie", label: "Technologie" },
  { value: "gastronomique", label: "Gastronomique" },
  { value: "ecologique", label: "Écologique" },
  { value: "festif", label: "Festif" },
  { value: "autre", label: "Autre" },
];

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
    padding: "0.25rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#818cf8",
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.75rem",
    marginTop: "0.25rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#818cf8" : state.isFocused ? "#e0e7ff" : "white",
    color: state.isSelected ? "white" : "#1f2937",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#e0e7ff",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const gradientButton = `bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600`;
const gradientTitle = `bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent`;

export default function Evenementform({ onNext, isPublic, isExit }) {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    theme: "",
    date: "",
    date_fin: "",
    locationId: "",
    salleId: "",
    isPublic: isPublic || false,
    image: null, // Champ pour l'image
  });

  const [customType, setCustomType] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [locations, setLocations] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalLieuOpen, setModalLieuOpen] = useState(false);
  const [searchLieu, setSearchLieu] = useState("");
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // Aperçu de l'image
  const mapRef = useRef(null);
  const [activeTab, setActiveTab] = useState('default');
  const [newLocation, setNewLocation] = useState({ nom: '', latitude: '', longitude: '', createurId: 0 });
  const [customMarker, setCustomMarker] = useState(null);
  const [geocodeAddress, setGeocodeAddress] = useState("");
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeResultText, setGeocodeResultText] = useState("");
  const markerRef = useRef(null);
  const { isAuthenticated, user } = useStateContext();
  const [isAddingSalle, setIsAddingSalle] = useState(false);
  const [newSalleName, setNewSalleName] = useState("");
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingSalle, setEditingSalle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [showEditConfirmationModal, setShowEditConfirmationModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showEditSalleConfirmationModal, setShowEditSalleConfirmationModal] = useState(false);
  const [showEditSalleSuccessModal, setShowEditSalleSuccessModal] = useState(false);
  const [isModalFullScreen, setIsModalFullScreen] = useState(false);
  const [selectedLocationSalles, setSelectedLocationSalles] = useState([]);
  const [selectedLocationForSalles, setSelectedLocationForSalles] = useState(null);
  const [expandedLocationId, setExpandedLocationId] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/locations`;

  // Gestion du changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérification du type de fichier
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        setError("Seules les images (JPG, PNG, GIF) sont autorisées.");
        toast.error("Seules les images (JPG, PNG, GIF) sont autorisées.");
        return;
      }
      // Vérification de la taille du fichier (5 Mo maximum)
      if (file.size > 5 * 1024 * 1024) {
        setError("La taille de l'image ne doit pas dépasser 5 Mo.");
        toast.error("La taille de l'image ne doit pas dépasser 5 Mo.");
        return;
      }
      setForm({ ...form, image: file });
      // Générer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, image: null });
      setImagePreview(null);
    }
  };

  // Effets secondaires
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const createurId = isAuthenticated && (user?.id || user?.sub) ? (user.id || user.sub) : '0';
        const data = await getLocationsByCreatorAndAdmin(createurId);
        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        setLocations([]);
      }
    };
    fetchLocations();
    return () => {
      setImagePreview(null); // Nettoyage de l'aperçu
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        if (isAuthenticated && (user?.id || user?.sub)) {
          const data = await getLocationsByCreator(user.id || user.sub);
          setUserLocations(Array.isArray(data) ? data : []);
        } else {
          setUserLocations([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des lieux utilisateur:', error);
        setUserLocations([]);
      }
    };
    fetchUserLocations();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (form.locationId) {
      getSallesByLocation(form.locationId)
        .then(setSalles)
        .catch(() => setSalles([]));
    } else {
      setSalles([]);
      setForm((prev) => ({ ...prev, salleId: "" }));
    }
  }, [form.locationId]);

  useEffect(() => {
    if (editingLocation && editingLocation.latitude && editingLocation.longitude && mapRef.current) {
      const lat = parseFloat(editingLocation.latitude);
      const lng = parseFloat(editingLocation.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 13);
      }
      setGeocodeAddress(editingLocation.nom);
      setGeocodeResult({
        nom: editingLocation.nom,
        latitude: lat,
        longitude: lng,
      });
      setGeocodeResultText(`Lieu actuel : ${editingLocation.nom} (Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)})`);
    }
  }, [editingLocation]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleCreateSalle = async () => {
    if (!newSalleName.trim()) {
      setError("Le nom de la salle est requis");
      toast.error("Le nom de la salle est requis");
      return;
    }
    try {
      await createSalle(form.locationId, { nom: newSalleName });
      setNewSalleName("");
      setIsAddingSalle(false);
      const updatedSalles = await getSallesByLocation(form.locationId);
      setSalles(updatedSalles);
      toast.success("Salle créée avec succès !");
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la création de la salle";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEditSalle = async () => {
    if (!newSalleName.trim()) {
      setError("Le nom de la salle est requis");
      toast.error("Le nom de la salle est requis");
      return;
    }
    try {
      await axios.put(`${API_URL}/salles/${editingSalle.id}`, { nom: newSalleName });
      setNewSalleName("");
      setEditingSalle(null);
      setShowEditSalleConfirmationModal(false);
      setShowEditSalleSuccessModal(true);
      const updatedSalles = await getSallesByLocation(selectedLocationForSalles);
      setSelectedLocationSalles(updatedSalles || []);
      toast.success("Salle modifiée avec succès !");
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la modification de la salle";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const dateDebut = new Date(form.date);
    const dateFin = new Date(form.date_fin);

    // Validations
    if (!form.nom.trim()) {
      setError("Le nom de l'événement est requis.");
      toast.error("Le nom de l'événement est requis.");
      return;
    }
    if (!form.type) {
      setError("Le type d'événement est requis.");
      toast.error("Le type d'événement est requis.");
      return;
    }
    if (form.type === "autre" && !customType.trim()) {
      setError("Veuillez spécifier un type d'événement personnalisé.");
      toast.error("Veuillez spécifier un type d'événement personnalisé.");
      return;
    }
    if (!form.theme) {
      setError("Le thème de l'événement est requis.");
      toast.error("Le thème de l'événement est requis.");
      return;
    }
    if (form.theme === "autre" && !customTheme.trim()) {
      setError("Veuillez spécifier un thème personnalisé.");
      toast.error("Veuillez spécifier un thème personnalisé.");
      return;
    }
    if (!form.date) {
      setError("La date de début est requise.");
      toast.error("La date de début est requise.");
      return;
    }
    if (!form.date_fin) {
      setError("La date de fin est requise.");
      toast.error("La date de fin est requise.");
      return;
    }
    if (dateDebut < now) {
      setError("La date de début doit être aujourd'hui ou dans le futur.");
      toast.error("La date de début doit être aujourd'hui ou dans le futur.");
      return;
    }
    if (dateFin < now) {
      setError("La date de fin doit être aujourd'hui ou dans le futur.");
      toast.error("La date de fin doit être aujourd'hui ou dans le futur.");
      return;
    }
    if (dateDebut >= dateFin) {
      setError("La date de fin doit être après la date de début.");
      toast.error("La date de fin doit être après la date de début.");
      return;
    }
    if (!form.locationId) {
      setError("Le lieu est requis.");
      toast.error("Le lieu est requis.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("utilisateur_id", user.id || user.sub);
      formData.append("nom", form.nom);
      formData.append("type", form.type === "autre" ? customType : form.type);
      formData.append("theme", form.theme === "autre" ? customTheme : form.theme);
      formData.append("date", form.date);
      formData.append("date_fin", form.date_fin);
      formData.append("locationId", form.locationId);
      formData.append("salleId", form.salleId || "");
      formData.append("isPublic", form.isPublic.toString());
      if (form.image) {
        formData.append("image", form.image);
      }

      const event = await createEvent(formData);
      toast.success("Événement créé avec succès !");
      setForm({
        nom: "",
        type: "",
        theme: "",
        date: "",
        date_fin: "",
        locationId: "",
        salleId: "",
        isPublic: false,
        image: null,
      });
      setCustomType("");
      setCustomTheme("");
      setImagePreview(null);
      onNext && onNext({ eventId: event.id });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Erreur lors de la création de l'événement.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const selectedSalleName = () => salles.find((s) => s.id === form.salleId)?.nom || "";
  const selectedLocationName = () => locations.find((l) => l.id === form.locationId)?.nom || "";

  const filteredLocations = locations.filter((loc) =>
    loc.nom.toLowerCase().includes(searchLieu.toLowerCase())
  );
  const filteredUserLocations = userLocations.filter((loc) =>
    loc.nom.toLowerCase().includes(searchLieu.toLowerCase())
  );

  const handleSelectLieu = async (loc) => {
    setSelectedLieu(loc);
    setSelectedLocationForSalles(loc.id);
    if (mapRef.current && loc.latitude && loc.longitude) {
      mapRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 13);
    }
    try {
      const salles = await getSallesByLocation(loc.id);
      setSelectedLocationSalles(salles || []);
    } catch (error) {
      console.error("Erreur lors du chargement des salles:", error);
      setSelectedLocationSalles([]);
      toast.error("Erreur lors du chargement des salles");
    }
  };

  const handleGeocode = async () => {
    if (!geocodeAddress.trim()) {
      setGeocodeResultText("Veuillez entrer une adresse valide.");
      toast.error("Veuillez entrer une adresse valide.");
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(geocodeAddress)}`
      );
      const data = await response.json();
      if (data.length > 0 && data[0].lat != null && data[0].lon != null) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setGeocodeResult({ nom: display_name, latitude, longitude });
        setGeocodeResultText(`Nom: ${display_name}, Latitude: ${lat}, Longitude: ${lon}`);
        setNewLocation({ ...newLocation, nom: display_name, latitude, longitude });
        setCustomMarker({ lat: latitude, lng: longitude });
        if (mapRef.current && !isNaN(latitude) && !isNaN(longitude)) {
          mapRef.current.setView([latitude, longitude], 13);
        }
      } else {
        setGeocodeResult(null);
        setGeocodeResultText("Aucun résultat trouvé pour cette adresse.");
        toast.error("Aucun résultat trouvé pour cette adresse.");
      }
    } catch (err) {
      setGeocodeResultText("Erreur lors du géocodage. Veuillez réessayer.");
      toast.error("Erreur lors du géocodage. Veuillez réessayer.");
      console.error("Geocode error:", err);
    }
  };

  const handleResetGeocode = () => {
    setGeocodeAddress("");
    setGeocodeResult(null);
    setGeocodeResultText("");
    setCustomMarker(null);
    setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
    setEditingLocation(null);
    setEditingSalle(null);
    setSelectedLocationSalles([]);
    setSelectedLocationForSalles(null);
    setExpandedLocationId(null);
    if (mapRef.current) {
      mapRef.current.setView([48.8566, 2.3522], 13);
    }
  };

  const handleConfirmLieu = () => {
    if (activeTab === 'default') {
      if (selectedLieu) {
        setForm({ ...form, locationId: selectedLieu.id, salleId: "" });
        setModalLieuOpen(false);
        setSelectedLieu(null);
        setSearchLieu("");
      }
    } else {
      if (newLocation.nom && newLocation.latitude && newLocation.longitude) {
        const query = newLocation.nom;
        const createurId = isAuthenticated && (user.id || user.sub);
        saveLocation(query, createurId)
          .then((createdLoc) => {
            setLocations([...locations, createdLoc]);
            setUserLocations([...userLocations, createdLoc]);
            setForm({ ...form, locationId: createdLoc.id, salleId: "" });
            setModalLieuOpen(false);
            setCustomMarker(null);
            setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
            setGeocodeAddress("");
            setGeocodeResult(null);
            setGeocodeResultText("");
            setSelectedLocationSalles([]);
            setSelectedLocationForSalles(null);
            toast.success("Nouveau lieu créé avec succès !");
          })
          .catch((error) => {
            const errorMessage = error.response?.data?.message || "Erreur lors de la création du lieu.";
            setError(errorMessage);
            toast.error(errorMessage);
          });
      } else {
        setError("Veuillez remplir le nom et sélectionner un point sur la carte.");
        toast.error("Veuillez remplir le nom et sélectionner un point sur la carte.");
      }
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setModalLieuOpen(true);
    setActiveTab('specify');
    setSearchLieu('');
    setSelectedLocationSalles([]);
    setSelectedLocationForSalles(null);
    setExpandedLocationId(null);
  };

  const handleConfirmEdit = async () => {
    if (!geocodeResult || !editingLocation) return;
    try {
      await axios.put(`${API_URL}/${editingLocation.id}`, {
        nom: geocodeResult.nom,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
      });
      setShowEditConfirmationModal(false);
      setShowEditSuccessModal(true);
      setEditingLocation(null);
      const userData = await getLocationsByCreator(user.id || user.sub);
      setUserLocations(Array.isArray(userData) ? userData : []);
      const adminData = await getLocationsByCreatorAndAdmin(user.id || user.sub);
      setLocations(Array.isArray(adminData) ? adminData : []);
      setSelectedLocationSalles([]);
      setSelectedLocationForSalles(null);
      setExpandedLocationId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification du lieu");
      toast.error(err.response?.data?.message || "Erreur lors de la modification du lieu");
    }
  };

  const openDeleteLocationModal = (loc) => {
    setDeleteItem({ type: "location", id: loc.id, nom: loc.nom });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === "location") {
        await axios.delete(`${API_URL}/${deleteItem.id}`);
        setUserLocations(userLocations.filter((loc) => loc.id !== deleteItem.id));
        setLocations(locations.filter((loc) => loc.id !== deleteItem.id));
        setSelectedLocationSalles([]);
        setSelectedLocationForSalles(null);
        toast.success("Lieu supprimé avec succès !");
      } else if (deleteItem.type === "salle") {
        await axios.delete(`${API_URL}/salles/${deleteItem.id}`);
        const updatedSalles = await getSallesByLocation(selectedLocationForSalles);
        setSelectedLocationSalles(updatedSalles || []);
        toast.success("Salle supprimée avec succès !");
      }
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const toggleLocationDropdown = async (locId) => {
    if (expandedLocationId === locId) {
      setExpandedLocationId(null);
      setSelectedLocationSalles([]);
      setSelectedLocationForSalles(null);
      setEditingSalle(null);
      setIsAddingSalle(false);
      setNewSalleName("");
    } else {
      setExpandedLocationId(locId);
      setSelectedLocationForSalles(locId);
      try {
        const salles = await getSallesByLocation(locId);
        setSelectedLocationSalles(salles || []);
      } catch (error) {
        console.error("Erreur lors du chargement des salles:", error);
        setSelectedLocationSalles([]);
        toast.error("Erreur lors du chargement des salles");
      }
    }
  };

  const handleAddSalleClick = (locId) => {
    setSelectedLocationForSalles(locId);
    setIsAddingSalle(true);
    setEditingSalle(null);
    setNewSalleName("");
  };

  const handleEditSalleClick = (salle) => {
    setEditingSalle(salle);
    setNewSalleName(salle.nom);
    setIsAddingSalle(false);
  };

  const isAdminLocation = (loc) => {
    if (!loc.createur || loc.createur.id == null) {
      return true;
    }
    return false;
  };

  const MapClickHandler = () => {
    const map = useMap();
    useEffect(() => {
      const handleClick = async (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }
        const marker = L.marker([lat, lng], { icon: blueIcon }).addTo(map)
          .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`)
          .openPopup();
        markerRef.current = marker;
        setCustomMarker({ lat, lng });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
          );
          const data = await response.json();
          if (data.display_name) {
            setGeocodeResult({ nom: data.display_name, latitude: lat, longitude: lng });
            setGeocodeResultText(`Lieu cliqué : ${data.display_name} (Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)})`);
            setNewLocation({ ...newLocation, nom: data.display_name, latitude: lat, longitude: lng });
          } else {
            setGeocodeResult({ nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
            setGeocodeResultText(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)} (Adresse non trouvée)`);
            setNewLocation({ ...newLocation, nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
          }
        } catch (err) {
          console.error("Erreur reverse geocoding:", err);
          setGeocodeResult({ nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
          setGeocodeResultText(`Erreur lors du géocodage inversé (Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)})`);
          setNewLocation({ ...newLocation, nom: `Lat: ${lat}, Lon: ${lng}`, latitude: lat, longitude: lng });
        }
      };
      if (activeTab === 'specify') {
        map.on("click", handleClick);
      }
      return () => {
        map.off("click", handleClick);
        if (markerRef.current) {
          map.off("click", handleClick);
          markerRef.current = null;
        }
      };
    }, [map]);
    return null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">
          Créer un événement
        </h2>
        <p className="text-center text-gray-500 mb-6 sm:mb-8">
          Décrivez votre événement pour commencer l'organisation.
        </p>
        {error && (
          <div className="flex items-center justify-center mb-4 text-red-500">
            <TbAlertTriangle className="mr-2" />
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Nom de l'événement</label>
            <input
              name="nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: textControll(e.target.value) })}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Type d'événement</label>
            <Select
              options={EVENT_TYPES}
              value={EVENT_TYPES.find((t) => t.value === form.type) || null}
              onChange={(selected) => handleChange({ target: { name: "type", value: selected?.value || "" } })}
              placeholder="Sélectionnez un type"
              styles={customStyles}
              isSearchable
            />
            {form.type === "autre" && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Entrez votre type d'événement"
                required
                className="mt-2 border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Thème</label>
            <Select
              options={EVENT_THEMES}
              value={EVENT_THEMES.find((t) => t.value === form.theme) || null}
              onChange={(selected) => handleChange({ target: { name: "theme", value: selected?.value || "" } })}
              placeholder="Sélectionnez un thème"
              styles={customStyles}
              isSearchable
            />
            {form.theme === "autre" && (
              <input
                type="text"
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Entrez votre thème"
                required
                className="mt-2 border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Date de début</label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Date de fin</label>
            <input
              type="datetime-local"
              name="date_fin"
              value={form.date_fin}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Lieu</label>
            <input
              type="text"
              value={selectedLocationName()}
              readOnly
              onClick={() => setModalLieuOpen(true)}
              placeholder="Sélectionnez un lieu"
              required
              className="border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 cursor-pointer focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Salle</label>
            <input
              type="text"
              value={selectedSalleName()}
              readOnly
              disabled={!form.locationId}
              onClick={() => form.locationId && setModalSalleOpen(true)}
              placeholder="Sélectionnez une salle"
              className={`border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 text-gray-900 placeholder-gray-400 transition ${
                form.locationId ? "cursor-pointer bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" : "bg-gray-200 cursor-not-allowed"
              }`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Image de l'événement</label>
            <div className="relative w-full h-48 sm:h-64 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Aperçu de l'image"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    onClick={() => document.getElementById("image-upload").click()}
                  >
                    <MdEdit size={20} />
                  </button>
                </>
              ) : (
      <div className="flex flex-col items-center justify-center text-gray-400">
        <MdImage size={40} />
        <p className="mt-2 text-sm">Aucune image sélectionnée</p>
        <button
          type="button"
          className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          onClick={() => document.getElementById("image-upload").click()}
        >
          Ajouter une image
        </button>
      </div>
    )}
    <input
      id="image-upload"
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="hidden"
    />
  </div>
  <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, GIF (max 5 Mo)</p>
</div>
          <div className="col-span-1 sm:col-span-2 mt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition"
            >
              Créer l'événement
            </button>
            <button
              type="button"
              onClick={() => isExit()}
              className="w-full bg-gray-300 text-gray-700 font-bold py-3 rounded-xl shadow hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>

      {/* Modal Salle */}
      {modalSalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
            <button
              className="absolute top-4 right-4 text-2xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => {
                setModalSalleOpen(false);
                setIsAddingSalle(false);
                setNewSalleName("");
                setError(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-indigo-700">
              Choisissez une salle
            </h3>
            {isAddingSalle ? (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={newSalleName}
                  onChange={(e) => setNewSalleName(e.target.value)}
                  placeholder="Nom de la nouvelle salle"
                  className="border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateSalle}
                    className="flex-1 bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingSalle(false);
                      setNewSalleName("");
                      setError(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 font-bold py-3 rounded-xl shadow hover:bg-gray-400 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {salles.length > 0 ? (
                  salles.map((salle) => (
                    <div
                      key={salle.id}
                      onClick={() => {
                        setForm({ ...form, salleId: salle.id });
                        setModalSalleOpen(false);
                      }}
                      className="border-2 border-indigo-100 rounded-xl px-4 py-3 text-center bg-indigo-50 text-indigo-800 cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 font-semibold transition"
                    >
                      {salle.nom}
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500">
                    Aucune salle disponible pour ce lieu
                  </div>
                )}
                {form.locationId && !isAdminLocation(locations.find((loc) => loc.id === form.locationId)) && (
                  <div
                    onClick={() => setIsAddingSalle(true)}
                    className="border-2 border-indigo-100 rounded-xl px-4 py-3 text-center bg-indigo-50 text-indigo-800 cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 font-semibold transition"
                  >
                    Ajouter une salle
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Lieu */}
      {modalLieuOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className={`rounded-2xl shadow-2xl p-4 sm:p-6 relative border border-gray-200 bg-gray-50 ${
              isModalFullScreen ? 'fixed inset-0 rounded-none overflow-y-auto' : 'w-full max-w-5xl max-h-[90vh] overflow-y-auto'
            }`}
            variants={modalVariants}
          >
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={() => setIsModalFullScreen(!isModalFullScreen)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isModalFullScreen ? <MdFullscreenExit size={24} /> : <MdFullscreen size={24} />}
              </button>
              <button
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => {
                  setModalLieuOpen(false);
                  setSearchLieu("");
                  setSelectedLieu(null);
                  setCustomMarker(null);
                  setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
                  setActiveTab('default');
                  setGeocodeAddress("");
                  setGeocodeResult(null);
                  setGeocodeResultText("");
                  setEditingLocation(null);
                  setEditingSalle(null);
                  setSelectedLocationSalles([]);
                  setSelectedLocationForSalles(null);
                  setExpandedLocationId(null);
                }}
              >
                <MdClose size={24} />
              </button>
            </div>
            <h3 className={`text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 ${gradientTitle}`}>
              Choisissez un lieu
            </h3>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-1/2 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('default');
                      setCustomMarker(null);
                      setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
                      setGeocodeAddress("");
                      setGeocodeResult(null);
                      setGeocodeResultText("");
                      setEditingLocation(null);
                      setEditingSalle(null);
                      setSelectedLocationSalles([]);
                      setSelectedLocationForSalles(null);
                      setExpandedLocationId(null);
                    }}
                    className={`flex-1 py-2 rounded-xl font-semibold transition ${
                      activeTab === 'default' ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    Par défaut
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('specify');
                      setSelectedLieu(null);
                      setSearchLieu('');
                      setEditingLocation(null);
                      setEditingSalle(null);
                      setSelectedLocationSalles([]);
                      setSelectedLocationForSalles(null);
                      setExpandedLocationId(null);
                    }}
                    className={`flex-1 py-2 rounded-xl font-semibold transition ${
                      activeTab === 'specify' ? 'bg-indigo-700 text-white hover:bg-indigo-800' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    Spécifier le lieu
                  </button>
                </div>
                {activeTab === 'default' ? (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchLieu}
                        onChange={(e) => setSearchLieu(e.target.value)}
                        placeholder="Rechercher un lieu..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                      />
                    </div>
                    <div className="max-h-60 sm:max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <div
                            key={loc.id}
                            onClick={() => handleSelectLieu(loc)}
                            className={`px-4 py-3 cursor-pointer border-b border-gray-200 hover:bg-indigo-100 ${
                              selectedLieu?.id === loc.id ? "bg-indigo-50" : ""
                            }`}
                          >
                            {loc.nom.split(",").slice(0, 2).join(", ") || "Non précisé"}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Aucun lieu trouvé
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleConfirmLieu}
                        disabled={!selectedLieu}
                        className="flex-1 bg-indigo-700 text-white font-bold py-2 sm:py-3 rounded-xl shadow hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => {
                          setModalLieuOpen(false);
                          setSearchLieu("");
                          setSelectedLieu(null);
                          setCustomMarker(null);
                          setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
                          setActiveTab('default');
                          setGeocodeAddress("");
                          setGeocodeResult(null);
                          setGeocodeResultText("");
                          setEditingLocation(null);
                          setEditingSalle(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 sm:py-3 rounded-xl shadow hover:bg-gray-300 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-4">
                      <input
                        type="text"
                        value={geocodeAddress}
                        onChange={(e) => setGeocodeAddress(e.target.value)}
                        placeholder="Entrez une adresse à rechercher"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 sm:px-5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={handleGeocode}
                          className={`flex-1 p-2 sm:p-3 rounded-lg ${gradientButton}`}
                        >
                          Rechercher
                        </button>
                        <button
                          onClick={editingLocation ? () => setShowEditConfirmationModal(true) : handleConfirmLieu}
                          disabled={editingLocation ? !geocodeResult : (!newLocation.nom || !newLocation.latitude)}
                          className={`flex-1 p-2 sm:p-3 rounded-lg disabled:opacity-50 ${gradientButton}`}
                        >
                          {editingLocation ? 'Modifier' : 'Sauvegarder'}
                        </button>
                        <button
                          onClick={handleResetGeocode}
                          className={`flex-1 p-2 sm:p-3 rounded-lg ${gradientButton}`}
                        >
                          Réinitialiser
                        </button>
                      </div>
                      <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-800">
                        Résultat : {geocodeResultText || 'Aucun résultat pour le moment.'}
                      </div>
                      <div className="max-h-60 sm:max-h-80 overflow-y-auto border border-gray-200 rounded-xl">
                        {filteredUserLocations.length > 0 ? (
                          filteredUserLocations.map((loc) => (
                            <div key={loc.id} className="border-b border-gray-200">
                              <div
                                className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-indigo-100 ${
                                  expandedLocationId === loc.id ? "bg-indigo-50" : ""
                                }`}
                                onClick={() => toggleLocationDropdown(loc.id)}
                              >
                                <div className="flex-1">
                                  {loc.nom.split(",").slice(0, 2).join(", ") || "Non précisé"}
                                </div>
                                <div className="flex gap-2 items-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditLocation(loc);
                                    }}
                                    className="p-1 text-blue-500 hover:text-blue-700"
                                    title="Modifier"
                                  >
                                    <MdEdit size={20} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteLocationModal(loc);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700"
                                    title="Supprimer"
                                  >
                                    <MdDelete size={20} />
                                  </button>
                                  {expandedLocationId === loc.id ? (
                                    <MdExpandLess size={20} />
                                  ) : (
                                    <MdExpandMore size={20} />
                                  )}
                                </div>
                              </div>
                              {expandedLocationId === loc.id && (
                                <div className="px-4 py-3 bg-indigo-50">
                                  <h4 className="text-sm font-semibold text-indigo-700 mb-2">
                                    Salles associées à {loc.nom.split(",").slice(0, 2).join(", ") || "ce lieu"}
                                  </h4>
                                  {selectedLocationSalles.length > 0 ? (
                                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                                      {selectedLocationSalles.map((salle) => (
                                        <li
                                          key={salle.id}
                                          className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-gray-800 flex justify-between items-center"
                                        >
                                          {editingSalle && editingSalle.id === salle.id ? (
                                            <div className="w-full flex flex-col gap-2">
                                              <input
                                                type="text"
                                                value={newSalleName}
                                                onChange={(e) => setNewSalleName(e.target.value)}
                                                placeholder="Nouveau nom de la salle"
                                                className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                              />
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={() => setShowEditSalleConfirmationModal(true)}
                                                  className="flex-1 bg-indigo-700 text-white font-bold py-2 rounded-lg hover:bg-indigo-800 transition"
                                                >
                                                  Sauvegarder
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setEditingSalle(null);
                                                    setNewSalleName("");
                                                    setError(null);
                                                  }}
                                                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition"
                                                >
                                                  Annuler
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              {salle.nom}
                                              {!isAdminLocation(loc) && (
                                                <div className="flex gap-2">
                                                  <button
                                                    onClick={() => handleEditSalleClick(salle)}
                                                    className="p-1 text-blue-500 hover:text-blue-700"
                                                    title="Modifier"
                                                  >
                                                    <MdEdit size={20} />
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setDeleteItem({ type: "salle", id: salle.id, nom: salle.nom });
                                                      setShowDeleteModal(true);
                                                    }}
                                                    className="p-1 text-red-500 hover:text-red-700"
                                                    title="Supprimer"
                                                  >
                                                    <MdDelete size={20} />
                                                  </button>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-gray-500 text-sm">Aucune salle associée à ce lieu.</p>
                                  )}
                                  {!isAdminLocation(loc) && (
                                    <button
                                      onClick={() => handleAddSalleClick(loc.id)}
                                      className="mt-2 flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                      <MdAdd size={20} />
                                      Ajouter une salle
                                    </button>
                                  )}
                                  {isAddingSalle && selectedLocationForSalles === loc.id && (
                                    <div className="mt-4 flex flex-col gap-2">
                                      <input
                                        type="text"
                                        value={newSalleName}
                                        onChange={(e) => setNewSalleName(e.target.value)}
                                        placeholder="Nom de la nouvelle salle"
                                        className="border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={async () => {
                                            if (!newSalleName.trim()) {
                                              setError("Le nom de la salle est requis");
                                              toast.error("Le nom de la salle est requis");
                                              return;
                                            }
                                            try {
                                              await createSalle(loc.id, { nom: newSalleName });
                                              setNewSalleName("");
                                              setIsAddingSalle(false);
                                              const updatedSalles = await getSallesByLocation(loc.id);
                                              setSelectedLocationSalles(updatedSalles || []);
                                              toast.success("Salle créée avec succès !");
                                              setError(null);
                                            } catch (err) {
                                              const errorMessage = err.response?.data?.message || "Erreur lors de la création de la salle";
                                              setError(errorMessage);
                                              toast.error(errorMessage);
                                            }
                                          }}
                                          className="flex-1 bg-indigo-700 text-white font-bold py-2 rounded-lg hover:bg-indigo-800 transition"
                                        >
                                          Sauvegarder
                                        </button>
                                        <button
                                          onClick={() => {
                                            setIsAddingSalle(false);
                                            setNewSalleName("");
                                            setError(null);
                                          }}
                                          className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400 transition"
                                        >
                                          Annuler
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            Aucun lieu créé par vous
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[48.8566, 2.3522]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                  dragging={true}
                  zoomControl={true}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <MapClickHandler />
                  {activeTab === 'default' && selectedLieu && selectedLieu.latitude && selectedLieu.longitude && (
                    <Marker position={[parseFloat(selectedLieu.latitude), parseFloat(selectedLieu.longitude)]} icon={blueIcon}>
                      <Popup>{selectedLieu.nom}</Popup>
                    </Marker>
                  )}
                  {activeTab === 'specify' && customMarker && (
                    <Marker position={[customMarker.lat, customMarker.lng]} icon={blueIcon}>
                      <Popup>{editingLocation ? editingLocation.nom : "Nouveau lieu"}</Popup>
                    </Marker>
                  )}
                </MapContainer>
                {activeTab === 'specify' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={searchLieu}
                      onChange={(e) => setSearchLieu(e.target.value)}
                      placeholder="Filtrer les lieux..."
                      className="w-full border border-indigo-300 rounded-xl px-4 py-2 sm:px-5 sm:py-3 bg-indigo-50 text-gray-900 placeholder-indigo-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Suppression */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 bg-white"
              variants={modalVariants}
            >
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-blue-100">
                  <TbAlertTriangle className="text-blue-500 text-5xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  Confirmer la suppression
                </h2>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer {deleteItem?.type === "location" ? "le lieu" : "la salle"} <span className="font-extrabold text-gray-800">"{deleteItem?.nom}"</span> ?
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center font-semibold ${gradientButton}`}
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

      {/* Modal Confirmation Modification Lieu */}
      <AnimatePresence>
        {showEditConfirmationModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 bg-white"
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditConfirmationModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-blue-100">
                  <TbAlertTriangle className="text-blue-500 text-5xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  Confirmer la modification
                </h2>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir modifier le lieu <span className="font-extrabold text-gray-800">"{editingLocation?.nom}"</span> ?
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4">
                  <button
                    onClick={() => setShowEditConfirmationModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmEdit}
                    className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center font-semibold ${gradientButton}`}
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

      {/* Modal Succès Modification Lieu */}
      <AnimatePresence>
        {showEditSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 bg-white"
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditSuccessModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-green-100">
                  <MdCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  Lieu modifié
                </h2>
                <p className="text-gray-600 mb-6">
                  Le lieu a été modifié avec succès !
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4">
                  <button
                    onClick={() => setShowEditSuccessModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmation Modification Salle */}
      <AnimatePresence>
        {showEditSalleConfirmationModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 bg-white"
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditSalleConfirmationModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-blue-100">
                  <TbAlertTriangle className="text-blue-500 text-5xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  Confirmer la modification
                </h2>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir modifier la salle <span className="font-extrabold text-gray-800">"{editingSalle?.nom}"</span> ?
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4">
                  <button
                    onClick={() => setShowEditSalleConfirmationModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEditSalle}
                    className={`flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center font-semibold ${gradientButton}`}
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

      {/* Modal Succès Modification Salle */}
      <AnimatePresence>
        {showEditSalleSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
          >
            <motion.div
              className="rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200 bg-white"
              variants={modalVariants}
            >
              <button
                onClick={() => setShowEditSalleSuccessModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <MdClose size={24} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-green-100">
                  <MdCheckCircle className="text-green-500 text-5xl" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                  Salle modifiée
                </h2>
                <p className="text-gray-600 mb-6">
                  La salle a été modifiée avec succès !
                </p>
                <div className="flex flex-col sm:flex-row justify-center w-full gap-4">
                  <button
                    onClick={() => setShowEditSalleSuccessModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}