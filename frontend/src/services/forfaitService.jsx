import axiosClient from "../api/axios-client";
export const updateForfait = async (forfaitNom) => {
  try {
    const response = await axiosClient.post('/forfait/upgrade', { forfaitNom });
    return response.data;
  } catch (error) {
    // Gérez les erreurs, comme une non-authentification ou une requête échouée.
    throw error;
  }
};

export const getAllForfait = async () => {
  try {
    const response = await axiosClient.get('/forfait/all');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des forfaits', error);
    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
};



export const getSuccessForfait = async (subscriptionId) => {
  try {
    const response = await axiosClient.get(`/forfait/success-confirmation?subscription_id=${subscriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la confirmation du forfait', error);
    throw new Error('Erreur lors de la confirmation du forfait', { cause: error });
  }
};

export const getUserForfait = async () => {
  try {
    const response = await axiosClient.get('/forfait/user/forfait');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du forfait actif', error);
    throw new Error('Erreur lors de la récupération du forfait actif', { cause: error });
  }
};

export const getSumForUsersForfait = async (/*token*/) => {
  // if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get('/forfait/sumAllUsers', /*{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }*/);
    return response.data;
  } catch (error) {

    throw new Error('Erreur lors de la récupération de la somme des forfaits', { cause: error });
  }
}

export const getLastTransactions = async (/*token*/) => {
  // if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get('/forfait/get/lastTransactions', /*{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }*/);
    return response.data;
  } catch (error) {
    
    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
}

export const getRevenuMensuel = async (/*token*/) => {
  // if (!token) throw new Error('Utilisateur non authentifié');
  try {
    const response = await axiosClient.get('/forfait/revenu-mensuel', /*{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }*/);
    return response.data;
  } catch (error) {
    
    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
}