import React, { useEffect, useState } from "react";
import { importGuestsToSpecificEvent } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

export default function ImportGuestsCSV({ onImportSuccess }) {
  const { token } = useStateContext();
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔄 Récupère les événements de l'utilisateur
  useEffect(() => {
    if (!token) return;
    getMyEvents(token)
      .then(setEvents)
      .catch(() => setError("Erreur lors du chargement des événements."));
  }, [token]);

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
      setError("Veuillez sélectionner un événement.");
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
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">📁 Importer des invités (.CSV)</h2>

        {/* Sélection de l'événement */}
        <label className="block mb-2 font-medium text-gray-700">Événement :</label>
        <select
          className="mb-4 block w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">-- Sélectionner un événement --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.nom} ({new Date(event.date).toLocaleDateString()})
            </option>
          ))}
        </select>

        {/* Input pour le fichier CSV */}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="mb-4 block w-full text-sm text-gray-700"
        />

        <button
          onClick={handleImport}
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Importation..." : "Importer"}
        </button>

        {message && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Tutoriel CSV en bas */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h3 className="text-md font-semibold text-blue-700 mb-2">📄 Format CSV attendu :</h3>
        <p className="text-sm text-gray-700">
          Le fichier doit contenir les colonnes suivantes :
        </p>
        <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
          <li><strong>nom</strong> – Nom de l'invité</li>
          <li><strong>prenom</strong> – Prénom de l'invité</li>
          <li><strong>email</strong> – Adresse email</li>
          <li><strong>sex</strong> – Sexe (M ou F)</li>
        </ul>
        <div className="mt-3 text-sm text-gray-600">
          Exemple :
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
            nom,prenom,email,sex<br />
            Rakoto,Jean,jean@example.com,M
          </pre>
        </div>
      </div>
    </div>
  );
}
