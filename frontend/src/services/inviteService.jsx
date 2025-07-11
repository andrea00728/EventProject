// inviteService.js

import axiosClient from "../api/axios-client"; // Assurez-vous que le chemin est correct

export const createInvite = async (inviteData, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");

  try {
    const response = await axiosClient.post("/guests/create", inviteData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'invité:", error);
    throw error;
  }
};

export const createInviteForSpecificEvent = async (inviteData, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  const eventId = inviteData.eventId;
  if (!eventId) {
    throw new Error("L'ID de l'événement est manquant pour la création de l'invité.");
  }
  try {
    const response = await axiosClient.post(`/guests/${eventId}`, inviteData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la création de l'invité pour l'événement ${eventId}:`, error);
    throw error;
  }
};

export const getGuestsByEvent = async (eventId, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!eventId) throw new Error("L'ID de l'événement est manquant pour la récupération des invités.");

  try {
    const response = await axiosClient.get(`/guests/event/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des invités par Event:", error);
    throw error;
  }
};

export const getGuestsByEventId = async (eventId, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!eventId) throw new Error("L'ID de l'événement est manquant pour la récupération des invités.");

  try {
    const response = await axiosClient.get(`/guests/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des invités par Event ID:", error);
    throw error;
  }
};

// NOUVEAU : Fonction pour importer des invités depuis un fichier CSV pour le DERNIER événement de l'utilisateur
export const importGuestsToLastEvent = async (file, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!file) throw new Error("Aucun fichier fourni pour l'importation.");

  const formData = new FormData();
  formData.append('file', file); // 'file' doit correspondre au nom attendu par @UploadedFile() dans NestJS

  try {
    const response = await axiosClient.post('/guests/import-last-event', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Essentiel pour l'envoi de fichiers
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'importation des invités pour le dernier événement:", error);
    throw error;
  }
};

// NOUVEAU : Fonction pour importer des invités depuis un fichier CSV pour un ÉVÉNEMENT SPÉCIFIQUE
export const importGuestsToSpecificEvent = async (file, eventId, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!eventId) throw new Error("L'ID de l'événement est manquant pour l'importation.");
  if (!file) throw new Error("Aucun fichier fourni pour l'importation.");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosClient.post(`/guests/import/${eventId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'importation des invités pour l'événement ${eventId}:`, error);
    throw error;
  }
};


/**
 * suppresion invite
 */

export const deleteGuest = async (guestId, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  try {
    const response = await axiosClient.delete(`/guests/${guestId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'invité :", error);
    throw error;
  }
};

/**
   * modifiction invite
   */
  export const updateGuest = async (guestId, data, token) => {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!guestId) throw new Error("ID de l'invité manquant");

  try {
    const response = await axiosClient.put(`/guests/${guestId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'invité :", error);
    throw error;
  }
};


// export async function getTablesByEventId(eventId, token) {
//   const response = await fetch(`http://localhost:3000/guests/tables/${eventId}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const contentType = response.headers.get("Content-Type");

//   if (!response.ok || !contentType.includes("application/json")) {
//     const text = await response.text();
//     console.error("Erreur serveur:", text);
//     throw new Error("Le serveur a retourné une erreur ou une page HTML au lieu du JSON");
//   }

//   return response.json();
// }




// export async function assignGuestToTable(guestId, tableId, place, token) {
//   try {
//     const response = await fetch(`/guests/${guestId}/assign`, { // Ajusté à '/api/guests' pour correspondre à votre controller
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ tableId, place }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Échec de l'assignation");
//     }

//     return await response.json(); // Retourne les données mises à jour si nécessaire
//   } catch (error) {
//     console.error("Erreur lors de l'assignation :", error);
//     throw error;
//   }
// }


export async function getTablesByEventId(eventId, token) {
  if (!token) throw new Error("Utilisateur non authentifié");
  if (!eventId) throw new Error("L'ID de l'événement est manquant pour la récupération des tables.");

  try {
    const response = await axiosClient.get(`/guests/tables/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des tables:", error);
    throw error;
  }
}

export async function assignGuestToTable(guestId, tableId, place, token) {
  if (!token) throw new Error("Utilisateur non authentifié");
  try {
    const response = await axiosClient.post(`/guests/${guestId}/assign`, { tableId, place }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'assignation :", error);
    throw error;
  }
}
