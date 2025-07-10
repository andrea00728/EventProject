import axiosClient from "../api/axios-client";

export const getAllOrdersForOnEvent = async (id) => {
  const response = await axiosClient.get('/');
  return response.data;
};