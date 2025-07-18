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
export const createPersonnel = async (data, token) => {
  const response = await axiosClient.post("/personnel/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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

export const getPersonnelByEventId = async (eventId, token) => {
  const response = await axiosClient.get(`/personnel/by-event/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}




export const CountPersonnelByEvent = async (eventId, token) => {
  const response = await axiosClient.get(`/personnel/count/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}


