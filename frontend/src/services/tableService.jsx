import axiosClient from "../api/axios-client";

export const createTable = async (data, token) => {
  const response = await axiosClient.post("/tables/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getTablesByEventId = async (eventId, token) => {
  const response = await axiosClient.get(`/tables/event/${eventId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getAvailableSeats = async (tableId) => {
  const response = await axiosClient.get(`/tables/${tableId}/available-seats`);
  return response.data;
};
