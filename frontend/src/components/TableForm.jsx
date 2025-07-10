import { useState } from "react";

// Types de tables avec schéma SVG
const TABLE_TYPES = [
  {
    value: "ronde",
    label: "Table ronde",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" className="mx-auto">
        <circle cx="24" cy="24" r="16" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "rectangle",
    label: "Table rectangulaire",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" className="mx-auto">
        <rect x="8" y="16" width="32" height="16" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "ovale",
    label: "Table ovale",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" className="mx-auto">
        <ellipse cx="24" cy="24" rx="16" ry="10" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "carree",
    label: "Table carrée",
    icon: (
      <svg width="32" height="32" viewBox="0 0 48 48" className="mx-auto">
        <rect x="12" y="12" width="24" height="24" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
];

export default function CreateTable({ onSubmitTable }) {
  const [form, setForm] = useState({ numero: "", capacite: "" });
  const [selectedType, setSelectedType] = useState(TABLE_TYPES[0].value);
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setShowAlert(false);
    try {
      await onSubmitTable({
        ...form,
        type: selectedType,
      });
      setForm({ numero: "", capacite: "" });
    } catch (err) {
      if (err.message && err.message.includes("déjà utilisé")) {
        setShowAlert(true);
      } else {
        setError("Erreur lors de la création de la table");
      }
    }
  };

  const closeAlert = () => setShowAlert(false);

  const selectedTypeObj = TABLE_TYPES.find((t) => t.value === selectedType);

  return (
    <div className="relative">
      <form onSubmit={onSubmit} className="p-8 bg-gray-50 max-w-md mx-auto shadow-lg rounded-xl mb-10 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Créer une Table</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-2">Numéro de Table</label>
            <input
              id="numero"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              placeholder="Ex: 1, 2, A, B..."
              required
              className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="capacite" className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
            <input
              id="capacite"
              name="capacite"
              type="number"
              value={form.capacite}
              onChange={handleChange}
              placeholder="Ex: 4, 6, 8"
              required
              min="1"
              className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
            />
          </div>
          {/* Affiche le type sélectionné */}
          <div className="flex flex-col md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de Table</label>
            <div
              className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition"
              onClick={() => setModalTypeOpen(true)}
              title="Changer le type de table"
            >
              {selectedTypeObj?.icon}
              <span className="font-semibold text-indigo-700 capitalize">{selectedTypeObj?.label}</span>
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 mt-1">Cliquez pour changer le type</span>
          </div>
        </div>
        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors duration-200"
          >
            Ajouter Table
          </button>
        </div>
        {error && (
          <p className="text-red-600 mt-4 text-center flex items-center justify-center gap-2 bg-red-50 p-3 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </form>

      {/* Modal de sélection du type de table */}
      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-2xl relative">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => setModalTypeOpen(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-center mb-8 text-indigo-700">
              Sélectionnez le type de table
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {TABLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-6 border-2 transition shadow-md hover:shadow-lg focus:outline-none ${
                    selectedType === type.value
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-400"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.icon}
                  <span className="text-lg font-semibold mb-2">{type.label}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-8 w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              onClick={() => setModalTypeOpen(false)}
              type="button"
            >
              Valider le type de table
            </button>
          </div>
        </div>
      )}

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-700">Avertissement</h3>
              <button
                onClick={closeAlert}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-900 mb-4">Le numéro de table est déjà utilisé dans cet événement.</p>
            <button
              onClick={closeAlert}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}