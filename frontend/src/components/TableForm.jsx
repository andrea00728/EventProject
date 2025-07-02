import { useState } from "react";

export default function CreateTable({ onSubmitTable }) {
  const [form, setForm] = useState({ numero: "", capacite: "",type:"ronde" });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmitTable(form);
      setForm({ numero: "", capacite: "",type:"" });
    } catch (err) {
      setError("Erreur lors de la création de la table");
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-6 bg-white w-[50%] mx-auto shadow-md rounded-lg mb-6"> 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
        <div className="flex flex-col"> 
          <label htmlFor="numero" className="block text-gray-700 text-sm font-bold mb-2">Numéro de Table</label>
          <input
            id="numero" 
            name="numero"
            value={form.numero}
            onChange={handleChange}
            placeholder="Ex: 1, 2, A, B..."
            required
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div className="flex flex-col"> 
          <label htmlFor="capacite" className="block text-gray-700 text-sm font-bold mb-2">Capacité</label>
          <input
            id="capacite" 
            name="capacite"
            type="number"
            value={form.capacite}
            onChange={handleChange}
            placeholder="Ex: 4, 6, 8"
            required
            min="1" 
            className="border bg-[#f5f5f5] border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>
        <div className="flex flex-col">
        <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type de Table</label>
        <select
          id="type"
          name="type"
          value={form.type}
          onChange={handleChange}
          required
          className="border bg-[#f5f5f5] border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ronde">Ronde</option>
          <option value="carree">Carrée</option>
          <option value="rectangle">Rectangle</option>
          <option value="ovale">Ovale</option>
        </select>
      </div>

      </div>
      
      <div className="mt-6"> 
        <button
          type="submit"
          className="w-full bg-[#1C1B2E] text-white font-semibold py-3 rounded-md hover:bg-[#2e2d44] transition-colors duration-200" 
        >
          Ajouter Table
        </button>
      </div>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>} 
    </form>
  );
}