// Note: Le composant AuthModal doit être importé dans votre fichier parent
// import AuthModal from './path/to/AuthModal';

import { ArrowBack } from "@mui/icons-material";
import { Clock, Edit, Plus, RefreshCcw, Star, User } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { AuthModal } from "../components/Modal/authModal";

const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
];

// Limites pour la démo
const MAX_TABLES = 3;
const MAX_GUESTS = 3;

function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

function getChairPositions(type, capacity, tableWidth, tableHeight) {
  const positions = [];
  const chairSize = 30; // Taille approximative d'une chaise
  const minDistanceFromTable = 0; // Distance minimale entre la chaise et la table
  if (type === "ronde" || type === "ovale") {
    // Pour les tables rondes/ovales
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;

    // Calculer le rayon en fonction de la forme
    const tableRadius = type === "ronde"
      ? Math.min(tableWidth, tableHeight) / 2
      : Math.max(tableWidth, tableHeight) / 2;

    const radius = tableRadius + minDistanceFromTable + chairSize / 2;

    for (let i = 0; i < capacity; i++) {
      // Commencer à -π/2 pour que la première chaise soit en haut
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - chairSize / 2;
      const y = centerY + radius * Math.sin(angle) - chairSize / 2;
      positions.push({ left: `${x}px`, top: `${y}px` });
    }
  } else {
    // Pour les tables rectangulaires/carrées
    const perimetre = 2 * (tableWidth + tableHeight);
    const spacingBetweenChairs = perimetre / capacity;
    // Calculer combien de chaises par côté en fonction de l'espacement uniforme
    const topChairs = Math.round((tableWidth / spacingBetweenChairs));
    const rightChairs = Math.round((tableHeight / spacingBetweenChairs));
    const bottomChairs = Math.round((tableWidth / spacingBetweenChairs));
    const leftChairs = capacity - topChairs - rightChairs - bottomChairs;

    let count = 0;

    // Côté du haut
    if (topChairs > 0) {
      const spacing = tableWidth / (topChairs + 1);
      for (let i = 0; i < topChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${(i + 1) * spacing - chairSize / 2}px`,
          top: `${-minDistanceFromTable - chairSize}px`
        });
      }
    }

    // Côté droit
    if (rightChairs > 0) {
      const spacing = tableHeight / (rightChairs + 1);
      for (let i = 0; i < rightChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth + minDistanceFromTable}px`,
          top: `${(i + 1) * spacing - chairSize / 2}px`,
        });
      }
    }
    // Côté du bas
    if (bottomChairs > 0) {
      const spacing = tableWidth / (bottomChairs + 1);
      for (let i = 0; i < bottomChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth - (i + 1) * spacing - chairSize / 2}px`,
          top: `${tableHeight + minDistanceFromTable}px`,
        });
      }
    }
    // Côté gauche
    if (leftChairs > 0) {
      const spacing = tableHeight / (leftChairs + 1);
      for (let i = 0; i < leftChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${-minDistanceFromTable - chairSize}px`,
          top: `${tableHeight - (i + 1) * spacing - chairSize / 2}px`,
        });
      }
    }
  }
  
  return positions;
}

function Chair({ number, style, isOccupied, guestName, onClick, isSelected, isMoving }) {
  return (
    <div
      className={`w-5 h-5 rounded-full absolute border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all duration-200 ${isOccupied
          ? "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
          : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600"
        } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${isMoving ? 'ring-2 ring-yellow-400 ring-offset-1 animate-pulse' : ''
        }`}
      style={style}
      title={isOccupied ? `Place ${number} - ${guestName}` : `Place ${number} - Libre`}
      onClick={onClick}
    >
      {number}
    </div>
  );
}

// Types de modales pour une meilleure gestion
const MODAL_TYPES = {
  NONE: 'none',
  AUTH: 'auth',
  LIMIT: 'limit',
  ADD_TABLE: 'add_table',
  ADD_GUEST: 'add_guest',
  EDIT_TABLE: 'edit_table'
};

