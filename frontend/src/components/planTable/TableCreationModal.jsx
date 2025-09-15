import { useState } from "react";
import { getMaxCapacity } from "../../services/controll_champs/controll_champs";
import { createTable } from "../../services/tableService";
import { TABLE_TYPES } from "./constant";


// Modal pour créer des tables
function TableCreationModal({ isOpen, onClose, onAddTables, events, tables, eventId }) {
  const [form, setForm] = useState({
    capacite: "",
    type: "ronde",
    nombre: "",
    noms: [],
    eventId: eventId || 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill("")
    }));
  };

  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

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

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm((prev) => ({ ...prev, eventId: event.id }));
  };

  // Fonction onSubmit corrigée pour TableCreationModal (ligne ~759)
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      toast.error("Veuillez sélectionner un événement");
      return;
    }

    try {
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `Table ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom, index) => {
        const typeInfo = TABLE_TYPES.find((t) => t.value === form.type) || TABLE_TYPES[0];

        return {
          nom,
          type: form.type,
          capacite: Number(form.capacite),
          eventId: Number(form.eventId),
          position: {
            left: 100 + index * 20,
            top: 100 + index * 20,
          },
          width: typeInfo.width,
          height: typeInfo.height,
          rotation: 0,
        };
      });

      const response = await Promise.all(formDataArray.map((t) => createTable(t)));
      const newTables = response.flat();

      const formattedTables = newTables.map((table) => ({
        id: table.id || table.tableId,
        nom: table.nom || table.name,
        capacite: table.capacite || table.capacity,
        type: table.type,
        eventId: Number(table.eventId),
        position: table.position || { left: 100, top: 100 },
        width: table.width || TABLE_TYPES.find((t) => t.value === table.type).width,
        height: table.height || TABLE_TYPES.find((t) => t.value === table.type).height,
        rotation: table.rotation || 0,
        guests: table.guests || [],
      }));

      onAddTables(formattedTables);
      onClose();

      toast.success(`${nomsFinal.length} table${nomsFinal.length > 1 ? "s" : ""} créée${nomsFinal.length > 1 ? "s" : ""} avec succès !`);
    } catch (err) {
      console.error("Erreur création tables:", err);
      setError(err.response?.data?.message || "Erreur lors de la création des tables");
      toast.error(err.response?.data?.message || "Erreur lors de la création des tables");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer des Tables</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Capacité</label>
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={handleChange}
                placeholder="Ex: 4, 6, 8"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Nombre de tables</label>
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleNombreChange}
                placeholder="Ex: 4"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Type de Table</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="ronde">Ronde</option>
                <option value="carree">Carrée</option>
                <option value="rectangle">Rectangle</option>
                <option value="ovale">Ovale</option>
                <option value="triangle">Triangulaire</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                value={form.eventId}
                onChange={(e) => {
                  const eventId = Number(e.target.value);
                  const event = events.find(ev => ev.id === eventId);
                  if (event) selectEvent(event);
                }}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} ({new Date(event.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.noms.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Noms des tables</h3>
              {form.noms.map((nom, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">
                    Nom Table {index + 1}
                  </label>
                  <input
                    value={nom}
                    onChange={(e) => handleNomChange(index, e.target.value)}
                    placeholder={`Table ${index + 1}`}
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Créer les Tables
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableCreationModal