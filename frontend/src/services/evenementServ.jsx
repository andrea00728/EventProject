import axiosClient from '../api/axios-client';

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
    throw error.response?.data?.message || error.message;
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
 * Récupère les salles à partir d'un lieu existant
 */
export const getSallesByLocation = async (locationId) => {
  const response = await axiosClient.get(`/locations/${locationId}/salles`);
  return response.data;
};

/**
 * Récupère les événements de l'utilisateur connecté
 */
export const getMyEvents = async () => {
  try {
    const response = await axiosClient.get('/evenements/me');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Supprime un événement
 */
export const DeleteEvent = async (eventId) => {
  try {
    const response = await axiosClient.delete(`/evenements/${eventId}/delete`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Récupère tous les événements (pour admin)
 */
export const getAllEvents = async () => {
  try {
    const response = await axiosClient.get('/evenements');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Récupère les événements d'un manager spécifique
 */
export const getAllManagerEvents = async (id) => {
  try {
    const response = await axiosClient.get(`/evenements/${id}/managerEvents`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Récupère le nombre total d'événements créés
 */
export const getCountEvents = async () => {
  try {
    const response = await axiosClient.get('/evenements/countEvent');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Récupère les statistiques des événements
 */
export const getCountForAllEventStats = async () => {
  try {
    const response = await axiosClient.get(`/evenements/events/statistics`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Met à jour un événement
 * @param {number} eventId - ID de l'événement
 * @param {Object} eventData - Données de l'événement à mettre à jour
 * @returns {Promise<Object>} - L'événement mis à jour
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    const formData = new FormData();
    Object.keys(eventData).forEach(key => {
      if (key === 'image' && eventData[key]) {
        formData.append('image', eventData[key]);
      } else if (eventData[key] !== undefined && eventData[key] !== null) {
        formData.append(key, eventData[key].toString());
      }
    });

    const response = await axiosClient.patch(`/evenements/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};