export default function DemoTable({ closeModal }) {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]); // {id, name, tableId, chairIndex}
  const [form, setForm] = useState({ nom: "", capacite: "", nombre: "" });
  const [guestForm, setGuestForm] = useState({ name: "", tableId: "" });
  const [selectedType, setSelectedType] = useState(TABLE_TYPES[0].value);
  const [showDragZone, setShowDragZone] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [movingGuest, setMovingGuest] = useState(null); // {guestId, sourceTableId, sourceChairIndex}
  
  // État unifié pour les modales
  const [currentModal, setCurrentModal] = useState(MODAL_TYPES.NONE);
  const [limitType, setLimitType] = useState(''); // 'tables' ou 'guests'

  // Refs pour le drag tactile
  const dragAreaRef = useRef(null);
  const touchDataRef = useRef({});

  // Fonction universelle pour fermer les modales
  const closeAllModals = useCallback(() => {
    setCurrentModal(MODAL_TYPES.NONE);
    setEditingTable(null);
    setLimitType('');
  }, []);

  // Fonction pour fermer une modale spécifique
  const closeModalType = useCallback((modalType) => {
    if (currentModal === modalType) {
      closeAllModals();
    }
  }, [currentModal, closeAllModals]);

  // Gestionnaire d'événement pour la touche Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      if (movingGuest) {
        setMovingGuest(null);
      } else {
        closeAllModals();
      }
    }
  }, [movingGuest, closeAllModals]);

  // Hook pour écouter la touche Escape
  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleGuestFormChange = (e) =>
    setGuestForm({ ...guestForm, [e.target.name]: e.target.value });

  const checkTableLimit = (newTablesCount) => {
    if (tables.length + newTablesCount > MAX_TABLES) {
      setLimitType('tables');
      setCurrentModal(MODAL_TYPES.LIMIT);
      return false;
    }
    return true;
  };

  const checkGuestLimit = () => {
    if (guests.length >= MAX_GUESTS) {
      setLimitType('guests');
      setCurrentModal(MODAL_TYPES.LIMIT);
      return false;
    }
    return true;
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    const newTables = [];
    const nombre = Number(form.nombre);
    if (nombre <= 0) return;

    // Vérifier la limite avant d'ajouter
    if (!checkTableLimit(nombre)) return;

    for (let i = 0; i < nombre; i++) {
      const typeInfo = TABLE_TYPES.find((t) => t.value === selectedType);
      newTables.push({
        id: Date.now() + i,
        nom: form.nom ? `${form.nom} ${i + 1}` : `Table ${i + 1}`,
        capacite: Number(form.capacite) || 4,
        type: selectedType,
        pos: { left: 100 + i * 20, top: 100 + i * 20 },
        dragging: false,
        width: typeInfo.width,
        height: typeInfo.height,
      });
    }
    setTables([...tables, ...newTables]);
    setForm({ nom: "", capacite: "", nombre: "" });
    setShowDragZone(true);
    closeModalType(MODAL_TYPES.ADD_TABLE);
  };

  const handleAddGuest = (e) => {
    e.preventDefault();
    
    // Vérifier la limite avant d'ajouter
    if (!checkGuestLimit()) return;

    const table = tables.find(t => t.id === Number(guestForm.tableId));
    if (!table) return;

    // Trouver la première chaise libre
    const occupiedChairs = guests.filter(g => g.tableId === table.id).map(g => g.chairIndex);
    let freeChairIndex = -1;
    for (let i = 0; i < table.capacite; i++) {
      if (!occupiedChairs.includes(i)) {
        freeChairIndex = i;
        break;
      }
    }

    if (freeChairIndex === -1) {
      alert("Aucune place libre sur cette table!");
      return;
    }

    const newGuest = {
      id: Date.now(),
      name: guestForm.name,
      tableId: table.id,
      chairIndex: freeChairIndex
    };

    setGuests([...guests, newGuest]);
    setGuestForm({ name: "", tableId: "" });
    closeModalType(MODAL_TYPES.ADD_GUEST);
  };

  const handleChairClick = (tableId, chairIndex) => {
    if (movingGuest) {
      // Mode déplacement - déplacer l'invité vers cette chaise
      const targetGuest = guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);
      if (targetGuest) {
        alert("Cette chaise est déjà occupée!");
        return;
      }

      setGuests(prev => 
        prev.map(g => 
          g.id === movingGuest.guestId 
            ? { ...g, tableId, chairIndex }
            : g
        )
      );
      setMovingGuest(null);
    } else {
      // Mode sélection - sélectionner un invité à déplacer
      const guest = guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);
      if (guest) {
        setMovingGuest({
          guestId: guest.id,
          sourceTableId: tableId,
          sourceChairIndex: chairIndex
        });
      }
    }
  };

  const cancelMove = () => {
    setMovingGuest(null);
  };

  const isChairOccupied = (tableId, chairIndex) => {
    return guests.some(g => g.tableId === tableId && g.chairIndex === chairIndex);
  };

  const getGuestForChair = (tableId, chairIndex) => {
    return guests.find(g => g.tableId === tableId && g.chairIndex === chairIndex);
  };

  const handleDragStart = (id, e) => {
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: true } : { ...t, dragging: false }
      )
    );
  };

  const handleDragEnd = (id, e) => {
    const table = tables.find((t) => t.id === id);
    if (!table) return;
    
    const dragArea = dragAreaRef.current;
    if (!dragArea) return;
    
    const dragAreaRect = dragArea.getBoundingClientRect();
    const scrollContainer = dragArea;
    
    // Calculer la position relative au conteneur scrollable
    const x = snapToGrid(
      e.clientX - dragAreaRect.left + scrollContainer.scrollLeft - table.width / 2
    );
    const y = snapToGrid(
      e.clientY - dragAreaRect.top + scrollContainer.scrollTop - table.height / 2
    );
    
    // Limites étendues pour la zone scrollable
    const maxX = 1200 - table.width;
    const maxY = 800 - table.height;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setTables((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, pos: { left: boundedX, top: boundedY }, dragging: false }
          : t
      )
    );
  };

  const handleOpenEdit = (table) => {
    setEditingTable(table);
    setCurrentModal(MODAL_TYPES.EDIT_TABLE);
  };

  const handleTableChange = (id, field, value) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedTable = { ...t, [field]: value };
          if (field === "type") {
            const typeInfo = TABLE_TYPES.find((type) => type.value === value);
            updatedTable.width = typeInfo.width;
            updatedTable.height = typeInfo.height;
          }
          if (field === "capacite") {
            updatedTable.capacite = Number(value) || 1;
            // Supprimer les invités dont les chaises n'existent plus
            setGuests(prev =>
              prev.filter(g => g.tableId !== id || g.chairIndex < updatedTable.capacite)
            );
          }
          return updatedTable;
        }
        return t;
      })
    );
    
    // Mettre à jour aussi editingTable pour refléter les changements en temps réel
    if (editingTable && editingTable.id === id) {
      setEditingTable(prev => ({ ...prev, [field]: value }));
    }
  };

  // Fonction pour supprimer une table
  const handleDeleteTable = (tableId) => {
    // Supprimer aussi tous les invités de cette table
    setGuests(prev => prev.filter(g => g.tableId !== tableId));
    setTables(prev => prev.filter(t => t.id !== tableId));
    closeAllModals();
  };

  // Fonction pour réinitialiser tout
  const handleReset = () => {
    setTables([]);
    setGuests([]);
    setMovingGuest(null);
    closeAllModals();
  };

  // Fonctions pour le drag tactile améliorées
  const handleTouchStart = (id, e) => {
    e.preventDefault();

    const touch = e.touches[0];
    const table = tables.find((t) => t.id === id);
    if (!table) return;

    // Calculer l'offset du toucher par rapport à la position de la table
    const tableElement = e.currentTarget;
    const tableRect = tableElement.getBoundingClientRect();
    const dragAreaRect = dragAreaRef.current.getBoundingClientRect();
    touchDataRef.current[id] = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: table.pos.left,
      initialTop: table.pos.top,
      offsetX: touch.clientX - tableRect.left,
      offsetY: touch.clientY - tableRect.top,
      dragAreaLeft: dragAreaRect.left,
      dragAreaTop: dragAreaRect.top
    };

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: true } : { ...t, dragging: false }
      )
    );
  };

  const handleTouchMove = (id, e) => {
    e.preventDefault();

    const touch = e.touches[0];
    const table = tables.find((t) => t.id === id);
    const touchData = touchDataRef.current[id];

    if (!table || !touchData) return;

    const dragArea = dragAreaRef.current;
    if (!dragArea) return;

    // Calculer la nouvelle position en tenant compte du scroll
    const newX = touch.clientX - touchData.dragAreaLeft - touchData.offsetX + dragArea.scrollLeft;
    const newY = touch.clientY - touchData.dragAreaTop - touchData.offsetY + dragArea.scrollTop;
    
    // Appliquer le snap et les limites étendues
    const maxX = 1200 - table.width;
    const maxY = 800 - table.height;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));

    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, pos: { left: boundedX, top: boundedY } } : t
      )
    );
  };

  const handleTouchEnd = (id) => {
    delete touchDataRef.current[id];
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, dragging: false } : t
      )
    );
  };

  // Composant Modal générique
  const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className={`bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4 ${className}`}>
          {title && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 p-4 lg:p-8 gap-4 lg:gap-8 overflow-auto w-full">
      {/* Bouton fermer unique et amélioré */}
      <div
        className="text-2xl font-bold p-2 rounded-full mr-10 hover:bg-white/20 transition-colors cursor-pointer z-[999] pointer-events-auto"
        aria-label="Fermer la démonstration"
      >
        <ArrowBack onClick={closeModal} className="text-transparent"/>
      </div>

      {/* Modal de limite atteinte */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.LIMIT}
        onClose={() => closeModalType(MODAL_TYPES.LIMIT)}
        title="Limite atteinte"
      >
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            {limitType === 'tables' 
              ? `Vous avez atteint la limite de ${MAX_TABLES} tables pour cette démonstration.`
              : `Vous avez atteint la limite de ${MAX_GUESTS} invités pour cette démonstration.`
            }
          </p>
          <p className="text-indigo-600 font-semibold">
            Connectez-vous pour débloquer toutes les fonctionnalités et créer des événements sans limites !
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => closeModalType(MODAL_TYPES.LIMIT)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 cursor-pointer transition"
          >
            Continuer la démo
          </button>
          <button
            onClick={() => {
              closeModalType(MODAL_TYPES.LIMIT);
              setCurrentModal(MODAL_TYPES.AUTH);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition"
          >
            Se connecter
          </button>
        </div>
      </Modal>

      {/* Modal AuthModal pour la connexion */}
      {currentModal === MODAL_TYPES.AUTH && (
        <AuthModal
          isOpen={true}
          onClose={() => closeModalType(MODAL_TYPES.AUTH)}
          isSignIn={true}
        />
      )}

      {/* Formulaire initial */}
      {!showDragZone && (
        <div className="w-full max-w-md lg:w-[400px] mx-auto ">
          <form
            onSubmit={handleAddTable}
            className="p-6 bg-white shadow-lg rounded-xl border border-gray-200"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Créer une Table
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                name="nom"
                value={form.nom}
                onChange={handleFormChange}
                placeholder="Nom table"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={handleFormChange}
                required
                min="1"
                placeholder="Capacité"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleFormChange}
                required
                min="1"
                placeholder="Nombre de tables"
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {TABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full mt-6 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
            >
              Ajouter
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Limite démo: {tables.length}/{MAX_TABLES} tables
            </p>
          </form>
        </div>
      )}

      {/* Zone Drag & Drop */}
      {showDragZone && (
        <>
          {/* Modal Ajouter Invité */}
          <Modal
            isOpen={currentModal === MODAL_TYPES.ADD_GUEST}
            onClose={() => closeModalType(MODAL_TYPES.ADD_GUEST)}
            title="Ajouter un Invité"
          >
            <form onSubmit={handleAddGuest}>
              <input
                name="name"
                value={guestForm.name}
                onChange={handleGuestFormChange}
                placeholder="Nom de l'invité"
                required
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              <select
                name="tableId"
                value={guestForm.tableId}
                onChange={handleGuestFormChange}
                required
                className="w-full border rounded-lg px-3 py-2 mb-4"
              >
                <option value="">Sélectionner une table</option>
                {tables.map((table) => {
                  const occupiedSeats = guests.filter(g => g.tableId === table.id).length;
                  const freeSeats = table.capacite - occupiedSeats;
                  return (
                    <option key={table.id} value={table.id} disabled={freeSeats === 0}>
                      {table.nom} ({freeSeats} place{freeSeats !== 1 ? 's' : ''} libre{freeSeats !== 1 ? 's' : ''})
                    </option>
                  );
                })}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => closeModalType(MODAL_TYPES.ADD_GUEST)}
                  className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Limite démo: {guests.length}/{MAX_GUESTS} invités
            </p>
          </Modal>

          {/* Modal ajout table */}
          <Modal
            isOpen={currentModal === MODAL_TYPES.ADD_TABLE}
            onClose={() => closeModalType(MODAL_TYPES.ADD_TABLE)}
            title="Ajouter des Tables"
          >
            <form onSubmit={handleAddTable}>
              <input
                name="nom"
                value={form.nom}
                onChange={handleFormChange}
                placeholder="Nom de la table"
                required
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={handleFormChange}
                placeholder="Capacité"
                required
                min="1"
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleFormChange}
                placeholder="Nombre de tables"
                required
                min="1"
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              >
                {TABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => closeModalType(MODAL_TYPES.ADD_TABLE)}
                  className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-400 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Limite démo: {tables.length}/{MAX_TABLES} tables
            </p>
          </Modal>

          {/* Boutons fixes flottants */}
          <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
            {/* Bouton Ajouter invité */}
            <button
              onClick={() => setCurrentModal(MODAL_TYPES.ADD_GUEST)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition hover:bg-green-700"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter invité</span>
            </button>

            {/* Bouton Ajouter des tables */}
            <button
              onClick={() => setCurrentModal(MODAL_TYPES.ADD_TABLE)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ajouter des tables</span>
            </button>

            {/* Bouton Réinitialiser */}
            <button
              onClick={handleReset}
              className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition hover:bg-red-700"
            >
              <RefreshCcw className="w-5 h-5" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>

            {/* Bouton Annuler déplacement */}
            {movingGuest && (
              <button
                onClick={cancelMove}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition hover:bg-yellow-700 animate-pulse"
              >
                <span className="hidden sm:inline">Annuler déplacement</span>
                <span className="sm:hidden">✕</span>
              </button>
            )}
          </div>

          {/* Zone tables avec scroll */}
          <div className="flex-1 flex items-center justify-center relative">
            <div
              ref={dragAreaRef}
              className="relative w-full h-[60vh] lg:w-[800px] lg:h-[500px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-auto"
              style={{ 
                touchAction: 'pan-x pan-y', // Permet le scroll mais gère le drag
                scrollBehavior: 'smooth'
              }}
            >
              {/* Zone de contenu étendue pour permettre le scroll */}
              <div 
                className="relative min-w-[1200px] min-h-[800px] bg-gradient-to-br from-blue-50/30 to-indigo-50/30"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0),
                    radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.05) 1px, transparent 0)
                  `,
                  backgroundSize: '100px 100px'
                }}
              >
              {movingGuest && (
                <div className="absolute top-4 left-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg z-50 animate-pulse shadow-md">
                  Mode déplacement: Cliquez sur une chaise libre pour déplacer l'invité
                </div>
              )}

              {/* Indicateurs de zone de scroll */}
              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-lg text-xs text-gray-600 shadow-sm z-40 backdrop-blur-sm">
                Zone scrollable: {tables.length} table{tables.length !== 1 ? 's' : ''}
              </div>

              {tables.map((table) => (
                <div
                  key={table.id}
                  draggable
                  onDragStart={(e) => handleDragStart(table.id, e)}
                  onDragEnd={(e) => handleDragEnd(table.id, e)}
                  onTouchStart={(e) => handleTouchStart(table.id, e)}
                  onTouchMove={(e) => handleTouchMove(table.id, e)}
                  onTouchEnd={() => handleTouchEnd(table.id)}
                  className={`absolute select-none transition-all duration-200 ${
                    table.dragging ? 'cursor-grabbing z-50' : 'cursor-grab z-10'
                  }`}
                  style={{
                    left: table.pos.left,
                    top: table.pos.top,
                    width: table.width,
                    height: table.height,
                    touchAction: 'none', // Désactive le scroll pendant le drag
                  }}
                  onDoubleClick={() => handleOpenEdit(table)}
                >
                  <div
                    className={`border-4 border-indigo-400 shadow-md flex items-center justify-center ${table.type === "ronde" || table.type === "ovale"
                      ? "rounded-full"
                      : "rounded-md"
                      } w-full h-full bg-pink-200 relative transition-all duration-200 ${
                        table.dragging ? 'shadow-2xl scale-105 border-indigo-600' : 'shadow-md hover:shadow-lg'
                      }`}
                  >
                    {/* Bouton d'édition pour mobile */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(table);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 z-30 md:hidden transition-colors"
                      title="Modifier la table"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-indigo-700 select-none pointer-events-none text-center break-words px-2">
                      {table.nom}
                    </span>
                    {getChairPositions(
                      table.type,
                      table.capacite,
                      table.width,
                      table.height
                    ).map((pos, i) => {
                      const isOccupied = isChairOccupied(table.id, i);
                      const guest = getGuestForChair(table.id, i);
                      const isSelected = movingGuest?.sourceTableId === table.id && movingGuest?.sourceChairIndex === i;
                      const isMovingTarget = movingGuest && movingGuest.guestId !== guest?.id;

                      return (
                        <Chair
                          key={i}
                          number={i + 1}
                          style={pos}
                          isOccupied={isOccupied}
                          guestName={guest?.name}
                          onClick={() => handleChairClick(table.id, i)}
                          isSelected={isSelected}
                          isMoving={isMovingTarget}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Modal Modification */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.EDIT_TABLE && editingTable}
        onClose={() => closeModalType(MODAL_TYPES.EDIT_TABLE)}
        title={`Modifier ${editingTable?.nom || 'la table'}`}
      >
        {editingTable && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la table
                </label>
                <input
                  type="text"
                  value={editingTable.nom}
                  onChange={(e) =>
                    handleTableChange(editingTable.id, "nom", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nom de la table"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité
                </label>
                <input
                  type="number"
                  value={editingTable.capacite}
                  onChange={(e) =>
                    handleTableChange(editingTable.id, "capacite", e.target.value)
                  }
                  min="1"
                  max="20"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forme de la table
                </label>
                <select
                  value={editingTable.type}
                  onChange={(e) =>
                    handleTableChange(editingTable.id, "type", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TABLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => closeModalType(MODAL_TYPES.EDIT_TABLE)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 cursor-pointer transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => closeModalType(MODAL_TYPES.EDIT_TABLE)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => handleDeleteTable(editingTable.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
              >
                Supprimer
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Instructions */}
      <div className="max-w-full sm:max-w-xl w-full mx-auto p-3 sm:p-6 animate-fade-in animate-slide-up">
        <h2 className="text-base sm:text-2xl font-extrabold text-indigo-700 mb-3 sm:mb-4 tracking-wide drop-shadow-sm">
          Instructions
        </h2>

        <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-gray-700 prose prose-sm sm:prose">
          <li>Ajoutez une table via le formulaire. Une fois créée, vous pouvez la déplacer librement dans la zone.</li>
          <li>Pour modifier une table : double-cliquez dessus sur desktop ou utilisez le bouton "Edit" sur mobile pour changer son nom, sa capacité ou sa forme.</li>
          <li>Les chaises se positionnent automatiquement autour de la table selon sa forme et sa capacité.</li>
          <li>Tables rondes/ovales → chaises en cercle. Tables carrées/rectangulaires → chaises sur les côtés.</li>
          <li>Une fois la table créée, vous pouvez ajouter des invités à chaque table.</li>
          <li>Ajoutez plusieurs tables en répétant l'opération depuis le formulaire.</li>
          <li>Faites glisser les tables pour réorganiser votre plan et optimiser l'espace.</li>
          <li>Appuyez sur <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Échap</kbd> pour fermer les modales ou annuler le déplacement d'invités.</li>
        </ul>

        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium flex items-center">
            <Clock className="w-[1vw] h-[1vw] mr-1"/>  Version démo limitée:
          </p>
          <p className="text-xs text-amber-700 mt-1">
            • Maximum {MAX_TABLES} tables<br/>
            • Maximum {MAX_GUESTS} invités<br/>
            • Connectez-vous pour des événements illimités
          </p>
        </div>

        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 italic">
          <strong>Astuces :</strong><br />
          • Glissez-déposez pour déplacer les tables<br />
          • Cliquez sur une chaise occupée pour sélectionner l'invité, puis cliquez sur une chaise libre pour le déplacer<br />
          • Double-cliquez sur une table pour la modifier<br />
          • Utilisez Échap pour fermer les modales rapidement
        </p>
      </div>
    </div>
  );
}