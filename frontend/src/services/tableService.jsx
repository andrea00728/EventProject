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



/**
 * 
 * @param {*} tableId 
 * @param {*} position 
 * @param {*} token 
 * @returns 
 * 
 * Service pour la mise à jour de la position du table
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

