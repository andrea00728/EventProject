import { useMapEvents } from 'react-leaflet';

const MapClickHandler = ({ setGeocodeAddress, setGeocodeResult, setGeocodeResultText }) => {
  useMapEvents({
    click: (e) => {
      // e.latlng contient les coordonnées (latitude et longitude) du clic
      const { lat, lng } = e.latlng;

      // Ici, vous devriez lancer une requête de géocodage inversé (reverse geocoding)
      // pour obtenir l'adresse à partir des coordonnées.
      // Par exemple, en utilisant Nominatim d'OpenStreetMap.
      
      // Simuler une requête pour l'exemple
      const newGeocodeResult = {
        latitude: lat.toString(),
        longitude: lng.toString(),
        nom: `Coordonnées: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, // Exemple d'affichage
      };

      setGeocodeResult(newGeocodeResult);
      setGeocodeResultText(newGeocodeResult.nom); // Mettre à jour le texte
      setGeocodeAddress(`Lat: ${lat}, Lng: ${lng}`); // Mettre à jour l'adresse

      // Vous pouvez aussi ajouter un marqueur ici
      // mais il est déjà géré dans le composant parent en fonction de l'état geocodeResult
    },
  });

  return null; // Ce composant ne rend rien visuellement, il gère juste la logique
};

export default MapClickHandler;