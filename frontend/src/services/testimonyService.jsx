import axiosClient from "../api/axios-client";
/**
 * 
 * @returns 
 * service pour la recuperation des commentaire recent
 */

export const findOneRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/recent');
    return response.data;
}
