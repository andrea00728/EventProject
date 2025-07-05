import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const PaypalSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const amount = searchParams.get("amount");
    const token = searchParams.get("token");
    const payerID = searchParams.get("PayerID");

    // Tu peux envoyer ces infos à ton backend ici
    console.log({ eventId, amount, token, payerID });
  }, [searchParams]);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600">✅ Paiement réussi</h1>
      <p>Merci pour votre paiement. Votre transaction a bien été enregistrée.</p>
    </div>
  );
};

export default PaypalSuccess;
