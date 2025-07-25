import React, { useEffect, useState } from "react";
import { createEvent, getLocations, getSallesByLocation } from "../services/evenementServ";
import { textControll } from "../services/controll_champs/controll_champs";
import { Calendar, MapPin, Users, Palette, Clock, Building, Sparkles, X, Check } from "lucide-react";

const EVENT_TYPES = [
  { value: "mariage", label: "Mariage", color: "bg-pink-100 text-pink-700", icon: "💍" },
  { value: "reunion", label: "Réunion", color: "bg-blue-100 text-blue-700", icon: "🤝" },
  { value: "anniversaire", label: "Anniversaire", color: "bg-purple-100 text-purple-700", icon: "🎂" },
  { value: "engagement", label: "Engagement", color: "bg-green-100 text-green-700", icon: "💎" },
  { value: "autre", label: "Autre", color: "bg-gray-100 text-gray-700", icon: "🎪" },
];

export default function Evenementform({ onNext }) {
  const [form, setForm] = useState({
    nom: "",
    type: "",
    theme: "",
    date: "",
    date_fin: "",
    locationId: "",
    salleId: "",
    isPublic: false,
  });

  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocations()
      .then(data => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    if (form.locationId) {
      getSallesByLocation(form.locationId)
        .then(setSalles)
        .catch(() => setSalles([]));
    }
  }, [form.locationId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (new Date(form.date) >= new Date(form.date_fin)) {
      setError("La date de fin doit être après la date de début.");
      setLoading(false);
      return;
    }

    try {
      const event = await createEvent({ ...form, isPublic: form.isPublic });
      onNext && onNext({ eventId: event.id });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Erreur lors de la création de l'événement.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedLocationName = () => locations.find(l => l.id === form.locationId)?.nom || "";
  const selectedSalleName = () => salles.find(s => s.id === form.salleId)?.nom || "";
  const selectedTypeData = () => EVENT_TYPES.find(t => t.value === form.type);

  return (
    <div className="w-400 max-w-4xl mx-auto mt-12 px-6">
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-indigo-50/30 to-white/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl mb-6 shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4 tracking-tight">
              Créer un événement
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Donnez vie à votre vision et créez un événement mémorable en quelques étapes simples.
            </p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="text-white" size={16} />
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Nom de l'événement */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Sparkles className="text-blue-500" size={20} />
                <span>Nom de l'événement</span>
              </label>
              <input
                name="nom"
                value={form.nom}
                onChange={(e) => {
                  setForm({ ...form, nom: textControll(e.target.value) })
                }}
                placeholder="Ex: Mariage de Sarah & Paul"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Type d'événement */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Users className="text-purple-500" size={20} />
                <span>Type d'événement</span>
              </label>
              <input
                name="type"
                value={EVENT_TYPES.find(t => t.value === form.type)?.label || "Type d'événement"}
                readOnly
                onClick={() => setModalTypeOpen(true)}
                placeholder="Type d'événement"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Thème */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Palette className="text-pink-500" size={20} />
                <span>Thème</span>
              </label>
              <input
                name="theme"
                value={form.theme}
                onChange={handleChange}
                placeholder="Ex: Chic, Bohème, Classique..."
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Date de début */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Calendar className="text-green-500" size={20} />
                <span>Date de début</span>
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-400 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Date de fin */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Clock className="text-red-500" size={20} />
                <span>Date de fin</span>
              </label>
              <input
                type="datetime-local"
                name="date_fin"
                value={form.date_fin}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-400 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Lieu */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <MapPin className="text-indigo-500" size={20} />
                <span>Lieu</span>
              </label>
              <input
                type="text"
                value={selectedLocationName()}
                readOnly
                onClick={() => setModalOpen(true)}
                placeholder="Où se déroulera l'événement ?"
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 bg-white/80 backdrop-blur-sm cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md group-hover:border-gray-300"
              />
            </div>

            {/* Salle */}
            <div className="group">
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800 mb-3">
                <Building className="text-teal-500" size={20} />
                <span>Salle</span>
              </label>
              <input
                type="text"
                value={selectedSalleName()}
                readOnly
                disabled={!form.locationId}
                onClick={() => form.locationId && setModalSalleOpen(true)}
                placeholder="Salle"
                className={`w-full border-2 border-gray-200 rounded-2xl px-6 py-4 transition-all duration-300 shadow-sm ${form.locationId
                    ? "cursor-pointer bg-white/80 backdrop-blur-sm hover:shadow-md group-hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-teal-200 focus:border-teal-400"
                    : "bg-gray-100 cursor-not-allowed opacity-60"
                  } text-gray-700 placeholder-gray-400`}
              />
            </div>

            {/* Événement public */}
            <div className="group flex items-center gap-4 pt-8">
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleChange}
                className="w-6 h-6 text-purple-600 bg-gray-50 border-2 border-gray-200 rounded-lg focus:ring-purple-500 focus:ring-2 transition-all duration-300"
              />
              <label className="flex items-center space-x-2 text-lg font-bold text-gray-800">
                <Users className="text-purple-500" size={20} />
                <span>Événement public ?</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2 mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`
                  group relative w-full overflow-hidden
                  bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400
                  hover:from-blue-500 hover:via-purple-500 hover:to-pink-500
                  text-white px-8 py-5 rounded-2xl font-bold text-xl tracking-wide 
                  transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 
                  active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-200
                  ${loading ? 'opacity-70 cursor-not-allowed transform-none' : ''}
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                
                <div className="flex items-center justify-center space-x-3 relative z-10">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <Check size={24} />
                      <span>Créer l'événement</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal lieux - Version améliorée */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-500/20 rounded-3xl p-10 border border-white/30 mx-4">
            <button
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              onClick={() => setModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
                Choisissez un lieu
              </h3>
              <p className="text-gray-600">Sélectionnez l'emplacement parfait pour votre événement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setForm({ ...form, locationId: loc.id, salleId: "" });
                    setModalOpen(false);
                  }}
                  className="group border-2 border-purple-100 rounded-2xl px-6 py-4 text-center bg-gradient-to-br from-purple-50 to-indigo-50/50 text-purple-800 cursor-pointer hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 font-semibold transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="text-purple-600 group-hover:text-purple-700" size={18} />
                    <span className="group-hover:text-purple-900 transition-colors duration-200">
                      {loc.nom}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal salles - Version améliorée */}
      {modalSalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-500/20 rounded-3xl p-10 border border-white/30 mx-4">
            <button
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-2xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              onClick={() => setModalSalleOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
                Choisissez une salle
              </h3>
              <p className="text-gray-600">Trouvez l'espace idéal pour accueillir vos invités</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salles.map(salle => (
                <div
                  key={salle.id}
                  onClick={() => {
                    setForm({ ...form, salleId: salle.id });
                    setModalSalleOpen(false);
                  }}
                  className="group border-2 border-purple-100 rounded-2xl px-6 py-4 text-center bg-gradient-to-br from-purple-50 to-indigo-50/50 text-purple-800 cursor-pointer hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 font-semibold transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Building className="text-purple-600 group-hover:text-purple-700" size={18} />
                    <span className="group-hover:text-purple-900 transition-colors duration-200">
                      {salle.nom}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour le type d'événement - Version améliorée */}
      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-purple-500/20 p-10 w-[90vw] max-w-4xl mx-4 border border-white/30">
            <button
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              onClick={() => setModalTypeOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="text-center mb-10">
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
                Choisissez le type d'événement
              </h3>
              <p className="text-xl text-gray-600">Quel type d'événement souhaitez-vous organiser ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`group flex flex-col items-center justify-center rounded-2xl p-8 border-2 border-transparent hover:border-purple-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 ${type.color} shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 ${form.type === type.value ? 'ring-4 ring-purple-400 border-purple-400 scale-105' : ''
                    }`}
                  onClick={() => {
                    setForm({ ...form, type: type.value });
                    setModalTypeOpen(false);
                  }}
                >
                  <span className="text-4xl mb-3 transition-all duration-200 group-hover:scale-110">
                    {type.icon}
                  </span>
                  <span className="text-xl font-bold mb-3 transition-all duration-200 group-hover:scale-110">
                    {type.label}
                  </span>
                  <span className="text-sm uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                    {type.value}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                className="px-8 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all duration-200 hover:scale-105"
                onClick={() => setModalTypeOpen(false)}
                type="button"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}