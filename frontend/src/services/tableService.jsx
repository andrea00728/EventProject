import axiosClient from "../api/axios-client";

export const createTable = async (data, token) => {
  const response = await axiosClient.post("/tables/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

  export const createTableByIdevent = async (data, token) => {
    const response = await axiosClient.post("/tables/create/by_event", data, {
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

export const updateTablePosition = async (tableId, position, token) => {
  const response = await axiosClient.put(
    `/tables/${tableId}/position`,
    { position },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
