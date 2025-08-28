import axiosClient from "../api/axios-client";

 export const clearCookiesPage = async (id) => {
  const response = await axiosClient.get('/admin/clearCookies');
  return response.data;
};


export const updatePasswordUser = async (password) => {
  const res = await axiosClient.post("/admin/update-password", { newPassword : password });
  return res
}