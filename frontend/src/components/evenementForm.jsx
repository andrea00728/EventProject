import React, { useEffect, useState, useRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";
import {
  createEvent,
  getLocations,
  getSallesByLocation,
  saveLocation,
} from "../services/evenementServ";
import { textControll } from "../services/controll_champs/controll_champs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Select from "react-select";
import { useStateContext } from "../context/ContextProvider";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom blue marker icon
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const EVENT_TYPES = [
  { value: "mariage", label: "Mariage" },
  { value: "fiançailles", label: "Fiançailles" },
  { value: "anniversaire", label: "Anniversaire" },
  { value: "bapteme", label: "Baptême" },
  { value: "communion", label: "Première Communion" },
  { value: "confirmation", label: "Confirmation" },
  { value: "bar_mitsva", label: "Bar Mitsva / Bat Mitsva" },
  { value: "reunion_famille", label: "Réunion de famille" },
  { value: "reunion", label: "Réunion professionnelle" },
  { value: "conference", label: "Conférence" },
  { value: "seminaire", label: "Séminaire" },
  { value: "formation", label: "Formation / Workshop" },
  { value: "team_building", label: "Team Building" },
  { value: "concert", label: "Concert" },
  { value: "festival", label: "Festival" },
  { value: "gala", label: "Soirée de gala" },
  { value: "banquet", label: "Banquet" },
  { value: "degustation", label: "Dégustation / Wine tasting" },
  { value: "inauguration", label: "Inauguration" },
  { value: "exposition", label: "Exposition" },
  { value: "foire", label: "Foire / Salon" },
  { value: "competition", label: "Compétition sportive" },
  { value: "match", label: "Match sportif" },
  { value: "tournoi", label: "Tournoi" },
  { value: "remise_diplome", label: "Remise de diplôme" },
  { value: "soiree", label: "Soirée privée" },
  {
    value: "enterrement_vie_garcon",
    label: "EVG (Enterrement de vie de garçon)",
  },
  {
    value: "enterrement_vie_fille",
    label: "EVJF (Enterrement de vie de jeune fille)",
  },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "gender_reveal", label: "Gender Reveal" },
  { value: "funerailles", label: "Funérailles / Commémoration" },
  { value: "religieux", label: "Événement religieux" },
  { value: "culturel", label: "Événement culturel" },
  { value: "caritatif", label: "Événement caritatif" },
  { value: "politique", label: "Événement politique" },
  { value: "autre", label: "Autre" },
];

// Liste des thèmes
const EVENT_THEMES = [
  { value: "chic", label: "Chic" },
  { value: "boheme", label: "Bohème" },
  { value: "classique", label: "Classique" },
  { value: "rustique", label: "Rustique" },
  { value: "moderne", label: "Moderne" },
  { value: "vintage", label: "Vintage" },
  { value: "tropical", label: "Tropical" },
  { value: "glamour", label: "Glamour" },
  { value: "minimaliste", label: "Minimaliste" },
  { value: "industriel", label: "Industriel" },
  { value: "romantique", label: "Romantique" },
  { value: "nature", label: "Nature" },
  { value: "festif", label: "Festif" },
  { value: "autre", label: "Autre" },
];

// Styles personnalisés pour react-select
const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.75rem",
    border: "1px solid #d1d5db",
    backgroundColor: "#f9fafb",
    padding: "0.5rem",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#a5b4fc",
    },
    "&:focus-within": {
      borderColor: "#a5b4fc",
      boxShadow: "0 0 0 2px rgba(165, 180, 252, 0.5)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    maxHeight: 200,
    overflowY: "auto",
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#e0e7ff" : state.isFocused ? "#f3f4f6" : "white",
    color: "#1f2937",
    padding: "0.75rem 1rem",
    "&:hover": {
      backgroundColor: "#f3f4f6",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1f2937",
  }),
};

