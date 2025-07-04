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
  const [modalOpen, setModalOpen] = useState(false);

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
    setError("");
    setMessage("");
    try {
      const result = await importGuestsToSpecificEvent(file, eventId, token);
      if (result && (result.imported || result.errors)) {
        if (result.imported && result.imported.length > 0) {
          setMessage(`✅ ${result.imported.length} invité(s) importé(s) avec succès !`);
        }
        if (result.errors && result.errors.length > 0) {
          setError(result.errors.join("\n"));
        }
      } else {
        setMessage("✅ Importation réussie !");
      }
      setFile(null);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ Erreur lors de l'importation. Vérifiez le format du fichier.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">📁 Importer des invités (.CSV)</h2>

        {/* Sélection de l'événement via modale UX/UI */}
        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Événement :</label>
          <input
            type="text"
            value={events.find(e => e.id === eventId)?.nom ? `${events.find(e => e.id === eventId).nom} (${new Date(events.find(e => e.id === eventId).date).toLocaleDateString()})` : ''}
            readOnly
            placeholder="Cliquez pour sélectionner un événement"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-pointer focus:ring-2 focus:ring-indigo-400"
            onClick={() => setModalOpen(true)}
          />
        </div>

        {/* Modale de sélection d'événement */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-3xl relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold focus:outline-none"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-center mb-6 text-gray-800">Sélectionnez un événement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {events.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">Aucun événement disponible.</div>
                ) : (
                  events.map(event => (
                    <button
                      key={event.id}
                      type="button"
                      className={`flex flex-col items-center justify-center rounded-xl p-6 border-2 border-transparent hover:border-pink-400 transition bg-gray-50 shadow-md hover:shadow-lg focus:outline-none ${eventId === event.id ? 'ring-2 ring-pink-400' : ''}`}
                      onClick={() => {
                        setModalOpen(false);
                        setEventId(event.id);
                        setError("");
                        setMessage("");
                      }}
                    >
                      <span className="text-lg font-semibold mb-2 text-indigo-700">{event.nom}</span>
                      <span className="text-xs text-gray-500 mb-1">{new Date(event.date).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400">{event.theme}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

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
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded whitespace-pre-line">
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
