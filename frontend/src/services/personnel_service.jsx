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