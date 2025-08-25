import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { url } from '../../api/url';

const MapTestComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState(null);
  const [locations, setLocations] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const initialMap = L.map('map').setView([48.8566, 2.3522], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(initialMap);
    setMap(initialMap);

    // Charger les localisations au montage du composant
    fetchLocations();

    return () => {
      initialMap.remove();
    };
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${url}/locations`);
      const data = await response.json();
      console.log('Localisations récupérées:', data);
      setLocations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
    }
  };

  const geocodeLocation = async () => {
    if (!searchQuery) {
      alert('Veuillez entrer un lieu.');
      return;
    }

    try {
      const response = await fetch(`${url}/locations/geocode?q=${encodeURIComponent(searchQuery)}`);
      console.log('URL appelée:', `${url}/locations/geocode?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      console.log('Réponse reçue:', data);
      if (data.error) throw new Error(data.message || data.error);
      if (!data.lat || !data.lon) throw new Error('Coordonnées invalides');
      setResult(data);

      if (map) {
        map.setView([data.lat, data.lon], 13);
        L.marker([data.lat, data.lon]).addTo(map)
          .bindPopup(data.displayName)
          .openPopup();
      }
    } catch (error) {
      setResult({ error: `Erreur : ${error.message}` });
      console.error('Erreur détaillée:', error);
    }
  };

  const saveLocation = async () => {
    if (!searchQuery) {
      alert('Veuillez entrer un lieu.');
      return;
    }

    try {
      const response = await fetch(`${url}/locations/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      console.log('URL appelée:', `${url}/locations/save`, 'Body:', { query: searchQuery });
      const data = await response.json();
      console.log('Réponse reçue:', data);
      if (data.error) throw new Error(data.message || data.error);
      setResult(data);

      if (map && data.location) {
        map.setView([data.location.latitude, data.location.longitude], 13);
        L.marker([data.location.latitude, data.location.longitude]).addTo(map)
          .bindPopup(data.location.nom)
          .openPopup();
      }

      // Rafraîchir la liste des localisations après sauvegarde
      fetchLocations();
    } catch (error) {
      setResult({ error: `Erreur : ${error.message}` });
      console.error('Erreur détaillée:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test de l'API de Localisation</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Entrez un lieu (ex: Tour Eiffel)"
        style={{ width: '70%', padding: '5px', marginRight: '10px' }}
      />
      <button onClick={geocodeLocation}>Géocoder</button>
      <button onClick={saveLocation} style={{ marginLeft: '10px' }}>Sauvegarder</button>
      <button onClick={fetchLocations} style={{ marginLeft: '10px' }}>Rafraîchir la liste</button>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        Résultat : <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Localisations enregistrées :</h2>
        <ul>
          {locations.map((location) => (
            <li key={location.id}>
              {location.nom} (Lat: {location.latitude}, Lon: {location.longitude})
            </li>
          ))}
        </ul>
      </div>
      <div id="map" style={{ height: '400px', width: '100%', marginTop: '20px' }}></div>
    </div>
  );
};

export default MapTestComponent;