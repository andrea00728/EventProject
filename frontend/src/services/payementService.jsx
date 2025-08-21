import axiosClient from "../api/axios-client";

/**
 * @param {number} eventId - L'ID de l'événement associé au paiement
 * @param {number} amount - Le montant du paiement
 * @param {string} token - Le token d'authentification
 * @returns {Promise<string>} - Retourne l'URL de paiement PayPal
 * // Créer un lien de paiement PayPal
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
 * @param {number} eventId - L'ID de l'événement associé au paiement
 * @param {number} amount - Le montant du paiement
 * @returns {Promise<object>} - Retourne les données de confirmation
 * // Confirmer le paiement (utilisé dans /paypal-success)
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

/**
 * @param {number} eventId - L'ID de l'événement associé au paiement
 * @param {string} token - Le token d'authentification
 * @returns {Promise<object>} - Retourne les détails du paiement
 * // Récupérer les détails d'un paiement existant
 */
export const getPaymentDetails = async (eventId, token) => {
  if (!token || !eventId) throw new Error("Paramètres manquants");
  try {
    const response = await axiosClient.get(`/paiement/details?eventId=${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des détails du paiement :", err);
    throw err;
  }
};