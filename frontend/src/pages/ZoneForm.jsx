import React, { useState } from "react";

export default function ZoneForm({ eventId, onBack }) {
  const [zones, setZones] = useState([{ name: "VIP", capacity: 50 }]);

  const addZone = () => {
    setZones([...zones, { name: "", capacity: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const newZones = [...zones];
    newZones[index][field] = value;
    setZones(newZones);
  };

  const handleSave = () => {
    console.log("Zones enregistrées pour event:", eventId, zones);
    // TODO: API call pour sauvegarder les zones en DB
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Configurer les zones</h2>

      {zones.map((zone, index) => (
        <div key={index} className="flex gap-4 mb-3">
          <input
            type="text"
            placeholder="Nom (ex: VIP, Normal, Étudiants)"
            value={zone.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="Capacité"
            value={zone.capacity}
            onChange={(e) => handleChange(index, "capacity", e.target.value)}
            className="w-32 border rounded px-3 py-2"
          />
        </div>
      ))}

      <div className="flex justify-between mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={onBack}
        >
          Retour
        </button>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 bg-indigo-500 text-white rounded"
            onClick={addZone}
          >
            + Ajouter une zone
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
