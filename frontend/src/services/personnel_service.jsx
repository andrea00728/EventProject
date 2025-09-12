import axiosClient from "../api/axios-client";

/**
 * Crée un personnel
 */
export const createPersonnel = async (data) => {
  const response = await axiosClient.post("/personnel/create", data);
  return response.data;
};

/**
 * Récupère les personnels d’un événement (par ID d’événement)
 */
export const getPersonnelByEventId = async (eventId) => {
  const response = await axiosClient.get(`/personnel/by-event/${eventId}`);
  return response.data;
};

/**
 * Liste des personnels d’un événement (Admin)
 */
export const getPersonnelListByEventId = async (eventId) => {
  const response = await axiosClient.get(`/personnel/byEvent/${eventId}`);
  return response.data;
};

/**
 * Récupère le nombre de personnels pour un événement
 */
export const CountPersonnelByEvent = async (eventId) => {
  const response = await axiosClient.get(`/personnel/count/${eventId}`);
  return response.data;
};

/**
 * Récupère tous les personnels (global)
 */
export const getAllPersonnels = async () => {
  const response = await axiosClient.get("/personnel");
  return response.data; // tableau de tous les personnels
};

export const CountAllPersonnels = async () => {
  const response = await axiosClient.get("/personnel"); // récupère tout
  return response.data.length; // retourne juste le count
};
