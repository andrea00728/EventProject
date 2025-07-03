import { useState } from "react";

export default function CreateTable({ onSubmitTable }) {
  const [form, setForm] = useState({ numero: "", capacite: "", type: "ronde" });
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
      await onSubmitTable(form);
      setForm({ numero: "", capacite: "", type: "" });
    } catch (err) {
      if (err.message && err.message.includes("déjà utilisé")) {
        setShowAlert(true);
      } else {
        setError("Erreur lors de la création de la table");
      }
    }
  };

  const closeAlert = () => {
    setShowAlert(false);
  };

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
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Type de Table</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 w-full"
            >
              <option value="ronde">Ronde</option>
              <option value="carree">Carrée</option>
              <option value="rectangle">Rectangle</option>
              <option value="ovale">Ovale</option>
            </select>
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