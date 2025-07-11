import axiosClient from "../api/axios-client";


/**
 * Crée un événement lié à l'utilisateur connecté.
 * @param {Object} eventData - Les données de l'événement (nom, type, theme, date, locationId, salleId)
 * @returns {Promise<Object>} - L'événement créé
 */
// export const createEvent = async (eventData) => {
//   const response = await axiosClient.post('/evenements', eventData);
//   return response.data;
// };

export const createEvent = async (eventData) => {
  try {
    const response = await axiosClient.post('/evenements', eventData);
    return response.data;
  } catch (error) {
    throw error; // pour que le frontend récupère le message
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
 * 
 * recuperation des salles a partire des lieu existe
 * 
 */
export const getSallesByLocation = async (locationId) => {
  const response = await axiosClient.get(`/locations/${locationId}/salles`);
  return response.data;
};

export const getMyEvents = async (token) => {
  const response = await axiosClient.get('/evenements/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const DeleteEvent = async (eventId, token) => {
  const response = await axiosClient.delete(`/evenements/${eventId}/delete`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
