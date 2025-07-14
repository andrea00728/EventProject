import axiosClient from "../api/axios-client";

export const updateForfait = async (token, forfaitNom) => {
  if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.post('/forfait/upgrade', { forfaitNom }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du forfait', error);
    throw new Error('Erreur lors de la mise à jour du forfait', { cause: error });
  }
};

export const getAllForfait = async (token) => {
  if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get('/forfait/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des forfaits', error);
    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
};

export const getSuccessForfait = async (token, subscriptionId) => {
  if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get(`/forfait/success-confirmation?subscription_id=${subscriptionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la confirmation du forfait', error);
    throw new Error('Erreur lors de la confirmation du forfait', { cause: error });
  }
};

export const getUserForfait = async (token) => {
  if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get('/forfait/user/forfait', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du forfait actif', error);
    throw new Error('Erreur lors de la récupération du forfait actif', { cause: error });
  }
};
