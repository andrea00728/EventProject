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

export async function getUserForfait() {
  try {
    const res = await axiosClient.get("/forfait/user/forfait");
    return res.data;
  } catch (error) {
    // Si l’utilisateur n’est pas connecté → on ignore (pas de log, pas de throw)
    if (error.response?.status === 401) {
      return null;
    }
//
    // Autres erreurs → on log et throw
    console.error("Erreur lors de la récupération du forfait actif", error);
    throw new Error("Erreur lors de la récupération du forfait actif");
  }
}

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

  try {
    const response = await axiosClient.get('/forfait/revenu-mensuel', /*{
   
    }*/);
    return response.data;
  } catch (error) {

    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
}