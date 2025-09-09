import axiosClient from "../api/axios-client";

/**
 * 
 * @param {*} data 
 * @param {*} token 
 * @returns 
 * 
 * service pour la création des personnel
 * 
 */
export const createPersonnel = async (data) => {
  const response = await axiosClient.post("/personnel/create", data);
  return response.data;
}

/**
 * 
 * @param {*} eventId 
 * @param {*} token 
 * @returns 
 * 
 * service pour la recuperation des personnel par eventId(id de l'evenement)
 * 
 * 
 */

export const getPersonnelByEventId = async (eventId) => {
  const response = await axiosClient.get(`/personnel/by-event/${eventId}`);
  return response.data;
}


/******* Affichage dans la page react de la liste des personnels lors d' un événement, pour la page Admin 
 *********************** (Sans restriction ) ** */

export const getPersonnelListByEventId = async (eventId) => {
  const response = await axiosClient.get(`/personnel/byEvent/${eventId}`);
  return response.data;
}

/****************************************************************** */


/**
 * Récupère le nombre de personnel associé à un événement spécifique.
 * @param {string} eventId - L'ID de l'événement pour lequel le nombre de personnel est requis.
 * @param {string} token - Le token d'authentification pour l'accès à l'API.
 * @returns {Promise<number>} - Retourne le nombre de personnel pour l'événement donné.
 */

export const CountPersonnelByEvent = async (eventId, token) => {
  const response = await axiosClient.get(`/personnel/count/${eventId}`);
  return response.data;
}

