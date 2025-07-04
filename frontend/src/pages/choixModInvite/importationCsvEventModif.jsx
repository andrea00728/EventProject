import React, { useState } from "react";
import { importGuestsToSpecificEvent } from "../../services/inviteService";
import { useStateContext } from "../../context/ContextProvider";

export default function ImportGuestsCSVEvModif({ eventId, onImportSuccess }) {
  const { token } = useStateContext();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleImport = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier CSV.");
      return;
    }
    if (!eventId) {
      setError("Aucun événement associé. Contactez le support.");
      return;
    }

    setLoading(true);
    try {
      await importGuestsToSpecificEvent(file, eventId, token);
      setMessage("✅ Importation réussie !");
      setFile(null);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError("❌ Erreur lors de l'importation. Vérifiez le format du fichier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-pink-600">📁 Importer des invités (.CSV)</h2>

        {/* Input pour le fichier CSV */}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-600"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'} transition-colors duration-200`}
        >
          {loading ? "Importation..." : "Importer"}
        </button>

        {message && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Tutoriel CSV en bas */}
      <div className="mt-6 bg-gray-50 border-l-4 border-indigo-400 p-4 rounded-lg">
        <h3 className="text-md font-semibold text-indigo-700 mb-2">📄 Format CSV attendu :</h3>
        <p className="text-sm text-gray-600">
          Le fichier doit contenir les colonnes suivantes :
        </p>
        <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
          <li><strong>nom</strong> – Nom de l'invité</li>
          <li><strong>prenom</strong> – Prénom de l'invité</li>
          <li><strong>email</strong> – Adresse email</li>
          <li><strong>sex</strong> – Sexe (M ou F)</li>
        </ul>
        <div className="mt-3 text-sm text-gray-500">
          Exemple :
          <pre className="bg-gray-100 p-2 rounded-lg mt-1 text-xs">
            nom,prenom,email,sex<br />
            Rakoto,Jean,jean@example.com,M
          </pre>
        </div>
      </div>
    </div>
  );
}