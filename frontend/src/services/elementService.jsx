import axiosClient from "../api/axios-client";

/**
 * Crée un ou plusieurs éléments liés à un événement.
 * @param {Object} data - Les données de l'élément (eventId, nom, type, position, rotation, width, height, color, nombre)
 * @returns {Promise<Array<Object>>} - Les éléments créés
 */
export const createElement = async (data) => {
  try {
    // Validation basique avant envoi
    if (!data || !data.eventId || !data.nom || !data.type) {
      throw new Error("Données incomplètes : eventId, nom et type sont requis");
    }
    if (data.type === "custom" && !data.shape) {
      throw new Error("Le champ shape est requis pour un élément personnalisé");
    }
    if (data.nombre && (data.nombre < 1 || data.nombre > 10)) { // Exemple de limite
      throw new Error("Le nombre d'éléments doit être entre 1 et 10");
    }

    console.log("Données envoyées pour création :", data);
    const response = await axiosClient.post("/elements/create/by_event", data);
    return response.data;
  } catch (error) {
    console.error("Erreur création élément :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
      // Si toast est disponible dans ton app, utilise-le ici
      // toast.error(`Erreur: ${error.response.data.message || "Échec de la création"}`);
    }
    throw error; // Relancer pour que le composant gère
  }
};

/**
 * Récupère les éléments liés à un événement.
 * @param {number} eventId - L'ID de l'événement.
 * @returns {Promise<Array<Object>>} - Les éléments liés à l'événement.
 */
export const getElementsByEventId = async (eventId) => {
  try {
    if (!eventId || eventId <= 0) {
      throw new Error("eventId invalide");
    }
    const response = await axiosClient.get(`/elements/event/${eventId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur récupération éléments :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
    }
    throw error;
  }
};

/**
 * Met à jour la position d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {Object} position - La position de l'élément (left, top).
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElementPosition = async (elementId, position) => {
  try {
    if (!elementId || elementId <= 0) {
      throw new Error("elementId invalide");
    }
    if (!position || typeof position.left !== 'number' || typeof position.top !== 'number' || position.left < 0 || position.top < 0) {
      throw new Error("Position invalide : left et top doivent être des nombres positifs");
    }

    console.log("Mise à jour position :", { elementId, position });
    const response = await axiosClient.patch(`/elements/${elementId}/position`, position);
    return response.data;
  } catch (error) {
    console.error("Erreur mise à jour position :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
    }
    throw error;
  }
};

/**
 * Met à jour la rotation d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {number} rotation - La rotation de l'élément.
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElementRotation = async (elementId, rotation) => {
  try {
    if (!elementId || elementId <= 0) {
      throw new Error("elementId invalide");
    }
    if (typeof rotation !== 'number' || rotation < -360 || rotation > 360) {
      throw new Error("Rotation invalide : doit être un nombre entre -360 et 360");
    }

    console.log("Mise à jour rotation :", { elementId, rotation });
    const response = await axiosClient.patch(`/elements/${elementId}/rotation`, { rotation });
    return response.data;
  } catch (error) {
    console.error("Erreur mise à jour rotation :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
    }
    throw error;
  }
};

/**
 * Met à jour les données d'un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @param {Object} data - Les nouvelles données de l'élément (nom, type, color, shape, width, height, etc.).
 * @returns {Promise<Object>} - L'élément mis à jour.
 */
export const updateElement = async (elementId, data) => {
  try {
    if (!elementId || elementId <= 0) {
      throw new Error("elementId invalide");
    }
    if (!data || Object.keys(data).length === 0) {
      throw new Error("Aucune donnée à mettre à jour");
    }

    // Validation des champs spécifiques
    if (data.nom && (!data.nom.trim() || data.nom.length > 100)) {
      throw new Error("Nom invalide : doit être non vide et < 100 caractères");
    }

    if (data.type) {
      const validTypes = ['porte_entree', 'porte_sortie', 'estrade', 'buffet', 'piste_danse', 'bar', 'ecran', 'photobooth', 'decoration', 'custom'];
      if (!validTypes.includes(data.type)) {
        throw new Error("Type invalide");
      }
      if (data.type === 'custom' && (!data.shape || !['rond', 'carre', 'rectangle', 'triangle'].includes(data.shape))) {
        throw new Error("Shape invalide pour type 'custom' (doit être rond, carre, rectangle ou triangle)");
      }
    }

    if (data.width && (data.width <= 0 || data.width > 500)) {
      throw new Error("Largeur invalide : entre 1 et 500");
    }

    if (data.height && (data.height <= 0 || data.height > 500)) {
      throw new Error("Hauteur invalide : entre 1 et 500");
    }

    if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      throw new Error("Couleur invalide : doit être un hexadécimal (ex: #d1d5db)");
    }

    // Ajout de valeurs par défaut si manquantes (harmonisé avec backend)
    const validatedData = { ...data };
    if (data.type && data.type !== 'custom' && data.shape) {
      console.warn("Shape ignoré pour type non-custom ; forcé à 'rectangle'");
      validatedData.shape = 'rectangle';
    }
    if (!validatedData.width) validatedData.width = 80;
    if (!validatedData.height) validatedData.height = 80;

    console.log("Données envoyées pour mise à jour :", validatedData);
    const response = await axiosClient.patch(`/elements/${elementId}`, validatedData);
    return response.data;
  } catch (error) {
    console.error("Erreur mise à jour élément :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
      // toast.error(`Erreur: ${error.response.data.message || "Échec de la mise à jour"}`);
    }
    throw error;
  }
};

/**
 * Supprime un élément.
 * @param {number} elementId - L'ID de l'élément.
 * @returns {Promise<Object>} - La réponse de la suppression.
 */
export const deleteElement = async (elementId) => {
  try {
    if (!elementId || elementId <= 0) {
      throw new Error("elementId invalide");
    }

    console.log("Suppression élément :", elementId);
    const response = await axiosClient.delete(`/elements/${elementId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur suppression élément :", error);
    if (error.response) {
      console.error("Détails serveur :", error.response.data);
    }
    throw error;
  }
};