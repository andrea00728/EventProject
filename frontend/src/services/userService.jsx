import axiosClient from "../api/axios-client";


export const getUserIdForToken = async (token) => {
  const response = await axiosClient.get("/auth/getId",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
