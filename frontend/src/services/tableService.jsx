import axiosClient from "../api/axios-client";

/**
 * Creates a table using the provided data.
 * @param {Object} data - The data for the table creation.
 * @param {string} token - The authentication token.
 * @returns {Promise<Object>} - The created table's data.
 */

/**
 * Cr e une table li e  un  evenement.
 * @param {Object} data - Les donn es de la table (eventId, name, capacity, form)
 * @param {string} token - Le token d'authentification
 * @returns {Promise<Object>} - La table cr e e
 */
export const createTable = async (data, token) => {

  const response = await axiosClient.post("/tables/create/by_event", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
  }


/**
 * Recupre les tables lies  un  evenement.
 * @param {number} eventId - L'ID de l' v nement.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<Array<Object>>} - Les tables lies  l' evenement.
 */

export const getTablesByEventId = async (eventId, token) => {
  const response = await axiosClient.get(`/tables/event/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


/**
 * Recuperation le nombre de places disponibles pour une table.
 * @param {number} tableId - L'ID de la table.
 * @returns {Promise<number>} - Le nombre de places disponibles.
 */
export const getAvailableSeats = async (tableId) => {
  const response = await axiosClient.get(`/tables/${tableId}/available-seats`);
  return response.data;
};





/**
 * Met   jour la position d'une table.
 * @param {number} tableId - L'ID de la table.
 * @param {Object} position - La position de la table (x, y, z).
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<Object>} - La table mise   jour.
 */
export const updateTablePosition = async (tableId, position, token) => {
  const response = await axiosClient.patch(
    `/tables/${tableId}/position`,
     position ,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


/**
 * 
 * @param {*} tableId 
 * @param {*} rotation 
 * @param {*} token 
 * @returns 
 * 
 * service pour la rotation du table 
 */
export const updateRotation = async (tableId, rotation, token) => {
  const response = await axiosClient.patch(
    `/tables/${tableId}/rotation`,
    { rotation },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


/**
 * 
 * @param {*} tableId 
 * @param {*} token 
 * @returns 
 * service pour la suppression de table
 */
export const deleteTable = async (tableId, token) => {
  const response = await axiosClient.delete(`/tables/${tableId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};



/**
 * Réassigne un invité à une autre table et place.
 * @param {number} guestId - L'ID de l'invité à réassigner.
 * @param {number} tableId - L'ID de la nouvelle table.
 * @param {number} place - Le numéro de la nouvelle place à la table.
 * @param {string} token - Le token d'authentification.
 * @returns {Promise<Object>} - Les données de la réponse après réassignation.
 */

export const reassignGuestToTable = async (guestId, tableId,place, token) => {
  const response = await axiosClient.patch(
    `/guests/${guestId}/reassign`,
    {
      tableId,
      place,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

