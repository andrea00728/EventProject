import { useEffect, useState } from "react";
import { getTablesByEventId, getAvailableSeats, createTable } from "../services/tableService";
import { getMyEvents } from "../services/evenementServ";
import { useStateContext } from "../context/ContextProvider";
import { getMaxCapacity } from "../services/controll_champs/controll_champs";

const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", icon: <svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3"/></svg> },
  { value: "rectangle", label: "Table rectangulaire", icon: <svg width="48" height="48" viewBox="0 0 48 48"><rect x="8" y="16" width="32" height="16" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3"/></svg> },
  { value: "ovale", label: "Table ovale", icon: <svg width="48" height="48" viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="16" ry="10" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3"/></svg> },
  { value: "carree", label: "Table carrée", icon: <svg width="48" height="48" viewBox="0 0 48 48"><rect x="12" y="12" width="24" height="24" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3"/></svg> },
];

export default function TableCreation({ eventId, onNext, onBack }) {
  const { token } = useStateContext();

  const [tables, setTables] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ capacite: "", type: "ronde", nombre: "", noms: [], eventId: 0 });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("ronde");

  // Charger événements
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents(token);
        setEvents(data);
      } catch (err) {
        setEventError(err.response?.data?.message || "Impossible de charger les événements");
      } finally {
        setIsLoadingEvents(false);
      }
    };
    if (token) fetchEvents();
  }, [token]);

  // Charger les tables existantes
  const loadTables = async () => {
    if (!selectedEvent?.id || !token) return;
    try {
      const data = await getTablesByEventId(selectedEvent.id, token);
      const withSeats = await Promise.all(
        data.map(async (t) => {
          const available = await getAvailableSeats(t.id);
          return { ...t, available };
        })
      );
      setTables(withSeats);
    } catch (err) {
      console.error("Erreur chargement tables", err);
    }
  };

  useEffect(() => {
    if (selectedEvent) loadTables();
  }, [selectedEvent, token]);

  // Gestion formulaire
  // const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "capacite") {
      const numericValue = parseInt(value, 10);
      const max = getMaxCapacity(form.type);
      if (numericValue > max) {
        setError(`La capacité maximale pour une table ${form.type} est ${max}`);
        return;
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: numericValue });
      return;
    }
  
    if (name === "type") {
      const max = getMaxCapacity(value);
      const newCapacite = Math.min(form.capacite, max);
      if (form.capacite > max) {
        setError(`Capacité ajustée à ${newCapacite} pour le type ${value}`);
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: value, capacite: newCapacite });
      return;
    }
  
    setForm({ ...form, [name]: value });
  };

  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm(prev => ({ ...prev, nombre: nb, noms: Array(nb).fill("") }));
  };
  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm(prev => ({ ...prev, noms: updatedNoms }));
  };
  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm(prev => ({ ...prev, eventId: event.id }));
  };

  const handleSubmitTables = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      return;
    }
    try {
      const tablesArray = form.noms.map(nom => ({
        nom,
        capacite: form.capacite,
        type: selectedType,
        eventId: form.eventId
      }));
      for (const t of tablesArray) {
        await createTable(t, token);
      }
      setSuccessMessage("Tables créées avec succès");
      setForm({ capacite: "", type: "ronde", nombre: "", noms: [], eventId: form.eventId });
      await loadTables();
    } catch (err) {
      // setError(err.response?.data?.message || "Erreur création tables");
      if(err.response?.data?.message?.includes("capacité maximale")){
        setError(err.response?.data?.message);
      } else {
        setError(err.response?.data?.message || "Erreur lors de la création des tables");
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-10 px-4">
      {/* Formulaire création tables */}
      <form className="w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 mb-8" onSubmit={handleSubmitTables}>
        <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-800">Créer des tables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Capacité</label>
            <input type="number" name="capacite" value={form.capacite} onChange={handleChange} min="1" placeholder="Ex: 4" required className="border border-gray-200 rounded-lg px-4 py-3" />
             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Nombre de tables</label>
            <input type="number" name="nombre" value={form.nombre} onChange={handleNombreChange} min="1" placeholder="Ex: 4" required className="border border-gray-200 rounded-lg px-4 py-3" />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
            <select className="border border-gray-200 rounded-lg px-4 py-3" value={selectedEvent?.id || ""} onChange={e => selectEvent(events.find(ev => ev.id === Number(e.target.value)))} required>
              <option value="" disabled>Sélectionner un événement</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.nom} ({new Date(ev.date).toLocaleDateString()})</option>)}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-2 text-sm">Type de table</label>
            <select className="border border-gray-200 rounded-lg px-4 py-3" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              {TABLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Saisie noms */}
        {form.noms.length > 0 && (
          <div className="mt-6 space-y-4">
            {form.noms.map((nom, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-700 font-medium mb-2 text-sm">Nom Table {index + 1}</label>
                <input value={nom} onChange={e => handleNomChange(index, e.target.value)} placeholder={`Ex: Table ${index + 1}`} required className="border border-gray-200 rounded-lg px-4 py-3" />
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {successMessage && <p className="text-green-600 mt-4 text-center">{successMessage}</p>}

        <div className="mt-6 flex gap-4">
          {onBack && <button type="button" onClick={onBack} className="bg-gray-200 text-indigo-800 px-6 py-2 rounded-xl font-semibold">Retour</button>}
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Ajouter les tables</button>
        </div>
      </form>

      {/* Affichage tables existantes */}
      {tables.length > 0 && (
        <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <h3 className="text-2xl font-bold text-indigo-700 mb-6">Tables créées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map(table => {
              const typeObj = TABLE_TYPES.find(t => t.value === table.type);
              return (
                <div key={table.id} className="rounded-xl border-2 border-indigo-100 bg-indigo-50 p-6 flex flex-col items-center shadow hover:shadow-lg transition">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-200 mb-3 text-2xl font-bold text-indigo-800 shadow">{table.nom}</div>
                  <div className="text-lg font-semibold text-indigo-900 mb-2">Capacité : {table.capacite}</div>
                  <div className="text-sm text-gray-600 mb-1">Places disponibles : <span className="font-bold text-green-700">{table.available}</span></div>
                  <div className="text-sm text-gray-500">Type : {typeObj?.label || table.type}</div>
                  <div className="mt-2"><span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{typeObj?.icon}{typeObj?.label}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tables.length > 0 && onNext && (
        <button onClick={onNext} className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold shadow hover:bg-green-700 transition">Étape suivante : Ajouter des invités</button>
      )}
    </div>
  );
}
