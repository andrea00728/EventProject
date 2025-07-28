import axiosClient from "../api/axios-client";


export const getUserIdForToken = async (token) => {
  const response = await axiosClient.get("/auth/getId",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * 
 * @returns 
 * service pour recupere le nombre total des organisateur enregistrer
 */
export const getUserCount = async ()    =>{
    const response  = await axiosClient.get('/auth/count-users');
    return response.data;
}
