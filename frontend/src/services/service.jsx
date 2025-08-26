import axiosClient from "../api/axios-client";

 export const clearCookiesPage = async (id) => {
  const response = await axiosClient.get('/admin/clearCookies');
  return response.data;
};