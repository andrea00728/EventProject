import axiosClient from "../api/axios-client";

export const createInvite = async (data, token) => {
  const response = await axiosClient.post("/guests/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
