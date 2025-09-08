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
  <div className="h-auto flex flex-col p-4 md:p-8">
    {/* Header */}
    <div className="flex-shrink-0 mb-6 md:mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Importer des invités
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Importez vos invités en masse via un fichier CSV
          </p>
        </div>
      </div>
    </div>

    <div className="w-full lg:max-w-4xl mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6 md:mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 md:px-8 md:py-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Configuration de l'import
          </h2>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Event Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Événement cible <span className="text-red-500">*</span>
            </label>
            <div
              className="relative w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
              onClick={() => setModalOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-blue-300">
                    <svg
                      className="w-5 h-5 text-gray-500 group-hover:text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {events.find((e) => e.id === eventId)?.nom ||
                        "Sélectionner un événement"}
                    </div>
                    {eventId && (
                      <div className="text-sm text-gray-500">
                        {new Date(
                          events.find((e) => e.id === eventId)?.date
                        ).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Fichier CSV <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              />
              <div
                className={`w-full px-6 py-8 border-2 border-dashed rounded-xl text-center transition-all duration-200 ${
                  file
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      file ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {file ? (
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 19l3-3m0 0l-3-3m0 0v8"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {file
                        ? file.name
                        : "Cliquez pour sélectionner un fichier CSV"}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {file
                        ? `Taille: ${(file.size / 1024).toFixed(1)} KB`
                        : "Ou glissez-déposez votre fichier ici"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleImport}
              disabled={loading || !file || !eventId}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2 ${
                loading || !file || !eventId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Importation en cours...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Lancer l'import
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-green-800 whitespace-pre-line font-medium text-sm md:text-base">
              {message}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-red-800 whitespace-pre-line font-medium text-sm md:text-base">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Icon Section */}
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex-shrink-0 flex items-center justify-center mb-4 md:mb-0">
            <svg
              className="w-6 h-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-indigo-900 mb-3">
              Format CSV requis
            </h3>
            <p className="text-indigo-800 mb-4">
              Votre fichier CSV doit respecter la structure suivante :
            </p>

            {/* Grid for Field Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-3 md:space-y-0 mb-6">
              {[
                { field: "nom", desc: "Nom de famille de l'invité" },
                { field: "prenom", desc: "Prénom de l'invité" },
                { field: "email", desc: "Adresse email valide" },
                { field: "sexe", desc: "Sexe (M pour Homme, F pour Femme)" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-100"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-indigo-600 font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {item.field}
                    </div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Code Example Section */}
            <div className="bg-white rounded-xl p-4 border border-indigo-200">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Exemple de fichier :
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                <div className="text-yellow-400">nom,prenom,email,sexe</div>
                <div>Rakoto,Jean,jean@example.com,M</div>
                <div>Rabe,Marie,marie@example.com,F</div>
                <div>Andry,Paul,paul@example.com,M</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    {modalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Sélectionner un événement
            </h3>
            <button
              className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 hover:bg-red-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-red-600 transition-all duration-200"
              onClick={() => setModalOpen(false)}
            >
              <svg
                className="w-4 h-4 md:w-5 md:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  Aucun événement disponible
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-lg transform hover:-translate-y-1 ${
                      eventId === event.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      setEventId(event.id);
                      setError("");
                      setMessage("");
                      setModalOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          eventId === event.id ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${
                            eventId === event.id ? "text-blue-600" : "text-gray-500"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      {eventId === event.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="font-semibold text-gray-800 line-clamp-2">
                        {event.nom}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </div>
                      {event.theme && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {event.theme}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

}
