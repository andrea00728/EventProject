import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPaypalSuccess } from "../../services/payementService";
import { importGuestsToSpecificEvent } from "../../services/inviteService";
import { useStateContext } from "../../context/ContextProvider";

export default function PaypalSuccess() {
  const [searchParams] = useSearchParams();
  const { token } = useStateContext();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const amount = searchParams.get("amount");
  const [message, setMessage] = useState("Paiement en cours de confirmation...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleConfirmation = async () => {
      if (!eventId || !amount || !token) {
        setError("Paramètres manquants pour la confirmation (eventId, amount, ou token).");
        setIsLoading(false);
        console.warn("Paramètres manquants :", { eventId, amount, token });
        return;
      }

      const amountNumber = Number(amount);
      if (isNaN(amountNumber) || amountNumber <= 0) {
        setError("Montant invalide reçu de PayPal.");
        setIsLoading(false);
        console.warn("Montant invalide :", amount);
        return;
      }

      try {
        console.log("Démarrage de la confirmation avec eventId:", eventId, "amount:", amountNumber);
        const confirmationResponse = await confirmPaypalSuccess(eventId, amountNumber);
        console.log("Réponse de confirmPaypalSuccess :", confirmationResponse);
        setMessage("Paiement confirmé avec succès.");

        const pendingFileContent = localStorage.getItem("pendingFile");
        const pendingEventId = localStorage.getItem("pendingEventId");

        if (pendingFileContent && pendingEventId === eventId) {
          console.log("Fichier en attente trouvé, tentative d'importation...");
          if (!pendingFileContent.startsWith("data:text/csv;base64,")) {
            setError("Format de fichier invalide dans localStorage (doit être un CSV en Base64).");
            setIsLoading(false);
            return;
          }

          try {
            const byteString = atob(pendingFileContent.split(",")[1]);
            const byteNumbers = new Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
              byteNumbers[i] = byteString.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const fileBlob = new Blob([byteArray], { type: "text/csv" });
            const file = new File([fileBlob], "imported.csv", { type: "text/csv" });

            const importResult = await importGuestsToSpecificEvent(file, eventId, token);
            console.log("Résultat de l'importation :", importResult);

            if (importResult.imported && importResult.imported.length > 0) {
              const assignedCount = importResult.imported.filter((g) => g.table && g.place).length;
              const unassignedCount = importResult.imported.length - assignedCount;
              setMessage(
                `✅ ${importResult.imported.length} invité(s) importé(s) avec succès ! ` +
                `${assignedCount} assigné(s) automatiquement, ${unassignedCount} non assigné(s). ` +
                `Vous pouvez les assigner manuellement après avoir créé de nouvelles tables.`
              );
              if (importResult.errors && importResult.errors.length > 0) {
                setError(
                  `Importation partielle : ${importResult.errors.length} erreurs (ex. : ${importResult.errors.slice(0, 2).join(", ")}...)`
                );
              }
              localStorage.removeItem("pendingFile");
              localStorage.removeItem("pendingEventId");
              setTimeout(() => navigate(`/evenement/invites?eventId=${eventId}`), 3000);
            } else {
              setError("Aucun invité importé. Vérifiez le fichier ou le serveur.");
            }
          } catch (importError) {
            console.error("Erreur lors de l'importation :", importError);
            setError(
              `Erreur lors de l'importation des invités : ${importError.response?.data?.message || importError.message}`
            );
          }
        } else {
          setMessage("Paiement confirmé, mais aucun fichier en attente.");
        }
      } catch (err) {
        console.error("Erreur dans handleConfirmation :", err.response?.data || err);
        setError(`Erreur lors de la confirmation ou de l'importation : ${err.response?.data?.message || err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    handleConfirmation();
  }, [eventId, amount, token, navigate]);

  const handleRetry = () => {
    if (eventId) {
      navigate(`/evenement/invites/importerInv?eventId=${eventId}`);
    } else {
      setError("Impossible de réessayer : eventId manquant.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Confirmation de Paiement</h2>
      {isLoading ? (
        <p className="text-gray-700">Chargement...</p>
      ) : (
        <>
          {message && <p className="text-green-700 bg-green-100 p-2 rounded">{message}</p>}
          {error && (
            <div className="mt-2">
              <p className="text-red-700 bg-red-100 p-2 rounded">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!eventId || isLoading}
              >
                Réessayer l'importation
              </button>
            </div>
          )}
          {error && error.includes("non assigné(s)") && (
            <button
              onClick={() => navigate(`/evenement/tables?eventId=${eventId}`)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Gérer les tables
            </button>
          )}
        </>
      )}
    </div>
  );
}