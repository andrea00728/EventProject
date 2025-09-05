import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Pencil } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import { updateEvent, getSallesByLocation } from '../../services/evenementServ';

// Icône personnalisée pour marqueur
const customIcon = L.icon({
  iconUrl:
    'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12.5, 41],
  popupAnchor: [0, -41],
});

// Gestion du clic sur la carte
const MapClickHandler = ({ setGeocodeResult, setGeocodeResultText, setGeocodeAddress }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    const handleClick = async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`)
        .openPopup();

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
        );
        const data = await res.json();
        const name = data.display_name || `Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`;
        setGeocodeResult({ nom: name, latitude: lat, longitude: lng });
        setGeocodeResultText(name);
        setGeocodeAddress(name);
      } catch {
        toast.error('Erreur lors du reverse geocoding.');
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      if (markerRef.current) map.removeLayer(markerRef.current);
    };
  }, [map, setGeocodeResult, setGeocodeResultText, setGeocodeAddress]);

  return null;
};

const EventModal = ({ isOpen, onClose, event, onEventUpdated, isEditMode = false }) => {
  const [editForm, setEditForm] = useState({
    nom: event?.nom || '',
    type: event?.type || '',
    theme: event?.theme || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    date_fin: event?.date_fin ? new Date(event.date_fin).toISOString().slice(0, 16) : '',
    salleId: event?.salle?.id || '',
    isPublic: event?.isPublic || false,
    image: null,
  });
  const [salles, setSalles] = useState([]);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [geocodeAddress, setGeocodeAddress] = useState(event?.location?.nom || '');
  const [geocodeResult, setGeocodeResult] = useState({
    nom: event?.location?.nom || '',
    latitude: event?.location?.latitude || null,
    longitude: event?.location?.longitude || null,
  });
  const [geocodeResultText, setGeocodeResultText] = useState('');

  const mapRef = useRef(null);

  // Charger les salles selon le lieu sélectionné (s'il existe une location)
  useEffect(() => {
    if (geocodeResult.latitude && geocodeResult.longitude && event?.locations) {
      const matchedLocation = event.locations.find(
        (loc) => loc.latitude === geocodeResult.latitude && loc.longitude === geocodeResult.longitude
      );
      if (matchedLocation) {
        getSallesByLocation(matchedLocation.id)
          .then(setSalles)
          .catch(() => toast.error('Erreur lors du chargement des salles.'));
      } else {
        setSalles([]);
      }
    }
  }, [geocodeResult, event?.locations]);

  // Centrer la carte sur le lieu
  useEffect(() => {
    if (isOpen && geocodeResult.latitude && geocodeResult.longitude && mapRef.current) {
      mapRef.current.setView([geocodeResult.latitude, geocodeResult.longitude], 13);
    }
  }, [isOpen, geocodeResult]);

  const handleChange = (e) => {
    const { name, value, files, checked, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : files ? files[0] : value,
    }));
  };

  const handleUpdate = async () => {
    const data = new FormData();
    Object.entries(editForm).forEach(([key, value]) => data.append(key, value));
    // Ajouter lieu depuis la carte
    if (geocodeResult.latitude && geocodeResult.longitude) {
      data.append('locationNom', geocodeResult.nom);
      data.append('latitude', geocodeResult.latitude);
      data.append('longitude', geocodeResult.longitude);
    }

    try {
      const updatedEvent = await updateEvent(event.id, data);
      onEventUpdated(updatedEvent);
      setIsEditing(false);
      toast.success('Événement mis à jour avec succès !');
    } catch {
      toast.error("Erreur lors de la mise à jour de l'événement");
    }
  };

  const handleGeocode = async () => {
    if (!geocodeAddress.trim()) return toast.error('Veuillez entrer une adresse valide.');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          geocodeAddress
        )}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        setGeocodeResult({ nom: display_name, latitude, longitude });
        setGeocodeResultText(`Nom: ${display_name}, Lat: ${lat}, Lon: ${lon}`);
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 13);
      } else toast.error('Aucun résultat trouvé.');
    } catch {
      toast.error('Erreur lors du géocodage.');
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 relative">
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? `Modifier l'événement: ${event.nom}` : `Détails de l'événement: ${event.nom}`}
            </h2>
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 p-1 rounded-full">
              <X size={24} />
            </button>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="absolute top-4 right-12 text-white hover:text-gray-200 p-1 rounded-full">
                <Pencil size={24} />
              </button>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {isEditing ? (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label>Nom</label>
                  <input name="nom" value={editForm.nom} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label>Type</label>
                  <input name="type" value={editForm.type} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label>Thème</label>
                  <input name="theme" value={editForm.theme} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label>Date début</label>
                  <input type="datetime-local" name="date" value={editForm.date} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label>Date fin</label>
                  <input type="datetime-local" name="date_fin" value={editForm.date_fin} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label>Salle</label>
                  {salles.length > 0 ? (
                    <select name="salleId" value={editForm.salleId} onChange={handleChange} className="w-full p-2 border rounded" required>
                      <option value="">-- Sélectionner une salle --</option>
                      {salles.map((s) => (<option key={s.id} value={s.id}>{s.nom}</option>))}
                    </select>
                  ) : (
                    <input type="text" name="salleId" value={editForm.salleId} onChange={handleChange} placeholder="Saisir le nom de la salle" className="w-full p-2 border rounded" required />
                  )}
                </div>
                <div>
                  <label>Image</label>
                  <input type="file" name="image" onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div className="col-span-2">
                  <label>Public</label>
                  <input type="checkbox" name="isPublic" checked={editForm.isPublic} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <label>Lieu (carte)</label>
                  <input value={geocodeAddress} onChange={(e) => setGeocodeAddress(e.target.value)} placeholder="Adresse du lieu" className="w-full p-2 border rounded" />
                  <button type="button" onClick={handleGeocode} className="mt-2 bg-blue-500 text-white p-2 rounded">Rechercher</button>
                  <p className="mt-2">{geocodeResultText}</p>
                  <MapContainer center={[48.8566, 2.3522]} zoom={13} style={{ height: '300px', width: '100%' }} ref={mapRef} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler setGeocodeResult={setGeocodeResult} setGeocodeResultText={setGeocodeResultText} setGeocodeAddress={setGeocodeAddress} />
                    {geocodeResult?.latitude && geocodeResult?.longitude && (
                      <Marker position={[geocodeResult.latitude, geocodeResult.longitude]} icon={customIcon} />
                    )}
                  </MapContainer>
                </div>
                <div className="col-span-2 flex gap-4">
                  <button type="submit" className="bg-green-500 text-white p-2 rounded flex-1">Sauvegarder</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-red-500 text-white p-2 rounded flex-1">Annuler</button>
                </div>
              </form>
            ) : (
              <div>
                <p><strong>Nom:</strong> {event.nom}</p>
                <p><strong>Type:</strong> {event.type}</p>
                <p><strong>Thème:</strong> {event.theme}</p>
                <p><strong>Date début:</strong> {event.date}</p>
                <p><strong>Date fin:</strong> {event.date_fin}</p>
                <p><strong>Lieu:</strong> {geocodeResult.nom}</p>
                <p><strong>Salle:</strong> {event.salle?.nom}</p>
                <p><strong>Public:</strong> {event.isPublic ? 'Oui' : 'Non'}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventModal;
