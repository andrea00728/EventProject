import React, { useEffect, useState } from "react";
import { importGuestsToSpecificEvent } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { createPaypalPaymentLink, confirmPaypalSuccess, getPaymentDetails } from "../../services/payementService";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ImportGuestsCSV({ onImportSuccess }) {
  const { token } = useStateContext();
  const [file, setFile] = useState(null);
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(20);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    getMyEvents(token)
      .then(setEvents)
      .catch(() => setError("Erreur lors du chargement des événements."));

    // Récupérer eventId depuis l'URL si retour après échec
    const urlEventId = searchParams.get("eventId");
    if (urlEventId) {
      setEventId(urlEventId);
    }
  }, [token, searchParams]);

const handleFileChange = async (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    const text = await selectedFile.text();
    const lines = text.split('\n').slice(1);
    const emails = lines.map(line => line.split(',')[2]).filter(email => email);
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError("Le fichier CSV contient des emails en double.");
      return;
    }
    setFile(selectedFile);
    setMessage("");
    setError("");
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
  if (loading) return; // Protection contre les doubles clics
  setLoading(true);
  setError("");
  setMessage("");
  setShowPayment(false);
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
  if (
    err.response &&
    err.response.data &&
    err.response.data.message &&
    err.response.data.message.includes("limite gratuite de 50 invités")
  ) {
    setError(err.response.data.message);
    setShowPayment(true);
    setPendingAmount(20);
  } else if (err.response && err.response.data && err.response.data.message) {
    setError(err.response.data.message);
  } else {
    setError("Erreur lors de l'importation. Vérifiez le format du fichier.");
  }
} finally {
  setLoading(false);
}
};

const handlePay = async () => {
  if (!file) {
    setError("Aucun fichier à importer après paiement.");
    return;
  }
  if (!eventId) {
    setError("Aucun événement sélectionné.");
    return;
  }
  try {
    console.log("Tentative de paiement pour eventId:", eventId, "montant:", pendingAmount);
    if (pendingAmount == null || isNaN(pendingAmount)) {
      setPendingAmount(20); // Valeur par défaut si invalide
      console.warn("Montant invalide, réinitialisé à 20.");
    }
    const url = await createPaypalPaymentLink(eventId, pendingAmount, token);
    console.log("URL PayPal générée :", url);

    // Convertir le fichier en une chaîne (par exemple, Base64 ou texte brut)
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const fileContent = event.target.result; // Contenu du fichier (par exemple, en Base64)
      localStorage.setItem("pendingFile", fileContent); // Stocker le contenu
      localStorage.setItem("pendingEventId", eventId);
      window.location.href = url;
    };
    fileReader.readAsDataURL(file); // Utilise DataURL pour stocker le fichier
  } catch (err) {
    console.error("Erreur handlePay :", err);
    setError("Erreur lors de la création du paiement : " + err.message);
  }
};

  const handlePaypalReturn = async () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");
    const amount = params.get("amount");
    if (eventId && amount && token) {
      try {
        await confirmPaypalSuccess(eventId, amount);
        const pendingFile = localStorage.getItem("pendingFile");
        if (pendingFile) {
          const fileBlob = new File([pendingFile], "imported.csv", { type: "text/csv" });
          const importResult = await importGuestsToSpecificEvent(fileBlob, eventId, token);
          if (importResult.imported && importResult.imported.length > 0) {
            setMessage(`✅ ${importResult.imported.length} invité(s) importé(s) après paiement !`);
          }
          localStorage.removeItem("pendingFile");
          localStorage.removeItem("pendingEventId");
          if (onImportSuccess) onImportSuccess();
        }
      } catch (err) {
        setError("Erreur lors de la confirmation du paiement ou de l'importation : " + err.message);
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("eventId") && params.get("amount")) {
      handlePaypalReturn();
    }
  }, []);

  const handleModifyAmount = () => {
    const newAmount = prompt("Entrez le nouveau montant (€) :", pendingAmount);
    if (newAmount && !isNaN(newAmount) && newAmount > 0) {
      setPendingAmount(parseFloat(newAmount));
      setMessage(`Montant mis à jour à ${newAmount} €.`);
    } else {
      setError("Montant invalide.");
    }
  };

  return (
    <div className="mt-6">
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">📁 Importer des invités (.CSV)</h2>

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

        {showPayment && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 mb-2">
              Vous avez atteint la limite gratuite de 50 invités. Veuillez effectuer le paiement pour continuer.
            </p>
            <p className="text-yellow-700">Montant : {pendingAmount} €</p>
            <button
              onClick={handlePay}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Payer {pendingAmount} €
            </button>
            <button
              onClick={handleModifyAmount}
              className="mt-2 ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Modifier le montant
            </button>
          </div>
        )}

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