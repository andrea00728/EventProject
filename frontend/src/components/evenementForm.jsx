import React, { useEffect, useState } from "react";
import { createEvent, getLocations, getSallesByLocation } from "../services/evenementServ";

const EVENT_TYPES = [
  { value: "mariage", label: "Mariage", color: "bg-pink-100 text-pink-700" },
  { value: "reunion", label: "Réunion", color: "bg-blue-100 text-blue-700" },
  { value: "anniversaire", label: "Anniversaire", color: "bg-yellow-100 text-yellow-700" },
  { value: "engagement", label: "Engagement", color: "bg-green-100 text-green-700" },
  { value: "autre", label: "Autre", color: "bg-gray-100 text-gray-700" },
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
  });

  const [locations, setLocations] = useState([]);
  const [salles, setSalles] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSalleOpen, setModalSalleOpen] = useState(false);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [error, setError] = useState(null);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (new Date(form.date) >= new Date(form.date_fin)) {
      setError("La date de fin doit être après la date de début.");
      return;
    }

    try {
      const event = await createEvent(form);
      onNext && onNext({ eventId: event.id });
    } catch {
      setError("Erreur lors de la création de l'événement.");
    }
  };

  const selectedLocationName = () => locations.find(l => l.id === form.locationId)?.nom || "";
  const selectedSalleName = () => salles.find(s => s.id === form.salleId)?.nom || "";

  return (
    <div className="w-400 max-w-3xl mx-auto mt-12 px-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">Créer un événement</h2>
        <p className="text-center text-gray-500 mb-8">Décrivez votre événement pour commencer l'organisation.</p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Nom de l'événement</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Ex: Mariage de Sarah & Paul"
              required
              className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 mb-1">Type d'événement</label>
            <input
              name="type"
              value={EVENT_TYPES.find(t => t.value === form.type)?.label || "Type d'événement"}
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
              onClick={() => setModalOpen(true)}
              placeholder="Où se déroulera l’événement ?"
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
              className={`border border-gray-300 rounded-xl px-5 py-3 ${form.locationId ? "cursor-pointer bg-gray-50" : "bg-gray-200"} focus:ring-2 focus:ring-indigo-200 transition`}
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

      {/* Modal lieux */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => setModalOpen(false)}
            >×</button>
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez un lieu</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {locations.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setForm({ ...form, locationId: loc.id, salleId: "" });
                    setModalOpen(false);
                  }}
                  className="border-2 border-indigo-100 rounded-xl px-4 py-3 text-center bg-indigo-50 text-indigo-800 cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 font-semibold transition"
                >
                  {loc.nom}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal salles */}
      {modalSalleOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => setModalSalleOpen(false)}
            >×</button>
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez une salle</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {salles.map(salle => (
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

      {/* Modal pour le type d'événement */}
      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-2xl">
            <h3 className="text-xl font-bold text-center mb-6 text-indigo-700">Choisissez le type d'événement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-6 border-2 border-transparent hover:border-pink-400 transition ${type.color} shadow-md hover:shadow-lg focus:outline-none ${form.type === type.value ? 'ring-2 ring-pink-400' : ''}`}
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
