// import { data } from "react-router-dom";
import axiosClient from "../api/axios-client";



export  const createTestimony =async (payload)=>{
    const response= await axiosClient.post('/commentaire',payload);
    return response.data;
}

/**
 * 
 * @returns 
 * service pour la recuperation des commentaire recent
 */

export const findOneRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/recent');
    return response.data;
}


/**
 * 
 * @returns 
 * 
 * recuperation des 3 commentaire recent
 * 
 */
export const findthreeRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/diff-commentaire');
    return response.data;
}


/**
 * 
 * api pour la recuperation  du commentaire recent avant le dernier commentaire
 *
 */
export const findSecondLastCommentaireRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/second-commentaire');
   return response.data;
}


/**
 * 
 * @returns 
 * 
 * api pour la recuperation  du troisieme commentaire recent avant les deux dernier commentaire
 */

export const findThirdLastCommentaireRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/third-commentaire');
    return response.data;
}


/**
 * 
 * @returns 
 * 
 * api pour la recuperation  du quatrieme commentaire recent avant les trois dernier commentaire    
 */
export const findFourthLastCommentaireRecent =async ()=>{
    const response  = await  axiosClient.get('/commentaire/fourth-commentaire');
    return response.data;
}

/**
 * 
 * @returns
 * 
 * api pour recupere le nombre des satisfaction 
 */

export const findCountSatisfied =async ()=>{
    const response  = await  axiosClient.get('/commentaire/count-satisfaction');
    return response.data;
}

/**
 * @returns {Promise<Object>} - Le pourcentage de satisfaction des commentaires.
 * 
 * Ce service récupère le pourcentage de satisfaction basé sur les commentaires.
 */

export const findCount_pourcentage =async ()=>{
    const response  = await  axiosClient.get('/commentaire/count-pourcentage-satisfaction');
    return response.data;
}