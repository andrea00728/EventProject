// Définition des types de tables avec leurs dimensions
export const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
  { value: "triangle", label: "Table triangulaire", width: 90, height: 78 }
];

// Définir les tailles prédéfinies pour le canvas
export const CANVAS_SIZES = [
  { label: "Normal", width: 900, height: 650 },
  { label: "Grand", width: 1200, height: 800 },
  { label: "Très grand", width: 1600, height: 1000 },
];

// Nouveaux types d'objets supplémentaires (portes, estrade, buffet, etc.)
export const ELEMENT_TYPES = [
  { value: "porte_entree", label: "Porte d'entrée", width: 40, height: 80 },
  { value: "porte_sortie", label: "Porte de sortie", width: 40, height: 80 },
  { value: "estrade", label: "Estrade", width: 200, height: 100 },
  { value: "buffet", label: "Table de buffet", width: 150, height: 50 },
  { value: "piste_danse", label: "Piste de danse", width: 300, height: 300 },
  { value: "bar", label: "Bar", width: 200, height: 60 },
  { value: "ecran", label: "Tableau/Écran", width: 100, height: 60 },
  { value: "photobooth", label: "Photobooth", width: 100, height: 100 },
  { value: "decoration", label: "Décoration", width: 80, height: 80 },
];