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

  useEffect(() => {
    if (!token) return;
    getMyEvents(token)
      .then(setEvents)
      .catch(() => setError("Erreur lors du chargement des événements."));
  }, [token]);
  
  const handleFileChange = async (e) => {
    setError("");
    setMessage("");
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Vérification doublons emails dans le CSV (simple check)
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').slice(1);
      const emails = lines.map(line => line.split(',')[2]?.trim()).filter(Boolean);
      const uniqueEmails = new Set(emails);
      if (uniqueEmails.size !== emails.length) {
        setError("Le fichier CSV contient des emails en double.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
    } catch {
      setError("Erreur lors de la lecture du fichier CSV.");
      setFile(null);
    }
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
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await importGuestsToSpecificEvent(file, eventId, token);
      if (result?.imported?.length > 0) {
        setMessage(`${result.imported.length} invité(s) importé(s) avec succès !`);
      }
      if (result?.errors?.length > 0) {
        setError(result.errors.join("\n"));
      }
      setFile(null);
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'importation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white shadow rounded p-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">📁 Importer des invités (.CSV)</h2>

        <div className="mb-4">
          <label className="block mb-2 font-medium text-gray-700">Événement :</label>
          <input
            type="text"
            readOnly
            value={events.find(e => e.id === eventId)?.nom || ""}
            placeholder="Cliquez pour sélectionner un événement"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 cursor-pointer"
            onClick={() => setModalOpen(true)}
          />
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-3xl relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
              <h3 className="text-xl font-bold mb-6">Sélectionnez un événement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 max-h-72 overflow-auto">
                {events.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">Aucun événement disponible.</div>
                ) : (
                  events.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      className={`p-4 rounded border bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                        eventId === event.id ? "border-pink-500 ring-2 ring-pink-500" : "border-transparent"
                      }`}
                      onClick={() => {
                        setEventId(event.id);
                        setError("");
                        setMessage("");
                        setModalOpen(false);
                      }}
                    >
                      <div className="font-semibold">{event.nom}</div>
                      <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{event.theme}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className="mb-4 block w-full text-sm text-gray-700"
        />

       <button
  onClick={handleImport}
  disabled={loading || !file || !eventId}
  className={`px-4 py-2 rounded text-white ${
    loading || !file || !eventId ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {loading ? "Importation..." : "Importer"}
</button>
        {message && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded whitespace-pre-line">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <h3 className="text-md font-semibold text-blue-700 mb-2">📄 Format CSV attendu :</h3>
          <p className="text-sm text-gray-700">Le fichier doit contenir les colonnes suivantes :</p>
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
    </div>
  );
}
