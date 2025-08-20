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
  { value: "mariage", label: "Mariage", color: "bg-[#6B46C1]/5 text-[#6B46C1]" },
  { value: "reunion", label: "Réunion", color: "bg-indigo-600/5 text-indigo-600" },
  { value: "anniversaire", label: "Anniversaire", color: "bg-[#6B46C1]/5 text-[#6B46C1]" },
  { value: "engagement", label: "Engagement", color: "bg-indigo-600/5 text-indigo-600" },
  { value: "autre", label: "Autre", color: "bg-gray-50 text-gray-600" },
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
    <div className="max-w-4xl mx-auto mt-12 px-4 sm:px-8">
      <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100/50">
        <h2 className="text-2xl font-bold text-center mb-3 text-[#6B46C1] tracking-tight">
          Créer un événement
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm font-medium">
          Organisez votre événement en quelques étapes simples.
        </p>

        {error && (
          <p className="text-red-500 text-center mb-6 bg-red-50/50 py-2.5 px-4 rounded-xl text-sm font-medium">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Nom de l'événement</label>
            <input
              name="nom"
              value={form.nom}
              onChange={(e) => {
                setForm({ ...form, nom: textControll(e.target.value) });
              }}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
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
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white cursor-pointer focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
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
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Date de début</label>
            <input
              type="datetime-local"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-800">Date de fin</label>
            <input
              type="datetime-local"
              name="date_fin"
              value={form.date_fin}
              onChange={handleChange}
              required
              className="border border-gray-200 rounded-xl px-4 py-3.5 bg-white focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow focus:shadow-md"
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
          <div className="col-span-1 md:col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-[#6B46C1] text-white font-semibold py-3.5 rounded-xl shadow-md hover:bg-[#5a3aa6] focus:ring-2 focus:ring-[#6B46C1]/50 transition-all duration-200"
            >
              Créer l'événement
            </button>
          </div>
        </form>
      </div>

      {modalSalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">
            <button
              className="absolute top-3 right-3 text-xl font-semibold text-gray-500 hover:text-red-500 transition-colors duration-150"
              onClick={() => setModalSalleOpen(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-center mb-5 text-[#6B46C1]">Choisissez une salle</h3>
            <div className="grid grid-cols-2 gap-3">
              {salles.map((salle) => (
                <div
                  key={salle.id}
                  onClick={() => {
                    setForm({ ...form, salleId: salle.id });
                    setModalSalleOpen(false);
                  }}
                  className="border border-[#6B46C1]/10 rounded-xl px-3 py-2.5 text-center bg-[#6B46C1]/5 text-[#6B46C1] cursor-pointer hover:bg-[#6B46C1]/10 hover:border-[#6B46C1]/50 font-medium transition-all duration-150"
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

      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-center mb-5 text-[#6B46C1]">
              Choisissez le type d'événement
            </h3>
            <div className="grid grid-cols-2 gap-3">
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
                  <span className="text-sm font-medium mb-1">{type.label}</span>
                  <span className="text-xs uppercase tracking-wide">{type.value}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-5 w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 font-medium hover:bg-gray-100 transition-all duration-150"
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