export default function Evenementform({ onNext, isPublic, isExit }) {
  const { darkMode } = useDarkMode();
  const [form, setForm] = useState({
    nom: "",
    type: "",
    theme: "",
    date: "",
    date_fin: "",
    locationId: "",
    salleId: "",
    isPublic: isPublic || false,
  });

  const [customType, setCustomType] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalLieuOpen, setModalLieuOpen] = useState(false);
  const [searchLieu, setSearchLieu] = useState("");
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  const [activeTab, setActiveTab] = useState('default');
  const [newLocation, setNewLocation] = useState({ nom: '', latitude: '', longitude: '', createurId: 0 });
  const [customMarker, setCustomMarker] = useState(null);
  const [geocodeAddress, setGeocodeAddress] = useState("");
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeResultText, setGeocodeResultText] = useState("");
  const markerRef = useRef(null);

  const { isAuthenticated, user } = useStateContext();

  useEffect(() => {
    getLocations()
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const dateDebut = new Date(form.date);
    const dateFin = new Date(form.date_fin);

    if (dateDebut < now) {
      setError("La date de début doit être aujourd'hui ou dans le futur.");
      return;
    }

    if (dateFin < now) {
      setError("La date de fin doit être aujourd'hui ou dans le futur.");
      return;
    }

    if (dateDebut >= dateFin) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    const finalType = form.type === "autre" ? customType : form.type;
    const finalTheme = form.theme === "autre" ? customTheme : form.theme;

    try {
      const event = await createEvent({
        ...form,
        type: finalType,
        theme: finalTheme,
        isPublic: form.isPublic,
      });
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
      });
      setCustomType("");
      setCustomTheme("");

      onNext && onNext({ eventId: event.id });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Erreur lors de la création de l'événement.";
      setError(errorMessage);
    }
  };

  const selectedSalleName = () =>
    salles.find((s) => s.id === form.salleId)?.nom || "";
  const selectedLocationName = () =>
    locations.find((l) => l.id === form.locationId)?.nom || "";

  const filteredLocations = locations.filter((loc) =>
    loc.nom.toLowerCase().includes(searchLieu.toLowerCase())
  );

  const handleSelectLieu = (loc) => {
    setSelectedLieu(loc);
    if (mapRef.current && loc.latitude && loc.longitude) {
      mapRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 13);
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
        setNewLocation({ ...newLocation, nom: display_name, latitude, longitude });
        setCustomMarker({ lat: latitude, lng: longitude });
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
        const query = newLocation.nom; // Use the location name as the query for geocoding
        const createurId = isAuthenticated && user?.id ? user.id : 0; // Use authenticated user ID or 0 for admin
        saveLocation(query, createurId) // Call saveLocation with query and createurId
          .then((createdLoc) => {
            setLocations([...locations, createdLoc]);
            setForm({ ...form, locationId: createdLoc.id, salleId: "" });
            setModalLieuOpen(false);
            setCustomMarker(null);
            setNewLocation({ nom: '', latitude: '', longitude: '', createurId: user?.id || 0 });
            setGeocodeAddress("");
            setGeocodeResult(null);
            setGeocodeResultText("");
            toast.success("Nouveau lieu créé avec succès !");
          })
          .catch((error) => {
            setError(error || "Erreur lors de la création du lieu.");
          });
      } else {
        setError("Veuillez remplir le nom et sélectionner un point sur la carte.");
      }
    }
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
            setGeocodeResult({
              nom: data.display_name,
              latitude: lat,
              longitude: lng
            });
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
          map.removeLayer(markerRef.current);
          markerRef.current = null;
        }
      };
    }, [map]);

    return null;
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTab === 'specify') {
      // Handled by MapClickHandler
    } else {
      map.off('click');
    }
  }, [activeTab]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">
          Créer un événement
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Décrivez votre événement pour commencer l'organisation.
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-7"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Nom de l'événement
            </label>
            <input
              name="nom"
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: textControll(e.target.value) });
              }}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Type d'événement
            </label>
            <Select
              options={EVENT_TYPES}
              value={EVENT_TYPES.find((t) => t.value === form.type) || null}
              onChange={(selected) =>
                handleChange({
                  target: { name: "type", value: selected?.value || "" },
                })
              }
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
                className="mt-2 border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Thème
            </label>
            <Select
              options={EVENT_THEMES}
              value={EVENT_THEMES.find((t) => t.value === form.theme) || null}
              onChange={(selected) =>
                handleChange({
                  target: { name: "theme", value: selected?.value || "" },
                })
              }
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
                className="mt-2 border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="datetime-local"
              name="date_fin"
              value={form.date_fin}
              onChange={handleChange}
              required
              min={new Date().toISOString().slice(0, 16)}
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Lieu
            </label>
            <input
              type="text"
              value={selectedLocationName()}
              readOnly
              onClick={() => setModalLieuOpen(true)}
              placeholder="Sélectionnez un lieu"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 cursor-pointer focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Salle
            </label>
            <input
              type="text"
              value={selectedSalleName()}
              readOnly
              disabled={!form.locationId}
              onClick={() => form.locationId && setModalSalleOpen(true)}
              placeholder="Sélectionnez une salle"
              className={`border border-gray-300 rounded-xl px-5 py-3 text-gray-900 placeholder-gray-400 transition ${form.locationId
                ? "cursor-pointer bg-gray-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                : "bg-gray-200 cursor-not-allowed"
                }`}
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-4 flex flex-col md:flex-row gap-4">
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition"
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

      {/* Modal salles */}
      {modalSalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => setModalSalleOpen(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">
              Choisissez une salle
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {salles.map((salle) => (
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
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal lieu avec carte */}
      {modalLieuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-7xl bg-white shadow-2xl rounded-2xl p-8">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
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
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">
              Choisissez un lieu
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('default');
                      setCustomMarker(null);
                      setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
                      setGeocodeAddress("");
                      setGeocodeResult(null);
                      setGeocodeResultText("");
                    }}
                    className={`flex-1 py-2 rounded-xl font-semibold transition ${activeTab === 'default'
                      ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
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
                    }}
                    className={`flex-1 py-2 rounded-xl font-semibold transition ${activeTab === 'specify'
                      ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
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
                        className="w-full border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-xl">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((loc) => (
                          <div
                            key={loc.id}
                            onClick={() => handleSelectLieu(loc)}
                            className={`px-4 py-3 cursor-pointer border-b border-gray-200 hover:bg-indigo-100 ${selectedLieu?.id === loc.id ? "bg-indigo-50" : ""
                              }`}
                          >
                            {loc.nom}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Aucun lieu trouvé
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={geocodeAddress}
                      onChange={(e) => setGeocodeAddress(e.target.value)}
                      placeholder="Entrez une adresse à rechercher"
                      className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleGeocode}
                        className="flex-1 bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Rechercher
                      </button>
                      <button
                        onClick={() => {
                          setSearchLieu("");
                          setSelectedLieu(null);
                          setCustomMarker(null);
                          setNewLocation({ nom: '', latitude: '', longitude: '', createurId: 0 });
                          setGeocodeAddress("");
                          setGeocodeResult(null);
                          setGeocodeResultText("");
                          setActiveTab('specify');
                        }}
                        disabled={activeTab === 'default' ? !selectedLieu : !newLocation.nom || !newLocation.latitude}
                        className="flex-1 bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reinitialiser
                      </button>
                    </div>
                    {geocodeResultText && (
                      <p className="text-gray-500 text-sm">{geocodeResultText}</p>
                    )}
                    <p className="text-gray-500 text-sm">Cliquez sur la carte pour sélectionner les coordonnées du nouveau lieu et obtenir l'adresse automatiquement.</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmLieu}
                    disabled={activeTab === 'default' ? !selectedLieu : !newLocation.nom || !newLocation.latitude}
                    className="flex-1 bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-96 rounded-lg overflow-hidden">
                <MapContainer
                  center={[48.8566, 2.3522]} // Paris par défaut
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
                    <Marker
                      position={[parseFloat(selectedLieu.latitude), parseFloat(selectedLieu.longitude)]}
                      icon={blueIcon}
                    >
                      <Popup>{selectedLieu.nom}</Popup>
                    </Marker>
                  )}
                  {activeTab === 'specify' && customMarker && (
                    <Marker
                      position={[customMarker.lat, customMarker.lng]}
                      icon={blueIcon}
                    >
                      <Popup>Nouveau lieu</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}