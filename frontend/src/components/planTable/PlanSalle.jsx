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

// Définir les tailles prédéfinies pour le canvas
const CANVAS_SIZES = [
  { label: "Normal", width: 900, height: 650 },
  { label: "Grand", width: 1200, height: 800 },
  { label: "Très grand", width: 1600, height: 1000 },
];

// Fonction pour aligner les positions sur une grille (snap to grid)
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Fonction pour aligner les angles de rotation sur une grille angulaire
function snapToAngle(value, angleStep = 15) {
  return Math.round(value / angleStep) * angleStep;
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
function Table({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace, onEdit, movingGuest, zoomLevel }) {
  if (!table) return null;

  const ref = useRef(null);
  const touchDataRef = useRef({});
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pos, setPos] = useState(table.position ?? { left: 100, top: 100 });
  const [rotation, setRotation] = useState(table.rotation ?? 0);

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
    const x = snapToGrid((e.clientX - parentRect.left - tableWidth / 2) / zoomLevel);
    const y = snapToGrid((e.clientY - parentRect.top - tableHeight / 2) / zoomLevel);
    const maxX = parentRect.width / zoomLevel - tableWidth;
    const maxY = parentRect.height / zoomLevel - tableHeight;
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

    const tableElement = ref.current;
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

    if (!touchData || !ref.current) return;

    const newX = (touch.clientX - touchData.dragAreaLeft - touchData.offsetX) / zoomLevel;
    const newY = (touch.clientY - touchData.dragAreaTop - touchData.offsetY) / zoomLevel;

    const maxX = ref.current.parentNode.getBoundingClientRect().width / zoomLevel - tableWidth;
    const maxY = ref.current.parentNode.getBoundingClientRect().height / zoomLevel - tableHeight;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));

    const newPos = { left: boundedX, top: boundedY };
    setPos(newPos);
  };

  const handleTouchEnd = () => {
    if (!touchDataRef.current[table.id] || !ref.current) return;

    const newPos = { left: pos.left, top: pos.top };
    delete touchDataRef.current[table.id];
    setDragging(false);
    onMove(table.id, newPos);
  };

  const handleRotate = (direction) => {
    setRotating(true);
    const angleStep = 15;
    const newRotation = snapToAngle(
      direction === "clockwise" ? rotation + angleStep : rotation - angleStep
    );
    setRotation(newRotation);
    onRotate(table.id, newRotation);
    setTimeout(() => setRotating(false), 300);
    toast.success(`Table ${table.nom} pivotée à ${newRotation}°`);
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
        left: pos.left * zoomLevel,
        top: pos.top * zoomLevel,
        width: tableWidth * zoomLevel,
        height: tableHeight * zoomLevel,
        zIndex: dragging || rotating ? 50 : 10,
        touchAction: 'none',
        transition: rotating ? 'none' : 'transform 0.3s ease'
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(table);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 z-30"
        title="Modifier la table"
      >
        <Edit className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("counterclockwise");
        }}
        className={`absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all ${rotating ? 'ring-2 ring-blue-300 animate-pulse' : ''}`}
        title="Pivoter à gauche"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("clockwise");
        }}
        className={`absolute -top-2 left-6 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all ${rotating ? 'ring-2 ring-blue-300 animate-pulse' : ''}`}
        title="Pivoter à droite"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(-90deg)' }} />
      </button>

      <div
        className={`border-4 border-indigo-400 shadow-md flex items-center justify-center ${table.type === "ronde" || table.type === "ovale"
          ? "rounded-full"
          : "rounded-md"
          } w-full h-full bg-pink-200 relative transition-shadow duration-200 ${dragging || rotating ? 'shadow-2xl scale-105' : 'shadow-md'
          } ${rotating ? 'ring-2 ring-blue-300' : ''}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: rotating ? 'none' : 'transform 0.3s ease'
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
              style={{
                ...chairPos,
                left: `calc(${chairPos.left} * ${zoomLevel})`,
                top: `calc(${chairPos.top} * ${zoomLevel})`,
                width: `${20 * zoomLevel}px`,
                height: `${20 * zoomLevel}px`,
                fontSize: `${10 * zoomLevel}px`
              }}
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
    eventId: eventId || 0
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill("")
    }));
  };

  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

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

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setForm((prev) => ({ ...prev, eventId: event.id }));
  };

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

      const response = await Promise.all(formDataArray.map((t) => createTable(t)));
      const newTables = response.flat();

      const formattedTables = newTables.map(table => ({
        id: table.id || table.tableId,
        nom: table.nom || table.name,
        capacite: table.capacite || table.capacity,
        type: table.type,
        eventId: Number(table.eventId),
        position: table.position || { left: 100, top: 100 },
        width: table.width || TABLE_TYPES.find(t => t.value === table.type).width,
        height: table.height || TABLE_TYPES.find(t => t.value === table.type).height,
        rotation: table.rotation || 0,
        guests: table.guests || []
      }));

      setForm({ capacite: "", type: "ronde", nombre: "", noms: [], eventId: eventId || 0 });
      setSelectedEvent(null);

      onAddTables(formattedTables);
      onClose();

      toast.success(`${nomsFinal.length} table${nomsFinal.length > 1 ? 's' : ''} créée${nomsFinal.length > 1 ? 's' : ''} avec succès !`);
    } catch (err) {
      console.error("Erreur création tables:", err);
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

// Modal pour définir une taille de canvas personnalisée
function CanvasSizeModal({ isOpen, onClose, onApplySize }) {
  const [customSize, setCustomSize] = useState({ width: 900, height: 650 });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    if (numericValue < 400) {
      setError("La largeur et la hauteur doivent être d'au moins 400px.");
      return;
    }
    setError(null);
    setCustomSize((prev) => ({ ...prev, [name]: numericValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customSize.width < 400 || customSize.height < 400) {
      setError("La largeur et la hauteur doivent être d'au moins 400px.");
      return;
    }
    onApplySize({ label: "Personnalisé", width: customSize.width, height: customSize.height });
    onClose();
    toast.success(`Taille personnalisée appliquée : ${customSize.width}x${customSize.height}px`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Taille du Canvas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Largeur (px)</label>
              <input
                name="width"
                type="number"
                value={customSize.width}
                onChange={handleChange}
                placeholder="Ex: 900"
                min="400"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Hauteur (px)</label>
              <input
                name="height"
                type="number"
                value={customSize.height}
                onChange={handleChange}
                placeholder="Ex: 650"
                min="400"
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>
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
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Appliquer
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
  const [showCanvasSizeModal, setShowCanvasSizeModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]); // Taille par défaut : Normal
  const [zoomLevel, setZoomLevel] = useState(1); // Niveau de zoom initial (100%)
  const canvasRef = useRef(null);

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

  // Gestion du zoom avec boutons (pas de 5%)
  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev + 0.05 : prev - 0.05;
      const boundedZoom = Math.max(0.5, Math.min(newZoom, 2)); // Limiter entre 50% et 200%
      toast.success(`Zoom : ${(boundedZoom * 100).toFixed(0)}%`);
      return boundedZoom;
    });
  };

  // Application d'une taille personnalisée
  const handleApplyCanvasSize = (newSize) => {
    setCanvasSize(newSize);
  };

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

        {/* Contrôle de la taille du canvas */}
        <div className="flex items-center gap-2">
          <select
            value={canvasSize.label}
            onChange={(e) => {
              if (e.target.value === "Personnalisé") {
                setShowCanvasSizeModal(true);
              } else {
                const selectedSize = CANVAS_SIZES.find(size => size.label === e.target.value);
                setCanvasSize(selectedSize);
                toast.success(`Taille du canvas : ${selectedSize.label}`);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow cursor-pointer transition hover:bg-blue-700"
          >
            {[...CANVAS_SIZES, { label: "Personnalisé", width: 0, height: 0 }].map(size => (
              <option key={size.label} value={size.label}>
                Taille : {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contrôle du zoom */}
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 0.5}
            className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <span className="text-sm font-medium text-gray-700">{(zoomLevel * 100).toFixed(0)}%</span>
          <button
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 2}
            className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="relative border-2 border-gray-200/60 rounded-3xl shadow-2xl max-w-full max-h-[80vh] overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <div
          className="relative"
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100/15 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 rounded-full blur-3xl"></div>

          {movingGuest && (
            <div className="absolute top-4 left-4 right-4 z-40 animate-slide-down">
              <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50/80 border border-amber-200/60 rounded-2xl p-4 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-yellow-100/20 animate-pulse"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-yellow-500"></div>
                <div className="relative flex items-center justify-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-amber-800 font-medium">
                      <span className="text-sm">Mode déplacement activé</span>
                      <div className="mt-1">
                        <span className="font-bold text-amber-900 bg-amber-200/50 px-2 py-1 rounded-lg">
                          {movingGuest.guestName}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">Cliquez sur une chaise libre pour déplacer l'invité</p>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <div className="relative text-center">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"></div>
              <div className="relative px-6 py-3">
                <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-800 bg-clip-text text-transparent tracking-wide drop-shadow-sm">
                  Plan des Tables - {event?.nom || "Événement"}
                </h1>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(129,140,248,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(129,140,248,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-200/30 to-transparent"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200/30 to-transparent"></div>
          </div>

          <div className="relative z-20 w-full h-full">
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
                zoomLevel={zoomLevel}
              />
            ))}
          </div>

          {tables.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-6 max-w-md mx-auto px-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                    Canvas vide
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 leading-relaxed">
                      Aucune table créée pour le moment
                    </p>
                    <p className="text-sm text-gray-500 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-200/50">
                      💡 Astuce : Ajoutez des tables depuis le bouton en bas à gauche pour commencer l'organisation de votre événement
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
                <div className="relative">
                  <div className="absolute -bottom-12 -left-16 transform rotate-12 animate-bounce text-indigo-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-indigo-200/50 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-indigo-200/50 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-indigo-200/50 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-indigo-200/50 rounded-br-lg"></div>
        </div>

        <style >{`
          @keyframes slide-down {
            from { 
              opacity: 0; 
              transform: translateY(-20px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          .animate-slide-down {
            animation: slide-down 0.5s ease-out;
          }
        `}</style>
      </div>

      <TableCreationModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onAddTables={addNewTables}
        events={events}
        tables={tables}
        eventId={event?.id}
      />

      <GuestCreationModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onAddGuest={addNewGuest}
        tables={tables}
        events={events}
      />

      <CanvasSizeModal
        isOpen={showCanvasSizeModal}
        onClose={() => setShowCanvasSizeModal(false)}
        onApplySize={handleApplyCanvasSize}
      />

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
}