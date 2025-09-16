import React, { useState, useEffect } from 'react';
import { getLocations, getSallesByLocation, createSalle, saveLocation, updateEvent } from '../../services/evenementServ';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { url } from '../../api/url';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.mastertable.site';
// Configuration de l'icône personnalisée pour le marqueur de la carte
const blueIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng); // Appelle la fonction lorsqu'on clique sur la carte
    },
  });0
   
  return null;
}

const EventModal = ({ isOpen, onClose, event, onSave }) => {
  // État initial du formulaire avec les données de l'événement ou des valeurs par défaut
  const [form, setForm] = useState({
    nom: event?.nom || '',
    type: event?.type || 'autre',
    theme: event?.theme || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    date_fin: event?.date_fin ? new Date(event.date_fin).toISOString().slice(0, 16) : '',
    locationId: event?.location?.id || null,
    salleId: event?.salleId || null,
    isPublic: event?.isPublic || false,
  });

  // États pour gérer l'image, les lieux, les salles et les modales
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(url+event?.imageUrl || '');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSalleModalOpen, setIsSalleModalOpen] = useState(false);
  const [searchLieu, setSearchLieu] = useState('');
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [newSalleName, setNewSalleName] = useState('');
  const [isAddingSalle, setIsAddingSalle] = useState(false);
  const [selectedLieu, setSelectedLieu] = useState(event?.location || null);
  const [newLocation, setNewLocation] = useState({
    query: '',
    latitude: null,
    longitude: null,
  });
  const [geocodedResults, setGeocodedResults] = useState([]);
  const [activeTab, setActiveTab] = useState('default');
  const [isSubmitting, setIsSubmitting] = useState(false); // Nouvel état pour empêcher les soumissions multiples

  // Charger les lieux et les salles au montage du composant
  useEffect(() => {
    fetchLocations();
    if (form.locationId) {
      fetchSallesByLocation(form.locationId);
    }
  }, [form.locationId]);

  // Fonction pour récupérer la liste des lieux
  const fetchLocations = async () => {
    try {
      const data = await getLocations();
      setFilteredLocations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      alert('Erreur lors de la récupération des lieux');
    }
  };

  // Fonction pour récupérer les salles associées à un lieu
  const fetchSallesByLocation = async (locationId) => {
    try {
      const data = await getSallesByLocation(locationId);
      setSalles(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des salles:', error);
      setSalles([]);
    }
  };

  // Fonction pour rechercher une adresse via l'API Nominatim
  const handleGeocode = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLieu)}`
      );
      const data = await response.json();
      setGeocodedResults(data);
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      alert('Erreur de géocodage');
    }
  };

  // Sélectionner un résultat de géocodage
  const handleSelectGeocodedLocation = (result) => {
    setNewLocation({
      query: result.display_name,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    });
    setGeocodedResults([]);
  };

  // Gérer le clic sur la carte pour définir une localisation
  const handleMapClick = async (latlng) => {
    setNewLocation({
      ...newLocation,
      latitude: latlng.lat,
      longitude: latlng.lng,
    });
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      setNewLocation((prev) => ({
        ...prev,
        query: data.display_name,
      }));
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
    }
  };

  // Sauvegarder un nouveau lieu
  const handleSaveLocation = async () => {
    try {
      const response = await saveLocation(newLocation.query, event?.user?.id || '0');
      setForm({ ...form, locationId: response.id });
      setSelectedLieu(response);
      fetchLocations();
      fetchSallesByLocation(response.id);
      setIsLocationModalOpen(false);
      setNewLocation({ query: '', latitude: null, longitude: null });
      setActiveTab('default');
    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      alert(error.message || 'Erreur lors de la création du lieu');
    }
  };

  // Créer une nouvelle salle
  const handleCreateSalle = async () => {
    if (!newSalleName.trim()) {
      alert('Le nom de la salle ne peut pas être vide');
      return;
    }
    try {
      const response = await createSalle(form.locationId, { nom: newSalleName });
      setSalles([...salles, response]);
      setNewSalleName('');
      setIsAddingSalle(false);
      setForm({ ...form, salleId: response.id });
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      alert(error.message || 'Erreur lors de la création de la salle');
    }
  };

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 5MB).');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Veuillez sélectionner une image au format JPEG ou PNG.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumettre le formulaire pour mettre à jour l'événement
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Empêcher les soumissions multiples
    setIsSubmitting(true); // Verrouiller le formulaire

    if (salles.length > 0 && form.salleId) {
      const selectedSalle = salles.find((s) => s.id === Number(form.salleId));
      if (!selectedSalle) {
        alert('La salle ne correspond pas au lieu sélectionné');
        setIsSubmitting(false);
        return;
      }
    }
    try {
      if (!event || !event.id || isNaN(Number(event.id))) {
        alert("L'identifiant de l'événement est manquant ou invalide.");
        setIsSubmitting(false);
        return;
      }
      const formData = new FormData();
      formData.append('nom', form.nom);
      formData.append('type', form.type);
      formData.append('theme', form.theme);
      formData.append('date', form.date);
      formData.append('date_fin', form.date_fin);
      formData.append('locationId', Number(form.locationId)); // Convertir en nombre
      formData.append('salleId', form.salleId ? Number(form.salleId) : ''); // Convertir en nombre ou chaîne vide
      formData.append('isPublic', form.isPublic.toString()); // Convertir en chaîne
      if (imageFile) formData.append('image', imageFile);

      console.log('Envoi de la requête pour eventId:', event.id); // Débogage
      const updatedEvent = await updateEvent({
        eventId: event.id,
        eventData: formData,
      });

      console.log('Événement mis à jour:', updatedEvent);
      if (onSave) onSave(updatedEvent);
      onClose();
    } catch (err) {
      console.error(`Erreur lors de la mise à jour de l'événement:`, err);
      const errorMessage = err.response?.status === 400
        ? "Requête invalide. Vérifiez les données envoyées."
        : err.response?.status === 404
        ? `L'événement n'a pas été trouvé sur le serveur. Vérifiez l'identifiant.`
        : err.response?.data?.message || `Erreur lors de la mise à jour de l'événement`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false); // Déverrouiller le formulaire
    }
  };

  // Sélectionner un lieu existant
  const handleSelectLieu = (lieu) => {
    setForm({ ...form, locationId: lieu.id, salleId: null });
    setSelectedLieu(lieu);
    fetchSallesByLocation(lieu.id);
    setIsLocationModalOpen(false);
  };

  // Sélectionner une salle existante
  const handleSelectSalle = (salle) => {
    setForm({ ...form, salleId: salle.id });
    setIsSalleModalOpen(false);
  };

  // Si la modale n'est pas ouverte, ne rien afficher
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/20 max-w-5xl w-full max-h-[92vh] overflow-hidden">
        <div className="overflow-y-auto max-h-[92vh] custom-scrollbar">
          <div className="p-8">
            {/* Mode visualisation */}
            {event?.mode === 'view' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{event.nom}</h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 rounded-2xl border border-blue-100/50">
                      <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Type</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{event.type}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 p-6 rounded-2xl border border-purple-100/50">
                      <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Thème</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{event.theme}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 rounded-2xl border border-green-100/50">
                      <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Lieu</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{event.location?.nom || 'Non précisé'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50/80 to-red-50/80 p-6 rounded-2xl border border-orange-100/50">
                      <span className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Date de début</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{new Date(event.date).toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 p-6 rounded-2xl border border-amber-100/50">
                      <span className="text-sm font-semibold text-amber-600 uppercase tracking-wide">Date de fin</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{event.date_fin ? new Date(event.date_fin).toLocaleString('fr-FR') : 'Non spécifiée'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-50/80 to-sky-50/80 p-6 rounded-2xl border border-cyan-100/50">
                      <span className="text-sm font-semibold text-cyan-600 uppercase tracking-wide">Salle</span>
                      <p className="text-lg font-medium text-gray-800 mt-1">{event.salle?.nom || 'Non précisé'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-50/80 to-slate-50/80 p-6 rounded-2xl border border-gray-100/50">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Événement public</span>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${event.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {event.isPublic ? 'Public' : 'Privé'}
                  </div>
                </div>
                
                {event.imageUrl && (
                  <div className="bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-6 rounded-2xl border border-gray-100/50">
                    <img src={url+event.imageUrl} alt="Événement" className="max-w-sm mx-auto rounded-xl shadow-lg" />
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-200/50">
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              /* Mode édition */
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Modifier l'événement</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Champ Nom */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Nom de l'événement</label>
                    <input
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                      placeholder="Entrez le nom de l'événement"
                    />
                  </div>
                  
                  {/* Champ Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Type d'événement</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="mariage">Mariage</option>
                      <option value="reunion">Réunion</option>
                      <option value="anniversaire">Anniversaire</option>
                      <option value="engagement">Engagement</option>
                      <option value="fiançailles">Fiançailles</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  
                  {/* Champ Thème */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Thème</label>
                    <input
                      type="text"
                      name="theme"
                      value={form.theme}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 placeholder-gray-400"
                      placeholder="Thème de l'événement"
                    />
                  </div>
                  
                  {/* Champ Date de début */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Date de début</label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  
                  {/* Champ Date de fin */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Date de fin</label>
                    <input
                      type="datetime-local"
                      name="date_fin"
                      value={form.date_fin}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  
                  {/* Champ Lieu */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Lieu</label>
                    <div 
                      onClick={() => setIsLocationModalOpen(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-300/50 rounded-xl cursor-pointer hover:from-green-100/80 hover:to-emerald-100/80 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 font-medium">{selectedLieu?.nom || 'Sélectionner un lieu'}</span>
                      <svg className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Champ Salle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Salle</label>
                    <div
                      onClick={() => setIsSalleModalOpen(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-cyan-50/80 to-sky-50/80 border border-cyan-300/50 rounded-xl cursor-pointer hover:from-cyan-100/80 hover:to-sky-100/80 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-700 font-medium">{salles.find((s) => s.id === form.salleId)?.nom || 'Sélectionner une salle'}</span>
                      <svg className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Champ Événement public */}
                <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 p-6 rounded-2xl border border-gray-200/50">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isPublic"
                        checked={form.isPublic}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-all duration-200 ${form.isPublic ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${form.isPublic ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </div>
                    <span className="ml-4 text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-200">Événement public</span>
                  </label>
                </div>
                
                {/* Champ Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Image de l'événement</label>
                  {imagePreview && (
                    <div className="flex justify-center">
                      <img src={imagePreview} alt="Prévisualisation" className="max-w-sm rounded-2xl shadow-xl border border-gray-200/50" />
                    </div>
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full px-6 py-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border-2 border-dashed border-indigo-300/50 rounded-2xl hover:from-indigo-100/80 hover:to-purple-100/80 transition-all duration-200 text-center group">
                      <svg className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-indigo-600 font-semibold">Cliquez pour sélectionner une image</span>
                      <p className="text-sm text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
                    </div>
                  </div>
                </div>
                
                {/* Boutons du formulaire */}
                <div className="flex gap-4 pt-6 border-t border-gray-200/50">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </div>
                    ) : (
                      'Enregistrer les modifications'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modale pour sélectionner ou créer un lieu */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/20 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Sélectionner ou créer un lieu</h3>
                  <button
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Onglets pour choisir entre sélection par défaut ou spécification */}
                <div className="flex gap-2 mb-6 p-1 bg-gray-100/80 rounded-2xl">
                  <button
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === 'default' 
                        ? 'bg-white text-green-600 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                    onClick={() => setActiveTab('default')}
                  >
                    Lieux existants
                  </button>
                  <button
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === 'specify' 
                        ? 'bg-white text-green-600 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                    onClick={() => setActiveTab('specify')}
                  >
                    Nouveau lieu
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {activeTab === 'default' ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher un lieu existant..."
                          value={searchLieu}
                          onChange={(e) => setSearchLieu(e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 placeholder-gray-400 pl-12"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      <div className="bg-white/80 rounded-2xl border border-gray-200/50 max-h-64 overflow-y-auto custom-scrollbar">
                        {filteredLocations
                          .filter((lieu) => lieu.nom.toLowerCase().includes(searchLieu.toLowerCase()))
                          .map((lieu) => (
                            <div
                              key={lieu.id}
                              onClick={() => handleSelectLieu(lieu)}
                              className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 flex items-center group"
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-gray-700 group-hover:text-green-600 transition-colors duration-200">{lieu.nom}</span>
                            </div>
                          ))}
                      </div>
                      
                      {selectedLieu && selectedLieu.latitude && selectedLieu.longitude && (
                        <div className="bg-white/80 rounded-2xl border border-gray-200/50 p-4">
                          <MapContainer
                            center={[selectedLieu.latitude, selectedLieu.longitude]}
                            zoom={13}
                            style={{ height: '300px', width: '100%' }}
                            className="rounded-xl"
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <Marker position={[selectedLieu.latitude, selectedLieu.longitude]} icon={blueIcon}>
                              <Popup>{selectedLieu.nom}</Popup>
                            </Marker>
                          </MapContainer>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            placeholder="Rechercher une adresse..."
                            value={searchLieu}
                            onChange={(e) => setSearchLieu(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleGeocode()}
                            className="w-full px-4 py-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 placeholder-gray-400 pl-12"
                          />
                          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <button
                          onClick={handleGeocode}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          Rechercher
                        </button>
                      </div>
                      
                      {geocodedResults.length > 0 && (
                        <div className="bg-white/80 rounded-2xl border border-gray-200/50 max-h-48 overflow-y-auto custom-scrollbar">
                          {geocodedResults.map((result) => (
                            <div
                              key={result.place_id}
                              onClick={() => handleSelectGeocodedLocation(result)}
                              className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-green-50/80 hover:to-emerald-50/80 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 group"
                            >
                              <span className="text-gray-700 group-hover:text-green-600 transition-colors duration-200">{result.display_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="bg-white/80 rounded-2xl border border-gray-200/50 p-4">
                        <MapContainer
                          center={[48.8566, 2.3522]} // Centre par défaut (Paris)
                          zoom={13}
                          style={{ height: '300px', width: '100%' }}
                          className="rounded-xl"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          />
                          {newLocation.latitude && newLocation.longitude && (
                            <Marker position={[newLocation.latitude, newLocation.longitude]} icon={blueIcon}>
                              <Popup>{newLocation.query}</Popup>
                            </Marker>
                          )}
                          <MapClickHandler onLocationSelect={handleMapClick} />
                        </MapContainer>
                      </div>
                      
                      {newLocation.query && (
                        <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 rounded-2xl border border-green-200/50">
                          <h4 className="font-bold text-green-700 mb-4">Nouveau lieu sélectionné</h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Nom</span>
                              <p className="text-gray-700 font-medium">{newLocation.query}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Latitude</span>
                                <p className="text-gray-700 font-medium">{newLocation.latitude}</p>
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Longitude</span>
                                <p className="text-gray-700 font-medium">{newLocation.longitude}</p>
                              </div>
                            </div>
                            <button
                              onClick={handleSaveLocation}
                              className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                            >
                              Sauvegarder ce lieu
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale pour sélectionner ou ajouter une salle */}
        {isSalleModalOpen && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/20 max-w-lg w-full">
              <div className="p-8">
                <div className="flex items-center justify-between border-b border-gray-200/50 pb-6 mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">Sélectionner une salle</h3>
                  <button
                    onClick={() => setIsSalleModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {salles.length > 0 ? (
                    <div className="bg-white/80 rounded-2xl border border-gray-200/50 max-h-64 overflow-y-auto custom-scrollbar">
                      {salles.map((salle) => (
                        <div
                          key={salle.id}
                          onClick={() => handleSelectSalle(salle)}
                          className="p-4 cursor-pointer hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-sky-50/80 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 flex items-center group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-cyan-100 to-sky-100 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-700 group-hover:text-cyan-600 transition-colors duration-200">{salle.nom}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <p className="text-gray-500 font-medium">Aucune salle disponible pour ce lieu.</p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setIsAddingSalle(true)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-sky-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ajouter une nouvelle salle
                  </button>
                  
                  {isAddingSalle && (
                    <div className="bg-gradient-to-r from-cyan-50/80 to-sky-50/80 p-6 rounded-2xl border border-cyan-200/50 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-cyan-700 uppercase tracking-wide mb-2">Nom de la salle</label>
                        <input
                          type="text"
                          placeholder="Entrez le nom de la salle"
                          value={newSalleName}
                          onChange={(e) => setNewSalleName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/80 border border-cyan-300/50 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200 placeholder-gray-400"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateSalle}
                          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setIsAddingSalle(false)}
                          className="flex-1 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 9999px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
};

export default EventModal;