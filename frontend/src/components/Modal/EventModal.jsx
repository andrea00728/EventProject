import React, { useState, useEffect } from 'react';
import { getLocations, getSallesByLocation, createSalle, saveLocation, updateEvent } from '../../services/evenementServ';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
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
  });
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
  const [imagePreview, setImagePreview] = useState(event?.imageUrl || '');
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
  
  const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  // Assurez-vous que le chemin commence par un slash
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Utilisation
const imageUrl = getImageUrl(event.imageUrl)
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
      console.error('Erreur lors de la mise à jour de l’événement:', err);
      const errorMessage = err.response?.status === 400
        ? "Requête invalide. Vérifiez les données envoyées."
        : err.response?.status === 404
        ? "L'événement n'a pas été trouvé sur le serveur. Vérifiez l'identifiant."
        : err.response?.data?.message || 'Erreur lors de la mise à jour de l’événement';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Mode visualisation */}
        {event?.mode === 'view' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{event.nom}</h2>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-semibold">Type :</span> {event.type}</p>
              <p><span className="font-semibold">Thème :</span> {event.theme}</p>
              <p><span className="font-semibold">Date de début :</span> {new Date(event.date).toLocaleString('fr-FR')}</p>
              <p><span className="font-semibold">Date de fin :</span> {event.date_fin ? new Date(event.date_fin).toLocaleString('fr-FR') : 'Non spécifiée'}</p>
              <p><span className="font-semibold">Lieu :</span> {event.location?.nom || 'Non précisé'}</p>
              <p><span className="font-semibold">Salle :</span> {event.salle?.nom || 'Non précisé'}</p>
              <p><span className="font-semibold">Public :</span> {event.isPublic ? 'Oui' : 'Non'}</p>
              {event.imageUrl && <img src={event.imageUrl} alt="Événement" className="mt-2 max-w-xs rounded-lg col-span-2" />}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          /* Mode édition */
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Modifier l'événement</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Champ Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Champ Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700">Thème</label>
                <input
                  type="text"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Champ Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de début</label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Champ Date de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                <input
                  type="datetime-local"
                  name="date_fin"
                  value={form.date_fin}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Champ Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Lieu</label>
                <input
                  type="text"
                  value={selectedLieu?.nom || 'Sélectionner un lieu'}
                  onClick={() => setIsLocationModalOpen(true)}
                  readOnly
                  className="mt-1 w-full p-3 border rounded-lg bg-gray-100 cursor-pointer"
                />
              </div>
              {/* Champ Salle */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Salle</label>
                <input
                  type="text"
                  value={salles.find((s) => s.id === form.salleId)?.nom || 'Sélectionner une salle'}
                  onClick={() => setIsSalleModalOpen(true)}
                  readOnly
                  className="mt-1 w-full p-3 border rounded-lg bg-gray-100 cursor-pointer"
                />
              </div>
              {/* Champ Événement public */}
              <div className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Événement public</label>
              </div>
              {/* Champ Image */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Image</label>
                {imagePreview && (
                  <img src={imagePreview} alt="Prévisualisation" className="mt-2 max-w-xs rounded-lg" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {/* Boutons du formulaire */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Modale pour sélectionner ou créer un lieu */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sélectionner ou créer un lieu</h3>
              {/* Onglets pour choisir entre sélection par défaut ou spécification */}
              <div className="flex gap-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setActiveTab('default')}
                >
                  Par défaut
                </button>
                <button
                  className={`px-4 py-2 rounded-lg ${activeTab === 'specify' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                  onClick={() => setActiveTab('specify')}
                >
                  Spécifier le lieu
                </button>
              </div>
              {activeTab === 'default' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Rechercher un lieu"
                    value={searchLieu}
                    onChange={(e) => setSearchLieu(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                  />
                  <ul className="max-h-48 overflow-y-auto border rounded-lg">
                    {filteredLocations
                      .filter((lieu) => lieu.nom.toLowerCase().includes(searchLieu.toLowerCase()))
                      .map((lieu) => (
                        <li
                          key={lieu.id}
                          onClick={() => handleSelectLieu(lieu)}
                          className="p-3 cursor-pointer hover:bg-gray-100"
                        >
                          {lieu.nom}
                        </li>
                      ))}
                  </ul>
                  {selectedLieu && selectedLieu.latitude && selectedLieu.longitude && (
                    <MapContainer
                      center={[selectedLieu.latitude, selectedLieu.longitude]}
                      zoom={13}
                      style={{ height: '300px', width: '100%' }}
                      className="mt-4 rounded-lg"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[selectedLieu.latitude, selectedLieu.longitude]} icon={blueIcon}>
                        <Popup>{selectedLieu.nom}</Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Rechercher une adresse"
                      value={searchLieu}
                      onChange={(e) => setSearchLieu(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGeocode()}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={handleGeocode}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Rechercher
                    </button>
                  </div>
                  <ul className="max-h-48 overflow-y-auto border rounded-lg">
                    {geocodedResults.map((result) => (
                      <li
                        key={result.place_id}
                        onClick={() => handleSelectGeocodedLocation(result)}
                        className="p-3 cursor-pointer hover:bg-gray-100"
                      >
                        {result.display_name}
                      </li>
                    ))}
                  </ul>
                  <MapContainer
                    center={[48.8566, 2.3522]} // Centre par défaut (Paris)
                    zoom={13}
                    style={{ height: '300px', width: '100%' }}
                    className="mt-4 rounded-lg"
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
                  {newLocation.query && (
                    <div className="mt-4 space-y-2">
                      <p><span className="font-semibold">Nom :</span> {newLocation.query}</p>
                      <p><span className="font-semibold">Latitude :</span> {newLocation.latitude}</p>
                      <p><span className="font-semibold">Longitude :</span> {newLocation.longitude}</p>
                      <button
                        onClick={handleSaveLocation}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modale pour sélectionner ou ajouter une salle */}
        {isSalleModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sélectionner ou ajouter une salle</h3>
              {salles.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto border rounded-lg">
                  {salles.map((salle) => (
                    <li
                      key={salle.id}
                      onClick={() => handleSelectSalle(salle)}
                      className="p-3 cursor-pointer hover:bg-gray-100"
                    >
                      {salle.nom}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucune salle disponible pour ce lieu.</p>
              )}
              <button
                onClick={() => setIsAddingSalle(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Ajouter une salle
              </button>
              {isAddingSalle && (
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    placeholder="Nom de la salle"
                    value={newSalleName}
                    onChange={(e) => setNewSalleName(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleCreateSalle}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setIsAddingSalle(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsSalleModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;