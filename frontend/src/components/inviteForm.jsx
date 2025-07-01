import { useState } from "react";

export default function Inviteform({ onBack, onSubmitInvite }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmitInvite(form);
      setForm({ nom: "", prenom: "", email: "", sex: "" });
    } catch (err) {
      setError("Erreur lors de la création de l'invité");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="p-8 bg-white w-full md:w-[60%] lg:w-[50%] mx-auto shadow-md rounded-lg mb-8"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-[#1C1B2E]">
        Ajouter un invité
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label htmlFor="nom" className="text-gray-700 font-medium mb-2">
            Nom
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            value={form.nom}
            onChange={handleChange}
            placeholder="Nom de l'invité"
            required
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="prenom" className="text-gray-700 font-medium mb-2">
            Prénom
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Prénom de l'invité"
            required
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email de l'invité"
            required
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="sex" className="text-gray-700 font-medium mb-2">
            Sexe
          </label>
          <select
            id="sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className="border border-gray-300 bg-[#f5f5f5] rounded-md px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="">-- Sélectionnez --</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <div className="flex justify-between mt-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 rounded bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
          >
            Retour
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 rounded bg-[#1C1B2E] text-white font-semibold hover:bg-[#2e2d44] transition"
        >
          Enregistrer l'invité
        </button>
      </div>
    </form>
  );
}
