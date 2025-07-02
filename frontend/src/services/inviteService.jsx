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
  formData.append('file', file); // 'file' doit correspondre au nom attendu par @UploadedFile() dans NestJS

  try {
    const response = await axiosClient.post(`/guests/import/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
        Authorization: `Bearer ${token}`
      }
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