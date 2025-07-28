import axiosClient from "../api/axios-client";
/**
 * 
 * @returns 
 * service pour recupere le nombre total des organisateur enregistrer
 */
export const getUserCount = async ()    =>{
    const response  = await axiosClient.get('/auth/count-users');
    return response.data;
}