import React, { useState, useRef, useEffect } from "react";
import { BarChart, Camera, Coffee, DoorClosed, Edit, Flower, GlassWater, LogOut, Monitor, Music, Package, Plus, RefreshCcw, User, Trash, Box } from "lucide-react";
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
import {
  createElement,
  getElementsByEventId,
  updateElementPosition,
  updateElementRotation,
  updateElement,
  deleteElement,
} from "../../services/elementService";
import { textControll, getMaxCapacity } from "../../services/controll_champs/controll_champs";
import toast, { Toaster } from "react-hot-toast";

// Définition des types de tables avec leurs dimensions
const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
  { value: "triangle", label: "Table triangulaire", width: 90, height: 78 }
];

// Définir les tailles prédéfinies pour le canvas
const CANVAS_SIZES = [
  { label: "Normal", width: 900, height: 650 },
  { label: "Grand", width: 1200, height: 800 },
  { label: "Très grand", width: 1600, height: 1000 },
];

// Nouveaux types d'objets supplémentaires (portes, estrade, buffet, etc.)
const ELEMENT_TYPES = [
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

// Fonction pour aligner les positions sur une grille (snap to grid)
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Fonction pour aligner les angles de rotation sur une grille angulaire
function snapToAngle(value, angleStep = 15) {
  return Math.round(value / angleStep) * angleStep;
}



// Calcule les positions des chaises autour de la table en fonction de son type et de sa capacité
function getChairPositions(type, capacity, tableWidth, tableHeight, rotation, zoomLevel) {
  const positions = [];
  const chairSize = 30;
  const minDistanceFromTable = 0;

  if (type === "triangle") {
    // Centre de la table
    const centerX = tableWidth / 2;
    const centerY = tableHeight / 2;
    // Points d'un triangle équilatéral (orienté vers le haut)
    const trianglePoints = [
      { x: centerX, y: centerY - (tableHeight / 2) * 0.866 }, // Sommet haut
      { x: centerX - tableWidth / 2, y: centerY + (tableHeight / 2) * 0.866 }, // Coin bas gauche
      { x: centerX + tableWidth / 2, y: centerY + (tableHeight / 2) * 0.866 }, // Coin bas droit
    ];
    // Répartir les chaises sur les 3 côtés
    const chairsPerSide = Math.ceil(capacity / 3);
    let chairIndex = 0;
    for (let side = 0; side < 3 && chairIndex < capacity; side++) {
      const point1 = trianglePoints[side];
      const point2 = trianglePoints[(side + 1) % 3];
      const chairsOnThisSide = Math.min(chairsPerSide, capacity - chairIndex);
      for (let i = 0; i < chairsOnThisSide; i++) {
        const ratio = (i + 1) / (chairsOnThisSide + 1);
        let x = point1.x + (point2.x - point1.x) * ratio;
        let y = point1.y + (point2.y - point1.y) * ratio;
        // Calculer la normale vers l'extérieur
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const normalX = -dy;
        const normalY = dx;
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY);
        const offsetDistance = chairSize / 2 + minDistanceFromTable + 10;
        const offsetX = (normalX / normalLength) * offsetDistance;
        const offsetY = (normalY / normalLength) * offsetDistance;
        // Appliquer la rotation de la table
        const angleRad = (rotation * Math.PI) / 180;
        const rotatedX = centerX + (x - centerX) * Math.cos(angleRad) - (y - centerY) * Math.sin(angleRad);
        const rotatedY = centerY + (x - centerX) * Math.sin(angleRad) + (y - centerY) * Math.cos(angleRad);
        positions.push({
          left: `calc(${rotatedX + offsetX - chairSize / 2}px * ${zoomLevel})`,
          top: `calc(${rotatedY + offsetY - chairSize / 2}px * ${zoomLevel})`,
          rotation: rotation, // Rotation de la chaise alignée avec la table
        });
        chairIndex++;
      }
    }
  } else {
    // Logique pour les autres formes (non modifiée)
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
      } ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''} ${isMoving ? 'ring-2 ring-yellow-400 ring-offset-1 animate-pulse' : ''}`}
      style={style} // Inclut transform: rotate(${rotation}deg)
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

  const handleDrag = (e) => {
    if (!ref.current || (e.clientX === 0 && e.clientY === 0)) return;
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    const x = snapToGrid((e.clientX - parentRect.left - tableWidth / 2) / zoomLevel);
    const y = snapToGrid((e.clientY - parentRect.top - tableHeight / 2) / zoomLevel);
    const maxX = parentRect.width / zoomLevel - tableWidth;
    const maxY = parentRect.height / zoomLevel - tableHeight;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));
    setPos({ left: boundedX, top: boundedY });
  };

  const handleDragEnd = () => {
    setDragging(false);
    onMove(table.id, pos);
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
    setPos({ left: boundedX, top: boundedY });
  };

  const handleTouchEnd = () => {
    if (!touchDataRef.current[table.id] || !ref.current) return;
    delete touchDataRef.current[table.id];
    setDragging(false);
    onMove(table.id, pos);
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
      className="absolute select-none group"
      style={{
        left: pos.left * zoomLevel,
        top: pos.top * zoomLevel,
        width: tableWidth * zoomLevel,
        height: tableHeight * zoomLevel,
        zIndex: dragging || rotating ? 50 : 10,
        touchAction: 'none',
        transition: dragging ? 'none' : 'all 0.2s ease'
      }}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
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
        className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Modifier la table"
      >
        <Edit className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("counterclockwise");
        }}
        className={`absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all duration-200 ${rotating ? 'ring-2 ring-blue-300 animate-spin-slow' : ''} opacity-0 group-hover:opacity-100`}
        title="Pivoter à gauche"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("clockwise");
        }}
        className={`absolute -top-2 left-6 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all duration-200 ${rotating ? 'ring-2 ring-blue-300 animate-spin-slow' : ''} opacity-0 group-hover:opacity-100`}
        title="Pivoter à droite"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(-90deg)' }} />
      </button>
      {table.type === "triangle" ? (
        <svg
          width={tableWidth * zoomLevel}
          height={tableHeight * zoomLevel}
          viewBox={`0 0 ${tableWidth} ${tableHeight}`}
          className={`shadow-md transition-all duration-300
            ${dragging ? 'shadow-2xl scale-110' : rotating ? 'shadow-xl scale-105 ring-2 ring-blue-300' : 'shadow-md'}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: rotating || dragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease, scale 0.3s ease',
          }}
        >
          <polygon
            points={`${tableWidth / 2},0 0,${tableHeight * 0.866} ${tableWidth},${tableHeight * 0.866}`}
            fill="#f9a8d4" // Rose pâle
            stroke="#4f46e5" // Indigo
            strokeWidth="4"
          />
          <polygon
            points={`${tableWidth / 2},0 0,${tableHeight * 0.866} ${tableWidth},${tableHeight * 0.866}`}
            fill="url(#gradient)"
            fillOpacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#4f46e5", stopOpacity: 0.2 }} />
              <stop offset="60%" style={{ stopColor: "transparent", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          <text
            x={tableWidth / 2}
            y={tableHeight / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold text-indigo-700 select-none pointer-events-none"
            style={{ fontSize: `${Math.max(10, tableWidth / 8)}px` }}
          >
            {table.nom}
          </text>
        </svg>
      ) : (
        <div
          className={`border-4 border-indigo-400 shadow-md flex items-center justify-center
            ${table.type === "ronde" || table.type === "ovale" ? "rounded-full" : "rounded-md"}
            w-full h-full bg-pink-200 relative transition-all duration-300
            ${dragging ? 'shadow-2xl scale-110' : rotating ? 'shadow-xl scale-105 ring-2 ring-blue-300' : 'shadow-md'}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: rotating || dragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease, scale 0.3s ease',
          }}
        >
          <span className="font-bold text-indigo-700 select-none pointer-events-none">
            {table.nom}
          </span>
        </div>
      )}
      {getChairPositions(table.type, table.capacite, tableWidth, tableHeight, rotation, zoomLevel).map((chairPos, i) => {
        const isOccupied = isChairOccupied(i);
        const guest = getGuestForChair(i);
        const isSelected = selectedPlace?.tableId === table.id && selectedPlace?.placeNumber === i + 1;
        const isMovingTarget = movingGuest && movingGuest.guestId !== guest?.id;
        return (
          <Chair
            key={i}
            number={i + 1}
            style={{
              left: chairPos.left,
              top: chairPos.top,
              width: `${20 * zoomLevel}px`,
              height: `${20 * zoomLevel}px`,
              fontSize: `${10 * zoomLevel}px`,
              transform: `rotate(${chairPos.rotation}deg)`
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
  );
}

// Composant Element : représente un objets supplémentaire (porte, estrade, etc.)
function Element({ element, onMove, onRotate, onSelect, onResize, canvasSize, isSelected, zoomLevel, onDelete }) { // Ajout de onDelete en prop
  const { id, nom, type, position, width, height, rotation, color, shape } = element;
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pos, setPos] = useState(position || { left: 100, top: 100 });
  const [currentRotation, setCurrentRotation] = useState(rotation || 0);
  const elementRef = useRef(null);
  const touchDataRef = useRef({});

  useEffect(() => {
    setPos(position || { left: 100, top: 100 });
    setCurrentRotation(rotation || 0);
  }, [position, rotation]);

  // Gestion du drag avec la souris
  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(id);
    setDragging(true);
  };

  const handleDrag = (e) => {
    if (!elementRef.current || (e.clientX === 0 && e.clientY === 0)) return;
    const parentRect = elementRef.current.parentNode.getBoundingClientRect();
    const x = snapToGrid((e.clientX - parentRect.left - width / 2) / zoomLevel);
    const y = snapToGrid((e.clientY - parentRect.top - height / 2) / zoomLevel);
    const maxX = parentRect.width / zoomLevel - width;
    const maxY = parentRect.height / zoomLevel - height;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));

    setPos({ left: boundedX, top: boundedY });
  };

  const handleDragEnd = () => {
    setDragging(false);
    if (onMove) onMove(id, pos);
  };

  // Gestion du touch pour mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!elementRef.current) return;

    const elementRect = elementRef.current.getBoundingClientRect();
    const dragAreaRect = elementRef.current.parentNode.getBoundingClientRect();

    touchDataRef.current[id] = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: pos.left,
      initialTop: pos.top,
      offsetX: touch.clientX - elementRect.left,
      offsetY: touch.clientY - elementRect.top,
      dragAreaLeft: dragAreaRect.left,
      dragAreaTop: dragAreaRect.top
    };

    setDragging(true);
    if (onSelect) onSelect(id);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const touchData = touchDataRef.current[id];

    if (!touchData || !elementRef.current) return;

    const newX = (touch.clientX - touchData.dragAreaLeft - touchData.offsetX) / zoomLevel;
    const newY = (touch.clientY - touchData.dragAreaTop - touchData.offsetY) / zoomLevel;

    const maxX = elementRef.current.parentNode.getBoundingClientRect().width / zoomLevel - width;
    const maxY = elementRef.current.parentNode.getBoundingClientRect().height / zoomLevel - height;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));

    setPos({ left: boundedX, top: boundedY });
  };

  const handleTouchEnd = () => {
    if (!touchDataRef.current[id] || !elementRef.current) return;

    delete touchDataRef.current[id];
    setDragging(false);
    if (onMove) onMove(id, pos);
  };

  // Gestion de la rotation
  const handleRotate = (direction) => {
    setRotating(true);
    const angleStep = 15;
    const newRotation = snapToAngle(
      direction === "clockwise" ? currentRotation + angleStep : currentRotation - angleStep
    );
    setCurrentRotation(newRotation);
    if (onRotate) onRotate(id, newRotation);
    setTimeout(() => setRotating(false), 300);
    toast.success(`objets ${nom} pivoté à ${newRotation}°`);
  };

  // Fonction pour obtenir l'icône selon le type
  const getElementIcon = (type, props = {}) => {
    const iconMap = {
      porte_entree: <DoorClosed {...props} />, // porte d'entrée
      porte_sortie: <LogOut {...props} />, // porte de sortie
      estrade: <Monitor {...props} />, // estrade / scène
      buffet: <Coffee {...props} />, // buffet / restauration
      piste_danse: <Music {...props} />, // piste de danse
      bar: <GlassWater {...props} />, // bar
      ecran: <Monitor {...props} />, // écran / projection
      photobooth: <Camera {...props} />, // photobooth
      decoration: <Flower {...props} />, // décoration
    };

    return iconMap[type] || <Package {...props} />;
  };


  // Fonction pour obtenir la couleur de bordure selon le type
  const getBorderColor = (type) => {
    const colorMap = {
      porte_entree: "#10b981", // emerald-500
      porte_sortie: "#f59e0b", // amber-500
      estrade: "#8b5cf6", // violet-500
      buffet: "#f97316", // orange-500
      piste_danse: "#ec4899", // pink-500
      bar: "#06b6d4", // cyan-500
      ecran: "#6366f1", // indigo-500
      photobooth: "#84cc16", // lime-500
      decoration: "#d946ef", // fuchsia-500
    };
    return colorMap[type] || "#6b7280";
  };

  // Détermination dynamique de la forme (borderRadius et clipPath)
  let elementBorderRadius = (shape === "rond" || type === "piste_danse") ? "50%" : "12px";
  let elementClipPath = "";
  if (shape === "triangle") {
    elementClipPath = "polygon(50% 0%, 0% 100%, 100% 100%)"; // Triangle basique (pointé vers le haut)
    elementBorderRadius = "0"; // Pas de radius pour triangle
  }

  // Pour les overlays, on applique le même borderRadius et clipPath
  let overlayBorderRadius = elementBorderRadius === "50%" ? "9999px" : "9px"; // Adapté pour overlays

  // Dans le composant Element
  return (
    <div
      ref={elementRef}
      className="absolute select-none group"
      style={{
        left: pos.left * zoomLevel,
        top: pos.top * zoomLevel,
        width: width * zoomLevel,
        height: height * zoomLevel,
        zIndex: dragging || rotating ? 50 : 15,
        touchAction: 'none',
        transition: dragging ? 'none' : 'all 0.2s ease'
      }}
      draggable
      onDragStart={(e) => {
        const img = new Image();
        img.src = "";
        e.dataTransfer.setDragImage(img, 0, 0);
        setDragging(true);
        if (onSelect) onSelect(id);
      }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Boutons de contrôle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("counterclockwise");
        }}
        className={`absolute -top-2 -left-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all duration-200 ${rotating ? 'ring-2 ring-blue-300 animate-spin-slow' : ''} opacity-0 group-hover:opacity-100`}
        title="Pivoter à gauche"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(90deg)' }} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRotate("clockwise");
        }}
        className={`absolute -top-2 left-6 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 z-30 transition-all duration-200 ${rotating ? 'ring-2 ring-blue-300 animate-spin-slow' : ''} opacity-0 group-hover:opacity-100`}
        title="Pivoter à droite"
      >
        <RefreshCcw className="w-3 h-3" style={{ transform: 'rotate(-90deg)' }} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id); // Appeler onDelete avec l'ID de l'objets
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Supprimer l'objets"
      >
        <Trash className="w-3 h-3" />
      </button>

      {/* Corps de l'objets avec design amélioré */}
      <div
        className={`w-full h-full relative overflow-hidden transition-all duration-300 ${dragging ? 'shadow-2xl scale-110' : rotating ? 'shadow-xl scale-105 ring-2 ring-blue-300' : 'shadow-lg'} ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}`}
        style={{
          backgroundColor: color || "#f3f4f6",
          border: `3px solid ${getBorderColor(type)}`,
          borderRadius: elementBorderRadius,
          clipPath: elementClipPath,
          transform: `rotate(${currentRotation}deg)`,
          transition: rotating || dragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease, scale 0.3s ease'
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(135deg, ${getBorderColor(type)}, transparent 60%)`,
            borderRadius: overlayBorderRadius,
            clipPath: elementClipPath
          }}
        />

        {/* Pattern de fond subtil */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${getBorderColor(type)} 10px, ${getBorderColor(type)} 11px)`,
            borderRadius: overlayBorderRadius,
            clipPath: elementClipPath
          }}
        />

        {/* Contenu de l'objets */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2 text-center">
          {/* Icône */}
          <div className="text-2xl mb-1 filter drop-shadow-sm">
            {getElementIcon(type)}
          </div>

          {/* Nom */}
          <span
            className="font-bold text-gray-800 leading-tight break-words max-w-full"
            style={{
              fontSize: `${Math.max(10, Math.min(14, width / 8))}px`,
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}
          >
            {nom}
          </span>

          {/* Type en petite taille */}
          <span
            className="text-gray-600 text-xs mt-1 opacity-75 capitalize"
            style={{ fontSize: `${Math.max(8, Math.min(10, width / 12))}px` }}
          >
            {ELEMENT_TYPES.find(t => t.value === type)?.label.replace(/^./, str => str.toLowerCase()) || type}
          </span>
        </div>

        {/* Indicateur de glissement */}
        {dragging && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center" style={{ borderRadius: overlayBorderRadius, clipPath: elementClipPath }}>
            <div className="text-blue-700 font-bold text-xs bg-blue-100/80 px-2 py-1 rounded-full">
              Déplacement...
            </div>
          </div>
        )}

        {/* Points de coin pour le style (désactivés pour triangle car clip-path les coupe) */}
        {shape !== "triangle" && (
          <>
            <div className="absolute top-1 left-1 w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/50 rounded-full"></div>
          </>
        )}
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

  // Fonction onSubmit corrigée pour TableCreationModal (ligne ~759)
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

      const formDataArray = nomsFinal.map((nom, index) => {
        const typeInfo = TABLE_TYPES.find((t) => t.value === form.type) || TABLE_TYPES[0];

        return {
          nom,
          type: form.type,
          capacite: Number(form.capacite),
          eventId: Number(form.eventId),
          position: {
            left: 100 + index * 20,
            top: 100 + index * 20,
          },
          width: typeInfo.width,
          height: typeInfo.height,
          rotation: 0,
        };
      });

      const response = await Promise.all(formDataArray.map((t) => createTable(t)));
      const newTables = response.flat();

      const formattedTables = newTables.map((table) => ({
        id: table.id || table.tableId,
        nom: table.nom || table.name,
        capacite: table.capacite || table.capacity,
        type: table.type,
        eventId: Number(table.eventId),
        position: table.position || { left: 100, top: 100 },
        width: table.width || TABLE_TYPES.find((t) => t.value === table.type).width,
        height: table.height || TABLE_TYPES.find((t) => t.value === table.type).height,
        rotation: table.rotation || 0,
        guests: table.guests || [],
      }));

      onAddTables(formattedTables);
      onClose();

      toast.success(`${nomsFinal.length} table${nomsFinal.length > 1 ? "s" : ""} créée${nomsFinal.length > 1 ? "s" : ""} avec succès !`);
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
                <option value="triangle">Triangulaire</option>
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

// Modal pour créer des objets (modifié pour ajouter la forme personnalisée)
// Modal pour créer des objets
function ElementCreationModal({ isOpen, onClose, onAddElements, events, eventId }) {
  const [form, setForm] = useState({
    type: "porte_entree",
    customTypeName: "",
    customWidth: "",
    customHeight: "",
    nombre: "",
    noms: [],
    eventId: eventId || 0,
    color: "#d1d5db",
    shape: "rectangle", // Nouvelle propriété pour la forme (défaut: rectangle)
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState(null);

  const handleNombreChange = (e) => {
    const nb = Number(e.target.value);
    setForm((prev) => ({
      ...prev,
      nombre: nb,
      noms: Array(nb).fill(""),
    }));
  };

  const handleNomChange = (index, value) => {
    const updatedNoms = [...form.noms];
    updatedNoms[index] = value;
    setForm((prev) => ({ ...prev, noms: updatedNoms }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    setError(null);

    // Logique pour "carre" et "rond" : forcer height = width
    if (name === "shape" && (value === "carre" || value === "rond")) {
      newForm.customHeight = newForm.customWidth || "100"; // Si width vide, default à 100
    } else if (name === "customWidth" && (form.shape === "carre" || form.shape === "rond")) {
      newForm.customHeight = value; // Synchroniser height avec width
    }

    setForm(newForm);
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

    if (form.type === "custom") {
      if (!form.customTypeName || form.customTypeName.trim() === "") {
        setError("Veuillez entrer un nom pour le type personnalisé");
        toast.error("Veuillez entrer un nom pour le type personnalisé");
        return;
      }
      const width = Number(form.customWidth);
      if (form.customWidth === "" || isNaN(width) || width < 20) {
        setError("La largeur doit être un nombre d'au moins 20px.");
        toast.error("La largeur doit être un nombre d'au moins 20px.");
        return;
      }
      const height = Number(form.customHeight);
      if (form.customHeight === "" || isNaN(height) || height < 20) {
        setError("La hauteur doit être un nombre d'au moins 20px.");
        toast.error("La hauteur doit être un nombre d'au moins 20px.");
        return;
      }
      if (!form.shape) {
        setError("Veuillez sélectionner une forme pour l'objets personnalisé.");
        toast.error("Veuillez sélectionner une forme pour l'objets personnalisé.");
        return;
      }
      // Forcer height = width pour "rond" si pas déjà fait
      if (form.shape === "rond" && form.customWidth !== form.customHeight) {
        setError("Pour un objets rond, la largeur et la hauteur doivent être égales.");
        toast.error("Pour un objets rond, la largeur et la hauteur doivent être égales.");
        return;
      }
    }

    try {
      const nomsFinal = form.noms.map((nom, index) =>
        nom && nom.trim() !== "" ? nom : `${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`
      );

      const formDataArray = nomsFinal.map((nom, index) => {
        const isCustom = form.type === "custom";
        const typeInfo = isCustom
          ? { width: Number(form.customWidth), height: Number(form.customHeight) }
          : ELEMENT_TYPES.find((t) => t.value === form.type) || ELEMENT_TYPES[0];

        return {
          nom,
          type: isCustom ? form.customTypeName : form.type,
          eventId: Number(form.eventId),
          position: {
            left: 100 + index * 20,
            top: 100 + index * 20,
          },
          width: typeInfo.width,
          height: typeInfo.height,
          rotation: 0,
          color: form.color,
          shape: isCustom ? form.shape : null, // Ajout de shape seulement pour custom
        };
      });

      const response = await Promise.all(formDataArray.map((el) => createElement(el)));
      console.log("Réponse de createElement:", response);
      const newElements = response.flat();

      const formattedElements = newElements.map((element) => ({
        id: element.id || element.elementId,
        nom: element.nom || element.name,
        type: element.type,
        eventId: Number(element.eventId),
        position: element.position || { left: 100, top: 100 },
        width: element.width || (form.type === "custom" ? Number(form.customWidth) : ELEMENT_TYPES.find((t) => t.value === element.type)?.width || 100),
        height: element.height || (form.type === "custom" ? Number(form.customHeight) : ELEMENT_TYPES.find((t) => t.value === element.type)?.height || 100),
        rotation: element.rotation || 0,
        color: element.color || "#d1d5db",
        shape: element.shape || (form.type === "custom" ? form.shape : null), // Propagation de shape
      }));

      setForm({
        type: "porte_entree",
        customTypeName: "",
        customWidth: "",
        customHeight: "",
        nombre: "",
        noms: [],
        eventId: eventId || 0,
        color: "#d1d5db",
        shape: "rectangle", // Réinitialisation
      });
      setSelectedEvent(null);

      onAddElements(formattedElements);
      onClose();

      toast.success(
        `${nomsFinal.length} objets${nomsFinal.length > 1 ? "s" : ""} créé${nomsFinal.length > 1 ? "s" : ""} avec succès !`
      );
    } catch (err) {
      console.error("Erreur création objets:", err);
      setError(err.response?.data?.message || "Erreur lors de la création des objets");
      toast.error(err.response?.data?.message || "Erreur lors de la création des objets");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer des objets</h2>
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
              <label className="text-gray-700 font-medium mb-2 text-sm">Type d'objets</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              >
                {[...ELEMENT_TYPES, { value: "custom", label: "Personnalisé" }].map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {form.type === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Nom du type personnalisé</label>
                  <input
                    name="customTypeName"
                    type="text"
                    value={form.customTypeName}
                    onChange={handleChange}
                    placeholder="Ex: Mur décoratif"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Largeur (px)</label>
                  <input
                    name="customWidth"
                    type="number"
                    value={form.customWidth}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="20"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Hauteur (px)</label>
                  <input
                    name="customHeight"
                    type="number"
                    value={form.customHeight}
                    onChange={handleChange}
                    placeholder="Ex: 100"
                    min="20"
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                    disabled={form.shape === "carre" || form.shape === "rond"} // Désactivé pour carré et rond
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">Forme</label>
                  <select
                    name="shape"
                    value={form.shape}
                    onChange={handleChange}
                    required
                    className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <option value="rond">Rond</option>
                    <option value="carre">Carré</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Nombre d'objets</label>
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={handleNombreChange}
                placeholder="Ex: 1, 2, 3"
                required
                min="1"
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Événement</label>
              <select
                value={form.eventId}
                onChange={(e) => {
                  const eventId = Number(e.target.value);
                  const event = events.find((ev) => ev.id === eventId);
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

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-2 text-sm">Couleur</label>
              <input
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 h-12"
              />
            </div>
          </div>

          {form.noms.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Noms des objets</h3>
              {form.noms.map((nom, index) => (
                <div key={index} className="flex flex-col">
                  <label className="text-gray-700 font-medium mb-2 text-sm">
                    Nom objets {index + 1}
                  </label>
                  <input
                    value={nom}
                    onChange={(e) => handleNomChange(index, e.target.value)}
                    placeholder={`${form.type === "custom" ? form.customTypeName : form.type} ${index + 1}`}
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
              Créer les objets
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
  const [editingElement, setEditingElement] = useState(null);
  const [movingGuest, setMovingGuest] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showElementModal, setShowElementModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showCanvasSizeModal, setShowCanvasSizeModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [elements, setElements] = useState([]);
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && event?.id) {
      getMyEvents()
        .then((response) => {
          console.log("Événements chargés:", response);
          setEvents(response);
        })
        .catch((err) => {
          console.error("Erreur chargement événements:", err);
          toast.error("Erreur lors du chargement des événements");
        });

      getElementsByEventId(event.id)
        .then((response) => {
          console.log("objets chargés:", response);
          setElements(response);
        })
        .catch((err) => {
          console.error("Erreur chargement objets:", err);
          toast.error("Erreur lors du chargement des objets");
        });
    }
  }, [isAuthenticated, event?.id]);

  useEffect(() => {
    console.log("État tables mis à jour:", tables);
  }, [tables]);

  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const newZoom = direction === "in" ? prev + 0.05 : prev - 0.05;
      const boundedZoom = Math.max(0.5, Math.min(newZoom, 2));
      toast.success(`Zoom : ${(boundedZoom * 100).toFixed(0)}%`);
      return boundedZoom;
    });
  };

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
      toast.success("Position de la table mise à jour !");
    } catch (error) {
      console.error("Erreur mise à jour position:", error);
      toast.error("Erreur lors de la mise à jour de la position de la table");
    }
  };

  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, rotation } : t)));
      toast.success("Rotation de la table mise à jour !");
    } catch (error) {
      console.error("Erreur rotation:", error);
      toast.error("Erreur lors de la rotation de la table");
    }
  };

  const handleElementMove = async (elementId, position) => {
    try {
      await updateElementPosition(elementId, position);
      setElements((prev) => prev.map((el) => (el.id === elementId ? { ...el, position } : el)));
      toast.success("Position de l'objets mise à jour !");
    } catch (error) {
      console.error("Erreur mise à jour position objets:", error);
      toast.error("Erreur lors de la mise à jour de la position de l'objets");
    }
  };

  const handleElementRotate = async (elementId, rotation) => {
    try {
      await updateElementRotation(elementId, rotation);
      setElements((prev) => prev.map((el) => (el.id === elementId ? { ...el, rotation } : el)));
      toast.success("Rotation de l'objets mise à jour !");
    } catch (error) {
      console.error("Erreur rotation objets:", error);
      toast.error("Erreur lors de la rotation de l'objets");
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

  const handleElementDelete = async (elementId) => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet objets ?");
    if (!confirmed) return;

    try {
      await deleteElement(elementId);
      setElements((prev) => prev.filter((el) => el.id !== elementId));
      toast.success("objets supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression objets:", error);
      toast.error("Erreur lors de la suppression de l'objets");
    }
  };

  const handleOpenTableEdit = (table) => setEditingTable(table);
  const handleCloseTableEdit = () => setEditingTable(null);

  const handleOpenElementEdit = (element) => setEditingElement(element);
  const handleCloseElementEdit = () => setEditingElement(null);

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

  const handleElementChange = async (id, field, value) => {
    try {
      const updatedData = { [field]: value };

      if (field === "type") {
        const typeInfo = ELEMENT_TYPES.find((type) => type.value === value);
        updatedData.width = typeInfo.width;
        updatedData.height = typeInfo.height;
      }

      await updateElement(id, updatedData);
      setElements((prev) =>
        prev.map((el) => {
          if (el.id === id) {
            const updatedElement = { ...el, ...updatedData };
            return updatedElement;
          }
          return el;
        })
      );
      toast.success("objets mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur mise à jour objets:", error);
      toast.error("Erreur lors de la modification de l'objets");
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

  const addNewElements = (newElements) => {
    setElements(prev => [...prev, ...newElements]);
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

      <div className="fixed bottom-4 flex flex-row gap-2 z-50 lg:flex-col lg:left-4 lg:transform-none lg:gap-3 overflow-x-auto snap-x snap-mandatory max-w-[90vw] lg:max-w-none lg:overflow-x-visible px-2 lg:px-0 scrollbar-hidden">
        {/* Ajouter invité */}
        <button
          onClick={() => setShowGuestModal(true)}
          className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter un invité"
        >
          <User className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter invité</span>
        </button>

        {/* Ajouter tables */}
        <button
          onClick={() => setShowTableModal(true)}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter des tables"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter des tables</span>
        </button>

        {/* Ajouter objets */}
        <button
          onClick={() => setShowElementModal(true)}
          className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Ajouter des objets"
        >
          <Box className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Ajouter des objets</span>
        </button>

        {/* Réinitialiser */}
        <button
          onClick={() => {
            const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer toutes les tables et objets ?");
            if (confirmed) {
              setTables([]);
              setElements([]);
              setMovingGuest(null);
              setSelectedPlace(null);
              toast.success("Plan réinitialisé avec succès !");
            }
          }}
          className="bg-gradient-to-br from-red-500 to-rose-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
          title="Réinitialiser"
        >
          <RefreshCcw className="w-5 h-5" />
          <span className="hidden lg:inline text-sm font-medium">Réinitialiser</span>
        </button>

        {/* Annuler déplacement */}
        {movingGuest && (
          <button
            onClick={cancelMove}
            className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-xl flex items-center justify-center lg:justify-start gap-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse border border-white/20 backdrop-blur-sm snap-center flex-shrink-0"
            title="Annuler déplacement"
          >
            <span className="sm:hidden">✕</span>
            <span className="hidden lg:inline text-sm font-medium">Annuler déplacement</span>
          </button>
        )}

        {/* Sélecteur taille canvas */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/30 snap-center flex-shrink-0 transition-all duration-300 hover:scale-105">
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
            className=" text-white px-3 py-2 lg:px-4 lg:py-2 rounded-2xl cursor-pointer transition hover:scale-105 hover:shadow-2xl backdrop-blur-sm text-sm"
            title="Sélectionner la taille du canvas"
          >
            {[...CANVAS_SIZES, { label: "Personnalisé", width: 0, height: 0 }].map(size => (
              <option key={size.label} value={size.label} className="text-gray-800">
                Taille : {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-white/30 snap-center flex-shrink-0">
          <button
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 0.5}
            className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 hover:scale-105"
            title="Zoom arrière"
          >
            -
          </button>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-2 py-1 rounded-lg">
            <span className="text-sm font-bold text-indigo-700 min-w-[3rem] text-center">
              {(zoomLevel * 100).toFixed(0)}%
            </span>
          </div>
          <button
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 2}
            className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all duration-200 hover:scale-105"
            title="Zoom avant"
          >
            +
          </button>
        </div>

        {/* Style pour masquer la barre de défilement tout en permettant le scroll */}
        <style>{`
      .scrollbar-hidden::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hidden {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
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
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
                onEdit={handleOpenTableEdit}
                movingGuest={movingGuest}
                zoomLevel={zoomLevel}
              />
            ))}
            {elements.map((element) => (
              <Element
                key={element.id}
                element={element}
                onMove={handleElementMove}
                onRotate={handleElementRotate}
                onDelete={handleElementDelete}
                onEdit={handleOpenElementEdit}
                zoomLevel={zoomLevel}
              />
            ))}
          </div>

          {tables.length === 0 && elements.length === 0 && (
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
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
                    Canvas vide
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 leading-relaxed">
                      Aucune table ou objets créé pour le moment
                    </p>
                    <p className="text-sm text-gray-500 bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-200/50">
                      💡 Astuce : Ajoutez des tables ou objets depuis les boutons en bas à gauche pour commencer l'organisation de votre événement
                    </p>
                  </div>
                </div>
                <div className="flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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

        <style>{`
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
            .triangle {
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
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

      <ElementCreationModal
        isOpen={showElementModal}
        onClose={() => setShowElementModal(false)}
        onAddElements={addNewElements}
        events={events}
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
                onClick={handleCloseTableEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  handleTableDelete(editingTable.id);
                  handleCloseTableEdit();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {editingElement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Modification de {editingElement.nom}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Nom</label>
                <input
                  value={editingElement.nom}
                  onChange={(e) => handleElementChange(editingElement.id, "nom", e.target.value)}
                  placeholder="Nom de l'objets"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Type</label>
                <select
                  value={editingElement.type}
                  onChange={(e) => handleElementChange(editingElement.id, "type", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {ELEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 font-medium mb-2 text-sm">Couleur</label>
                <input
                  type="color"
                  value={editingElement.color || '#d1d5db'}
                  onChange={(e) => handleElementChange(editingElement.id, "color", e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 h-12"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
                onClick={handleCloseElementEdit}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  handleElementDelete(editingElement.id);
                  handleCloseElementEdit();
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