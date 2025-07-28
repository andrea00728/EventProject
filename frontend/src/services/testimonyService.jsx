import axiosClient from "../api/axios-client";

/**
 * Service pour la récupération du commentaire le plus récent
 * @returns {Promise} - Promesse contenant les données du commentaire récent
 */
export const findOneRecent = async () => {
    const response = await axiosClient.get('/commentaire/recent');
    return response.data;
}

/**
 * Service pour la récupération des 3 derniers commentaires de différents utilisateurs
 * @returns {Promise} - Promesse contenant les données des commentaires différents
 */
export const findDifferentCommentaires = async () => {
    const response = await axiosClient.get('/commentaire/diff-commentaire');
    return response.data;
}