import React, { useState, useRef, useEffect } from "react";
import { Edit, Plus, RefreshCcw, User } from "lucide-react";
import { useStateContext } from "../../context/ContextProvider";
import {
  updateTablePosition,
  updateRotation,
  deleteTable,
  reassignGuestToTable,
  updateTable,
} from "../../services/tableService";
import { createTable } from "../../services/tableService";
import { createInviteForSpecificEvent } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { textControll, getMaxCapacity } from "../../services/controll_champs/controll_champs";
import toast, { Toaster } from "react-hot-toast";

// Définition des types de tables avec leurs dimensions
const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
];

// Fonction pour aligner les positions sur une grille (snap to grid)
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Calcule les positions des chaises autour de la table en fonction de son type et de sa capacité
function getChairPositions(type, capacity, tableWidth, tableHeight) {
  const positions = [];
  const chairSize = 30; // Taille de la chaise (en pixels)
  const minDistanceFromTable = 0; // Distance minimale entre la chaise et la table

  if (type === "ronde" || type === "ovale") {
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;
    const tableRadius = type === "ronde"
      ? Math.min(tableWidth, tableHeight) / 2
      : Math.max(tableWidth, tableHeight) / 2;
    const radius = tableRadius + minDistanceFromTable + chairSize / 2;

    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i) / capacity - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle) - chairSize / 2;
      const y = centerY + radius * Math.sin(angle) - chairSize / 2;
      positions.push({ left: `${x}px`, top: `${y}px` });
    }
  } else {
    const perimetre = 2 * (tableWidth + tableHeight);
    const spacingBetweenChairs = perimetre / capacity;
    const topChairs = Math.round((tableWidth / spacingBetweenChairs));
    const rightChairs = Math.round((tableHeight / spacingBetweenChairs));
    const bottomChairs = Math.round((tableWidth / spacingBetweenChairs));
    const leftChairs = capacity - topChairs - rightChairs - bottomChairs;

    let count = 0;

    if (topChairs > 0) {
      const spacing = tableWidth / (topChairs + 1);
      for (let i = 0; i < topChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${(i + 1) * spacing - chairSize / 2}px`,
          top: `${-minDistanceFromTable - chairSize}px`
        });
      }
    }

    if (rightChairs > 0) {
      const spacing = tableHeight / (rightChairs + 1);
      for (let i = 0; i < rightChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth + minDistanceFromTable}px`,
          top: `${(i + 1) * spacing - chairSize / 2}px`,
        });
      }
    }

    if (bottomChairs > 0) {
      const spacing = tableWidth / (bottomChairs + 1);
      for (let i = 0; i < bottomChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableWidth - (i + 1) * spacing - chairSize / 2}px`,
          top: `${tableHeight + minDistanceFromTable}px`,
        });
      }
    }

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

// Composant Chaise : représente une chaise autour d'une table
function Chair({ number, style, isOccupied, guestName, onClick, isSelected, isMoving }) {
  return (
    <div
      className={`w-5 h-5 rounded-full absolute border border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-all duration-200 ${isOccupied
          ? "bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600"
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

// Composant Table : représente une table avec ses chaises
function Table({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace, onEdit, movingGuest }) {
  if (!table) return null;

  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState(table.position ?? { left: 100, top: 100 });
  const [rotation, setRotation] = useState(table.rotation ?? 0);
  const touchDataRef = useRef({});

  useEffect(() => {
    setPos(table.position ?? { left: 100, top: 100 });
    setRotation(table.rotation ?? 0);
  }, [table.position, table.rotation]);

  const tableType = TABLE_TYPES.find(t => t.value === table.type) || TABLE_TYPES[0];
  const { width: tableWidth, height: tableHeight } = tableType;

  const handleDragStart = (e) => {
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
    setDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!ref.current) return;
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    const x = snapToGrid(e.clientX - parentRect.left - tableWidth / 2);
    const y = snapToGrid(e.clientY - parentRect.top - tableHeight / 2);
    const maxX = 900 - tableWidth;
    const maxY = 650 - tableHeight;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    const newPos = { left: boundedX, top: boundedY };
    setPos(newPos);
    setDragging(false);
    onMove(table.id, newPos);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!ref.current) return;

    const tableElement = e.currentTarget;
    const tableRect = tableElement.getBoundingClientRect();
    const dragAreaRect = ref.current.parentNode.getBoundingClientRect();

    touchDataRef.current[table.id] = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: pos.left,
      initialTop: pos.top,
      offsetX: touch.clientX - tableRect.left,
      offsetY: touch.clientY - tableRect.top,
      dragAreaLeft: dragAreaRect.left,
      dragAreaTop: dragAreaRect.top
    };

    setDragging(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const touchData = touchDataRef.current[table.id];

    if (!touchData) return;

    const newX = touch.clientX - touchData.dragAreaLeft - touchData.offsetX;
    const newY = touch.clientY - touchData.dragAreaTop - touchData.offsetY;

    const maxX = 900 - tableWidth;
    const maxY = 650 - tableHeight;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));

    setPos({ left: boundedX, top: boundedY });
  };

  const handleTouchEnd = () => {
    delete touchDataRef.current[table.id];
    setDragging(false);
    onMove(table.id, pos);
  };

  const isChairOccupied = (chairIndex) => {
    return table.guests?.some(g => g.place === chairIndex + 1);
  };

  const getGuestForChair = (chairIndex) => {
    return table.guests?.find(g => g.place === chairIndex + 1);
  };

  const handleChairClick = (chairIndex) => {
    onPlaceClick(table, chairIndex + 1);
  };

  return (
    <div
      ref={ref}
      className="absolute select-none"
      style={{
        left: pos.left,
        top: pos.top,
        width: tableWidth,
        height: tableHeight,
        zIndex: dragging ? 50 : 10,
        touchAction: 'none',
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={() => onEdit(table)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(table);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 z-30 md:hidden"
        title="Modifier la table"
      >
        <Edit className="w-3 h-3" />
      </button>

      <div
        className={`border-4 border-indigo-400 shadow-md flex items-center justify-center ${table.type === "ronde" || table.type === "ovale"
            ? "rounded-full"
            : "rounded-md"
          } w-full h-full bg-pink-200 relative transition-shadow duration-200 ${dragging ? 'shadow-2xl scale-105' : 'shadow-md'
          }`}
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <span className="font-bold text-indigo-700 select-none pointer-events-none">
          {table.nom}
        </span>

        {getChairPositions(
          table.type,
          table.capacite,
          tableWidth,
          tableHeight
        ).map((chairPos, i) => {
          const isOccupied = isChairOccupied(i);
          const guest = getGuestForChair(i);
          const isSelected = selectedPlace?.tableId === table.id && selectedPlace?.placeNumber === i + 1;
          const isMovingTarget = movingGuest && movingGuest.guestId !== guest?.id;

          return (
            <Chair
              key={i}
              number={i + 1}
              style={chairPos}
              isOccupied={isOccupied}
              guestName={guest?.nom}
              onClick={(e) => {
                e.stopPropagation();
                handleChairClick(i);
              }}
              isSelected={isSelected}
              isMoving={isMovingTarget}
            />
          );
        })}
      </div>
    </div>
  );
}

// Modal pour créer des tables
function TableCreationModal({ isOpen, onClose, onAddTables, events, tables, eventId }) {
  const [form, setForm] = useState({
    capacite: "",
    type: "ronde",
    nombre: "",
    noms: [],
    eventId: eventId || 0 // Utiliser l'eventId passé en prop
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  // Gère le changement du nombre de tables
  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill("")
    }));
  };

  // Gère le changement du nom d'une table
  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "capacite") {
      const numericValue = parseInt(value, 10);
      const max = getMaxCapacity(form.type);
      if (numericValue > max) {
        setError(`La capacité maximale pour une table ${form.type} est ${max}`);
        return;
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: numericValue });
      return;
    }

    if (name === "type") {
      const max = getMaxCapacity(value);
      const newCapacite = Math.min(form.capacite, max);
      if (form.capacite > max) {
        setError(`Capacité ajustée à ${newCapacite} pour le type ${value}`);
      } else {
        setError(null);
      }
      setForm({ ...form, [name]: value, capacite: newCapacite });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  // Sélectionne un événement
  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm((prev) => ({ ...prev, eventId: event.id }));
  };

  // Soumet le formulaire pour créer les tables
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      toast.error("Veuillez sélectionner un événement");
      return;
    }

    try {
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `Table ${index + 1}`
      );

      // Préparer les données pour chaque table
      const formDataArray = nomsFinal.map((nom, index) => ({
        nom,
        capacite: Number(form.capacite),
        type: form.type,
        eventId: Number(form.eventId),
        position: {
          left: 100 + (index * 20),
          top: 100 + (index * 20)
        },
        width: TABLE_TYPES.find(t => t.value === form.type).width,
        height: TABLE_TYPES.find(t => t.value === form.type).height,
        rotation: 0,
        guests: []
      }));

      // Appeler le service pour créer les tables
      const response = await Promise.all(formDataArray.map((t) => createTable(t)));
      console.log("Réponse brute de createTable:", response); // Log pour débogage

      // Aplatir la réponse si elle est imbriquée
      const newTables = response.flat();
      console.log("Nouvelles tables après aplatissement:", newTables); // Log pour débogage

      // Vérifier que les tables ont le format attendu
      const formattedTables = newTables.map(table => ({
        id: table.id || table.tableId,
        nom: table.nom || table.name,
        capacite: table.capacite || table.capacity,
        type: table.type,
        eventId: Number(table.eventId), // Forcer la conversion en nombre
        position: table.position || { left: 100, top: 100 },
        width: table.width || TABLE_TYPES.find(t => t.value === table.type).width,
        height: table.height || TABLE_TYPES.find(t => t.value === table.type).height,
        rotation: table.rotation || 0,
        guests: table.guests || []
      }));

      // Log pour vérifier les eventId
      console.log("form.eventId:", form.eventId, "Type:", typeof form.eventId); // Log pour débogage
      console.log("Tables envoyées à onAddTables:", formattedTables); // Log pour débogage

      // Réinitialiser le formulaire
      setForm({ capacite: "", type: "ronde", nombre: "", noms: [], eventId: eventId || 0 });
      setSelectedEvent(null);

      // Mettre à jour l'état local directement
      onAddTables(formattedTables); // Passer toutes les tables sans filtrer
      onClose();

      toast.success(`${nomsFinal.length} table${nomsFinal.length > 1 ? 's' : ''} créée${nomsFinal.length > 1 ? 's' : ''} avec succès !`);
    } catch (err) {
      console.error("Erreur création tables:", err); // Log pour débogage
      setError(err.response?.data?.message || "Erreur lors de la création des tables");
      toast.error(err.response?.data?.message || "Erreur lors de la création des tables");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer des Tables</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Capacité</label>
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={handleChange}
                placeholder="Ex: 4, 6, 8"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Nombre de tables</label>
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleNombreChange}
                placeholder="Ex: 4"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Type de Table</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="ronde">Ronde</option>
                <option value="carree">Carrée</option>
                <option value="rectangle">Rectangle</option>
                <option value="ovale">Ovale</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                value={form.eventId}
                onChange={(e) => {
                  const eventId = Number(e.target.value);
                  const event = events.find(ev => ev.id === eventId);
                  if (event) selectEvent(event);
                }}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} ({new Date(event.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {form.noms.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Noms des tables</h3>
              {form.noms.map((nom, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">
                    Nom Table {index + 1}
                  </label>
                  <input
                    value={nom}
                    onChange={(e) => handleNomChange(index, e.target.value)}
                    placeholder={`Table ${index + 1}`}
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Créer les Tables
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal pour ajouter un invité
function GuestCreationModal({ isOpen, onClose, onAddGuest, tables, events }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
    eventId: null,
    tableId: null,
    place: null
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nom" || name === "prenom") {
      setForm({ ...form, [name]: textControll(value) });
    } else if (name === "tableId") {
      setForm({ ...form, [name]: value ? Number(value) : null, place: null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const selectedTable = tables.find(t => t.id === form.tableId);
  const occupiedPlaces = selectedTable?.guests?.map(g => g.place) || [];
  const availablePlaces = selectedTable ?
    Array.from({ length: selectedTable.capacite }, (_, i) => i + 1)
      .filter(place => !occupiedPlaces.includes(place)) : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form.eventId) {
      setError("Veuillez sélectionner un événement");
      toast.error("Veuillez sélectionner un événement");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await createInviteForSpecificEvent(form);
      console.log("Réponse brute de createInviteForSpecificEvent:", response);

      const newGuest = {
        id: response.id || response.guestId,
        nom: `${form.nom} ${form.prenom}`,
        prenom: form.prenom,
        email: form.email,
        sex: form.sex,
        eventId: Number(form.eventId),
        tableId: form.tableId ? Number(form.tableId) : null,
        place: form.place ? Number(form.place) : null
      };

      setForm({ nom: "", prenom: "", email: "", sex: "", eventId: null, tableId: null, place: null });

      console.log("Invité envoyé à onAddGuest:", newGuest);
      onAddGuest(newGuest);
      onClose();

      toast.success(`Invité ${form.nom} ${form.prenom} ajouté avec succès !`);
    } catch (err) {
      console.error("Erreur création invité:", err);
      setError(err.response?.data?.message || "Erreur lors de la création de l'invité");
      toast.error(err.response?.data?.message || "Erreur lors de la création de l'invité");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Ajouter un Invité</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
              <input
                name="nom"
                type="text"
                value={form.nom}
                onChange={handleChange}
                placeholder="Nom de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Prénom</label>
              <input
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Prénom de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email de l'invité"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Sexe</label>
              <select
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">-- Sélectionnez --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                name="eventId"
                value={form.eventId || ""}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Sélectionner un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom} ({new Date(event.date).toLocaleDateString("fr-FR")})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Table (Optionnel)</label>
              <select
                name="tableId"
                value={form.tableId || ""}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                <option value="">Assigner plus tard</option>
                {tables
                  .filter(table => {
                    const occupiedSeats = table.guests?.length || 0;
                    return occupiedSeats < table.capacite;
                  })
                  .map((table) => {
                    const occupiedSeats = table.guests?.length || 0;
                    const freeSeats = table.capacite - occupiedSeats;
                    return (
                      <option key={table.id} value={table.id}>
                        {table.nom} ({freeSeats} place{freeSeats !== 1 ? 's' : ''} libre{freeSeats !== 1 ? 's' : ''})
                      </option>
                    );
                  })
                }
              </select>
            </div>

            {form.tableId && availablePlaces.length > 0 && (
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-700 font-medium mb-2 text-sm">Place (Optionnel)</label>
                <select
                  name="place"
                  value={form.place || ""}
                  onChange={handleChange}
                  className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                >
                  <option value="">Attribution automatique</option>
                  {availablePlaces.map((place) => (
                    <option key={place} value={place}>
                      Place {place}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? 'Création...' : 'Ajouter l\'Invité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant principal : PlanSalle
export default function PlanSalle({ event, tables, setTables, onAddTable, onAddGuest }) {
  const { isAuthenticated } = useStateContext();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [movingGuest, setMovingGuest] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      getMyEvents()
        .then((response) => {
          console.log("Événements chargés:", response);
          setEvents(response);
        })
        .catch(err => {
          console.error("Erreur chargement événements:", err);
          toast.error("Erreur lors du chargement des événements");
        });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("État tables mis à jour:", tables);
  }, [tables]);

  const handlePlaceClick = (table, placeNumber) => {
    const guestAtPlace = table.guests?.find((g) => g.place === placeNumber);

    if (movingGuest) {
      const targetGuest = table.guests?.find(g => g.place === placeNumber);

      if (targetGuest) {
        toast.error("Cette chaise est déjà occupée !");
        return;
      }

      reassignGuestToTable(movingGuest.guestId, table.id, placeNumber)
        .then(() => {
          setTables((prevTables) =>
            prevTables.map((t) => {
              if (t.id === movingGuest.sourceTableId && t.id === table.id) {
                return {
                  ...t,
                  guests: t.guests.map((g) =>
                    g.id === movingGuest.guestId ? { ...g, place: placeNumber } : g
                  ),
                };
              } else if (t.id === movingGuest.sourceTableId) {
                return {
                  ...t,
                  guests: t.guests.filter((g) => g.id !== movingGuest.guestId),
                };
              } else if (t.id === table.id) {
                return {
                  ...t,
                  guests: [
                    ...t.guests.filter((g) => g.id !== movingGuest.guestId),
                    { id: movingGuest.guestId, nom: movingGuest.guestName, place: placeNumber },
                  ],
                };
              }
              return t;
            })
          );
          setMovingGuest(null);
          setSelectedPlace(null);
          toast.success(`Invité ${movingGuest.guestName} déplacé avec succès !`);
        })
        .catch((err) => {
          console.error("Erreur déplacement invité:", err);
          toast.error("Erreur lors du déplacement de l'invité");
        });
    } else {
      if (guestAtPlace) {
        setMovingGuest({
          guestId: guestAtPlace.id,
          guestName: guestAtPlace.nom,
          sourceTableId: table.id,
          sourceChairIndex: placeNumber
        });
        setSelectedPlace({
          tableId: table.id,
          placeNumber,
          guestId: guestAtPlace.id,
          guestName: guestAtPlace.nom,
        });
      }
    }
  };

  const cancelMove = () => {
    setMovingGuest(null);
    setSelectedPlace(null);
  };

  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, position } : t)));
    } catch (error) {
      console.error("Erreur mise à jour position:", error);
      toast.error("Erreur lors de la mise à jour de la position de la table");
    }
  };

  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, rotation } : t)));
    } catch (error) {
      console.error("Erreur rotation:", error);
      toast.error("Erreur lors de la rotation de la table");
    }
  };

  const handleTableDelete = async (tableId) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette table ? Tous les invités assignés seront également supprimés.");
    if (!confirmed) return;

    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      if (selectedPlace?.tableId === tableId) {
        setSelectedPlace(null);
        setMovingGuest(null);
      }
      toast.success("Table supprimée avec succès !");
    } catch (error) {
      console.error("Erreur suppression table:", error);
      toast.error("Erreur lors de la suppression de la table");
    }
  };

  const handleOpenEdit = (table) => setEditingTable(table);
  const handleCloseEdit = () => setEditingTable(null);

  const handleTableChange = async (id, field, value) => {
    try {
      const updatedData = { [field]: value };

      if (field === "type") {
        const typeInfo = TABLE_TYPES.find((type) => type.value === value);
        updatedData.width = typeInfo.width;
        updatedData.height = typeInfo.height;
      }

      if (field === "capacite") {
        updatedData.capacite = Number(value) || 1;
      }

      await updateTable(id, updatedData);

      setTables((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const updatedTable = { ...t, ...updatedData };
            if (field === "capacite" && updatedTable.guests) {
              updatedTable.guests = updatedTable.guests.filter(g => g.place <= updatedTable.capacite);
            }
            return updatedTable;
          }
          return t;
        })
      );
      toast.success("Table mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour table:", error);
      toast.error("Erreur lors de la modification de la table");
    }
  };

  const addNewTables = (newTables) => {
    console.log("Ajout de nouvelles tables dans addNewTables:", newTables);
    setTables(prev => {
      // Ajouter les nouvelles tables sans filtrer par eventId
      const updatedTables = [...prev, ...newTables];
      console.log("État tables après mise à jour:", updatedTables);
      return updatedTables;
    });
    if (onAddTable) {
      console.log("Appel de onAddTable avec:", newTables);
      onAddTable(newTables);
    }
  };

  const addNewGuest = (newGuest) => {
    console.log("Ajout d'un nouvel invité dans addNewGuest:", newGuest);
    if (newGuest.tableId && newGuest.place) {
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === newGuest.tableId) {
            const updatedTable = {
              ...t,
              guests: [
                ...(t.guests || []),
                {
                  id: newGuest.id,
                  nom: newGuest.nom,
                  place: newGuest.place
                }
              ]
            };
            console.log("Table mise à jour avec nouvel invité:", updatedTable);
            return updatedTable;
          }
          return t;
        })
      );
    }
    if (onAddGuest) {
      console.log("Appel de onAddGuest avec:", newGuest);
      onAddGuest(newGuest);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50">
        <button
          onClick={() => setShowGuestModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition hover:bg-green-700"
        >
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Ajouter invité</span>
        </button>

        <button
          onClick={() => setShowTableModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow flex items-center cursor-pointer justify-center sm:justify-start gap-2 transition hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Ajouter des tables</span>
        </button>

        <button
          onClick={() => {
            const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer toutes les tables ?");
            if (confirmed) {
              setTables([]);
              setMovingGuest(null);
              setSelectedPlace(null);
              toast.success("Plan réinitialisé avec succès !");
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition hover:bg-red-700"
        >
          <RefreshCcw className="w-5 h-5" />
          <span className="hidden sm:inline">Réinitialiser</span>
        </button>

        {movingGuest && (
          <button
            onClick={cancelMove}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg cursor-pointer shadow flex items-center justify-center sm:justify-start gap-2 transition hover:bg-yellow-700"
          >
            <span className="hidden sm:inline">Annuler déplacement</span>
            <span className="sm:hidden">✕</span>
          </button>
        )}
      </div>

      <div className="relative w-[900px] h-[650px] bg-white border border-gray-300 rounded-2xl shadow-2xl max-w-full max-h-[80vh] overflow-hidden">
        {movingGuest && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded-lg z-40 text-center">
            Mode déplacement: <strong>{movingGuest.guestName}</strong> - Cliquez sur une chaise libre pour déplacer l'invité
          </div>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow z-30">
          Plan des Tables - {event?.nom || "Événement"}
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {tables.map((table) => (
          <Table
            key={table.id}
            table={table}
            onMove={handleTableMove}
            onRotate={handleTableRotate}
            onDelete={handleTableDelete}
            onPlaceClick={handlePlaceClick}
            selectedPlace={selectedPlace}
            onEdit={handleOpenEdit}
            movingGuest={movingGuest}
          />
        ))}

        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
            Aucune table créée. Ajoutez des tables depuis le bouton en bas à gauche.
          </div>
        )}
      </div>

      <TableCreationModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onAddTables={addNewTables}
        events={events}
        tables={tables}
        eventId={event?.id} // Passer l'eventId du composant parent
      />

      <GuestCreationModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onAddGuest={addNewGuest}
        tables={tables}
        events={events}
      />

      {/* {editingTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Modifier {editingTable.nom}
            </h2>
            <div className="space-y-4">
              <input
                defaultValue={editingTable.nom}
                onChange={(e) =>
                  handleTableChange(editingTable.id, "nom", e.target.value)
                }
                placeholder="Nom de la table"
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="number"
                defaultValue={editingTable.capacite}
                onChange={(e) =>
                  handleTableChange(editingTable.id, "capacite", e.target.value)
                }
                min="1"
                placeholder="Capacité"
                className="w-full border rounded-lg px-3 py-2"
              />
              <select
                defaultValue={editingTable.type}
                onChange={(e) =>
                  handleTableChange(editingTable.id, "type", e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                {TABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
                onClick={handleCloseEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                onClick={handleCloseEdit}
              >
                OK
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  handleTableDelete(editingTable.id);
                  handleCloseEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )} */}
      {editingTable && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Modification de {editingTable.nom}
            </h2>
            <div className="space-y-4">
              <p className="text-yellow-600 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
                🚧 <strong>Fonctionnalité en maintenance</strong> 🚧<br />
                La modification des tables est temporairement désactivée. Veuillez réessayer plus tard.
              </p>
              {/* Afficher les champs en lecture seule pour contexte */}
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
                <input
                  value={editingTable.nom}
                  disabled
                  placeholder="Nom de la table"
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Capacité</label>
                <input
                  type="number"
                  value={editingTable.capacite}
                  disabled
                  min="1"
                  placeholder="Capacité"
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Type</label>
                <select
                  value={editingTable.type}
                  disabled
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                >
                  {TABLE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
                onClick={handleCloseEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  handleTableDelete(editingTable.id);
                  handleCloseEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};