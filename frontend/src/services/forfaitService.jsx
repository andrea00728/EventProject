import axiosClient from "../api/axios-client";

// by Claudio
/**
 * @typedef {object} ForfaitData
 * @property {string} nom - Le nom du forfait.
 * @property {number} price - Le prix du forfait.
 * @property {number} maxevents - Le nombre maximal d'événements.
 * @property {number} maxinvites - Le nombre maximal d'invités.
 * @property {string} description - La description du forfait.
 */


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

  try {
    const response = await axiosClient.get('/forfait/revenu-mensuel', /*{
   
    }*/);
    return response.data;
  } catch (error) {

    throw new Error('Erreur lors de la récupération des forfaits', { cause: error });
  }
}



// by claudio
// NOUVELLES FONCTIONS POUR LA GESTION DES FORFAITS
// Ces fonctions correspondent aux nouvelles routes du contrôleur back-end.

/**
 * Ajoute un nouveau forfait.
 * @param {ForfaitData} forfaitData Les données du nouveau forfait.
 * @returns {Promise<ForfaitData>} Le forfait ajouté.
 */
export const addForfait = async (forfaitData) => {
  try {
    const response = await axiosClient.post('/forfait', forfaitData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du forfait', error);
    throw new Error('Erreur lors de l\'ajout du forfait', { cause: error });
  }
};

/**
 * Met à jour un forfait existant.
 * @param {number} id L'ID du forfait à mettre à jour.
 * @param {Partial<ForfaitData>} forfaitData Les données à modifier pour le forfait.
 * @returns {Promise<ForfaitData>} Le forfait mis à jour.
 */
export const editForfait = async (id, forfaitData) => {
  try {
    const response = await axiosClient.patch(`/forfait/${id}`, forfaitData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la modification du forfait', error);
    throw new Error('Erreur lors de la modification du forfait', { cause: error });
  }
};

/**
 * Supprime un forfait.
 * @param {number} id L'ID du forfait à supprimer.
 * @returns {Promise<void>}
 */
export const deleteForfait = async (id) => {
  try {
    await axiosClient.delete(`/forfait/${id}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du forfait', error);
    throw new Error('Erreur lors de la suppression du forfait', { cause: error });
  }
};