import axiosClient from "../api/axios-client";
export const createPersonnel = async (data, token) => {
  const response = await axiosClient.post("/personnel/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export const getPersonnelByEventId = async (eventId, token) => {
  const response = await axiosClient.get(`/personnel/by-event/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}


/******* Affichage dans la page react de la liste des personnels lors d' un événement, pour la page Admin 
 *********************** (Sans restriction ) ** */

export const getPersonnelListByEventId = async (eventId) => {
  const response = await axiosClient.get(`/personnel/byEvent/${eventId}`);
  return response.data;
}

/****************************************************************** */


export const CountPersonnelByEvent = async (eventId, token) => {
  const response = await axiosClient.get(`/personnel/count/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

