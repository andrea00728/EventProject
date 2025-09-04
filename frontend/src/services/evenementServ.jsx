import axiosClient from "../api/axios-client";

/**
 * Crée un événement lié à l'utilisateur connecté.
 * @param {Object} eventData - Les données de l'événement (nom, type, theme, date, locationId, salleId)
 * @returns {Promise<Object>} - L'événement créé
 */
export const createEvent = async (eventData) => {
  try {
    const response = await axiosClient.post("/evenements", eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Récupère tous les lieux.
 */
export const getLocations = async () => {
  const response = await axiosClient.get('/locations');
  return response.data;
};

/**
 * Récupère les salles à partir d'un lieu existant.
 * @param {number} locationId - L'ID du lieu
 * @returns {Promise<Array>} - Liste des salles
 */
export const getSallesByLocation = async (locationId) => {
  const response = await axiosClient.get(`/locations/${locationId}/salles`);
  return response.data;
};

/**
 * Récupère tous les événements de l'utilisateur connecté.
 */
export const getMyEvents = async () => {
  const response = await axiosClient.get('/evenements/me');
  return response.data;
};

/**
 * Supprime un événement.
 * @param {number} eventId - L'ID de l'événement
 * @returns {Promise<Object>} - Réponse de la suppression
 */
export const DeleteEvent = async (eventId) => {
  const response = await axiosClient.delete(`/evenements/${eventId}/delete`);
  return response.data;
};

/**
 * Récupère tous les événements (pour l'admin).
 */
export const getAllEvents = async () => {
  const response = await axiosClient.get('/evenements');
  return response.data;
};

/**
 * Récupère tous les événements d'un manager spécifique.
 * @param {number} id - L'ID du manager
 */
export const getAllManagerEvents = async (id) => {
  const response = await axiosClient.get(`/evenements/${id}/managerEvents`);
  return response.data;
};

/**
 * Récupère le nombre total des événements créés par tous les organisateurs.
 */
export const getCountEvents = async () => {
  const response = await axiosClient.get('/evenements/countEvent');
  return response.data;
};

/**
 * Récupère les statistiques de tous les événements.
 */
export const getCountForAllEventStats = async () => {
  const response = await axiosClient.get(`/evenements/events/statistics`);
  return response.data;
};

/**
 * Crée une nouvelle salle pour un lieu.
 * @param {number} locationId - L'ID du lieu
 * @param {Object} salleData - Les données de la salle (nom)
 * @returns {Promise<Object>} - La salle créée
 */
export const createSalle = async (locationId, salleData) => {
  try {
    const response = await axiosClient.post(`/locations/${locationId}/salles`, salleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Met à jour une salle existante.
 * @param {number} salleId - L'ID de la salle
 * @param {Object} salleData - Les données de la salle (nom)
 * @returns {Promise<Object>} - La salle mise à jour
 */
export const updateSalle = async (salleId, salleData) => {
  try {
    const response = await axiosClient.put(`/locations/salles/${salleId}`, salleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Supprime une salle.
 * @param {number} salleId - L'ID de la salle
 * @returns {Promise<void>} - Rien si la suppression réussit
 */
export const deleteSalle = async (salleId) => {
  try {
    const response = await axiosClient.delete(`/locations/salles/${salleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crée un nouveau lieu à partir d'une requête de géocodage.
 * @param {string} query - La requête de recherche pour le lieu
 * @param {number} [createurId=0] - L'ID de l'utilisateur créateur (optionnel, défaut à 0 pour admin)
 * @returns {Promise<Object>} - Le lieu créé
 */
export const saveLocation = async (query, createurId) => {
  try {
    const response = await axiosClient.post('/locations/save', {
      query,
      createurId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Erreur lors de la sauvegarde du lieu';
  }
};