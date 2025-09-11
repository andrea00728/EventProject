import axiosClient from "../api/axios-client";

/**
 * Crée un ou plusieurs éléments liés à un événement.
 * @param {Object} data - Les données de l'élément (eventId, nom, type, position, rotation, width, height, color, nombre)
 * @returns {Promise<Array<Object>>} - Les éléments créés
 */
export const createElement = async (data) => {
  const response = await axiosClient.post("/elements/create/by_event", data);
  return response.data;
};

/**
 * Récupère les éléments liés à un événement.
 * @param {number} eventId - L'ID de l'événement.
 * @returns {Promise<Array<Object>>} - Les éléments liés à l'événement.
 */
export const getElementsByEventId = async (eventId) => {
  const response = await axiosClient.get(`/elements/event/${eventId}`);
  return response.data;
};

/**
 * Met à jour la position d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {Object} position - La position de l'élément (left, top).
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElementPosition = async (elementId, position) => {
  const response = await axiosClient.patch(`/elements/${elementId}/position`, position);
  return response.data;
};

/**
 * Met à jour la rotation d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {number} rotation - La rotation de l'élément.
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElementRotation = async (elementId, rotation) => {
  const response = await axiosClient.patch(`/elements/${elementId}/rotation`, { rotation });
  return response.data;
};

/**
 * Met à jour les données d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {Object} data - Les nouvelles données de l'élément (nom, type, color, etc.).
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElement = async (elementId, data) => {
  const response = await axiosClient.patch(`/elements/${elementId}`, data);
  return response.data;
};

/**
 * Supprime un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @returns {Promise<Object>} - La réponse de la suppression.
 */
export const deleteElement = async (elementId) => {
  const response = await axiosClient.delete(`/elements/${elementId}`);
  return response.data;
};