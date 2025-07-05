import axiosClient from "../api/axios-client";

/**
 * 
 * @param {*} eventId 
 * @param {*} amount 
 * @param {*} token 
 * @returns 
 * //  Créer un lien de paiement PayPal
 */
export const createPaypalPaymentLink = async (eventId, amount, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!eventId || !amount) throw new Error("eventId ou amount manquant");

  try {
    const response = await axiosClient.post(
      `/paiement/create?eventId=${eventId}&amount=${amount}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data; // contient l'URL PayPal
  } catch (err) {
    console.error("Erreur lors de la création du paiement :", err);
    throw err;
  }
};

/**
 * 
 * @param {*} eventId 
 * @param {*} amount 
 * @returns 
 * / Confirmer le paiement (utilisé dans /paypal-success)
 */
export const confirmPaypalSuccess = async (eventId, amount) => {
  try {
    const response = await axiosClient.post(
      `/paiement/success?eventId=${eventId}&amount=${amount}`
    );
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la confirmation du paiement :", err);
    throw err;
  }
};
