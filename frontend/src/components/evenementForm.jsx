import React, { useEffect, useState, useRef } from "react";
import { createEvent, getLocations, getSallesByLocation } from "../services/evenementServ";
import { textControll } from "../services/controll_champs/controll_champs";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom blue marker icon
const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const EVENT_TYPES = [
  { value: "mariage", label: "Mariage", color: "bg-pink-100 text-pink-700" },
  { value: "reunion", label: "Réunion", color: "bg-blue-100 text-blue-700" },
  { value: "anniversaire", label: "Anniversaire", color: "bg-yellow-100 text-yellow-700" },
  { value: "engagement", label: "Engagement", color: "bg-green-100 text-green-700" },
  { value: "autre", label: "Autre", color: "bg-gray-100 text-gray-700" },
];

// function LocationAutocomplete({ locations, form, setForm }) {
//   const [inputValue, setInputValue] = useState("");
//   const [filteredLocations, setFilteredLocations] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const containerRef = useRef(null);

//   // Met à jour inputValue quand form.locationId change
//   useEffect(() => {
//     const loc = locations.find((l) => l.id === form.locationId);
//     setInputValue(loc ? loc.nom : "");
//   }, [form.locationId, locations]);

//   // Filtrer suggestions selon inputValue (non sensible à la casse)
//   useEffect(() => {
//     if (!inputValue.trim()) {
//       setFilteredLocations([]);
//       return;
//     }
//     const filtered = locations.filter((loc) =>
//       loc.nom.toLowerCase().startsWith(inputValue.toLowerCase())
//     );
//     setFilteredLocations(filtered);
//   }, [inputValue, locations]);

//   // Fermer suggestions si clic en dehors
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setShowSuggestions(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSelect = (loc) => {
//     setInputValue(loc.nom);
//     setForm({ ...form, locationId: loc.id, salleId: "" });
//     setShowSuggestions(false);
//   };

//   return (
//     <div className="flex flex-col gap-2 relative" ref={containerRef}>
//       <label className="text-sm font-semibold text-gray-700 mb-1">Lieu</label>
//       <input
//         type="text"
//         className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
//         value={inputValue}
//         onChange={(e) => {
//           setInputValue(e.target.value);
//           setShowSuggestions(true);
//           setForm({ ...form, locationId: "", salleId: "" }); // reset locationId tant que rien sélectionné
//         }}
//         onFocus={() => inputValue && setShowSuggestions(true)}
//         placeholder="Commencez à taper un lieu..."
//         autoComplete="off"
//         required
//       />
//       {showSuggestions && filteredLocations.length > 0 && (
//         <ul className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-300 rounded-xl shadow max-h-60 overflow-y-auto">
//           {filteredLocations.map((loc) => (
//             <li
//               key={loc.id}
//               className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
//               onMouseDown={() => handleSelect(loc)}
//             >
//               {loc.nom}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

export default function Evenementform({ onNext , isPublic}) {
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

  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [modalLieuOpen, setModalLieuOpen] = useState(false);
  const [searchLieu, setSearchLieu] = useState("");
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

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
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.date) >= new Date(form.date_fin)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    try {
      const event = await createEvent({ ...form, isPublic: form.isPublic });
      onNext && onNext({ eventId: event.id });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors de la création de l'événement.";
      setError(errorMessage);
    }
  };

  const selectedSalleName = () => salles.find((s) => s.id === form.salleId)?.nom || "";
  const selectedLocationName = () => locations.find((l) => l.id === form.locationId)?.nom || "";

  const filteredLocations = locations.filter((loc) =>
    loc.nom.toLowerCase().includes(searchLieu.toLowerCase())
  );

  const handleSelectLieu = (loc) => {
    setSelectedLieu(loc);
    if (mapRef.current && loc.latitude && loc.longitude) {
      mapRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 13);
    }
  };

  const handleConfirmLieu = () => {
    if (selectedLieu) {
      setForm({ ...form, locationId: selectedLieu.id, salleId: "" });
      setModalLieuOpen(false);
      setSelectedLieu(null);
      setSearchLieu("");
    }
  };

  return (
    <div className="w-400 max-w-3xl mx-auto mt-12 px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">
          Créer un événement
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Décrivez votre événement pour commencer l'organisation.
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Nom de l'événement</label>
            <input
              name="nom"
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: textControll(e.target.value) });
              }}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Type d'événement</label>
            <input
              name="type"
              value={EVENT_TYPES.find((t) => t.value === form.type)?.label || "Type d'événement"}
              readOnly
              onClick={() => setModalTypeOpen(true)}
              placeholder="Type d'événement"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-pink-400 transition"
            />
          </div>


          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Thème</label>
            <input
              name="theme"
              value={form.theme}
              onChange={handleChange}
              placeholder="Ex: Chic, Bohème, Classique..."
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Date de début</label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
            <input
              type="datetime-local"
              name="date_fin"
              value={form.date_fin}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Lieu</label>
            <input
              type="text"
              value={selectedLocationName()}
              readOnly
              onClick={() => setModalLieuOpen(true)}
              placeholder="Sélectionnez un lieu"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 cursor-pointer focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Salle</label>
            <input
              type="text"
              value={selectedSalleName()}
              readOnly
              disabled={!form.locationId}
              onClick={() => form.locationId && setModalSalleOpen(true)}
              placeholder="Salle"
              className={`border border-gray-300 rounded-xl px-5 py-3 ${form.locationId ? "cursor-pointer bg-gray-50" : "bg-gray-200"
                } focus:ring-2 focus:ring-indigo-200 transition`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Événement public ?</label>
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>

          <div className="col-span-1 md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition"
            >
              Créer l'événement
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
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez une salle</h3>
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
      {/* Modal de la carte */}
      {modalLieuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-7xl bg-white shadow-2xl rounded-2xl p-8">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => {
                setModalLieuOpen(false);
                setSearchLieu("");
                setSelectedLieu(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez un lieu</h3>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Liste des lieux à gauche */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchLieu}
                    onChange={(e) => setSearchLieu(e.target.value)}
                    placeholder="Rechercher un lieu..."
                    className="w-full border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
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
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmLieu}
                    disabled={!selectedLieu}
                    className="flex-1 bg-indigo-700 text-white font-bold py-3 rounded-xl shadow hover:bg-indigo-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={() => {
                      setModalLieuOpen(false);
                      setSearchLieu("");
                      setSelectedLieu(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow hover:bg-gray-300 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
              {/* Carte à droite */}
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
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {selectedLieu && selectedLieu.latitude && selectedLieu.longitude && (
                    <Marker
                      position={[parseFloat(selectedLieu.latitude), parseFloat(selectedLieu.longitude)]}
                      icon={blueIcon}
                    >
                      <Popup>{selectedLieu.nom}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal type d'événement */}
      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-2xl">
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez le type d'événement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-6 border-2 border-transparent hover:border-pink-400 transition ${type.color} shadow-md hover:shadow-lg focus:outline-none ${form.type === type.value ? "ring-2 ring-pink-400" : ""
                    }`}
                  onClick={() => {
                    setForm({ ...form, type: type.value });
                    setModalTypeOpen(false);
                  }}
                >
                  <span className="text-lg font-semibold mb-2">{type.label}</span>
                  <span className="text-xs uppercase tracking-wider">{type.value}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-8 w-full py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              onClick={() => setModalTypeOpen(false)}
              type="button"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}