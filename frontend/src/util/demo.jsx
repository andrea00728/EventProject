import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Edit, Plus, RefreshCcw, User, Clock, Minus, X, Move, RotateCcw } from "lucide-react";
import { AuthModal } from "../components/Modal/authModal";

// Définition des types de tables avec leurs dimensions
const TABLE_TYPES = [
  { value: "ronde", label: "Table ronde", width: 80, height: 80 },
  { value: "rectangle", label: "Table rectangulaire", width: 112, height: 64 },
  { value: "ovale", label: "Table ovale", width: 112, height: 64 },
  { value: "carree", label: "Table carrée", width: 80, height: 80 },
  { value: "triangle", label: "Triangle", width: 80, height: 80 },
];

// Définition des types d'éléments avec leurs dimensions
const ELEMENT_TYPES = [
  { value: "carre", label: "Carré", width: 80, height: 80 },
  { value: "rond", label: "Rond", width: 80, height: 80 },
  { value: "petit_carre", label: "Petit Carré", width: 40, height: 40 },
  { value: "rectangle", label: "Rectangle", width: 100, height: 50 },
  { value: "petit_rectangle", label: "Petit Rectangle", width: 60, height: 30 },
  { value: "ovale", label: "Ovale", width: 100, height: 50 },
  { value: "petit_rond", label: "Petit Rond", width: 40, height: 40 },
  { value: "petit_ovale", label: "Petit Ovale", width: 60, height: 30 },
  { value: "triangle", label: "Triangle", width: 80, height: 80 },
];

// Définir les tailles prédéfinies pour le canvas
const CANVAS_SIZES = [
  { label: "Petit", width: 600, height: 400 },
  { label: "Normal", width: 900, height: 650 },
  { label: "Grand", width: 1200, height: 800 },
];

// Limites pour la démo
const MAX_TABLES = 3;
const MAX_GUESTS = 5;
const MAX_ELEMENTS = 5;

// Types de modales pour une meilleure gestion
const MODAL_TYPES = {
  NONE: 'none',
  LIMIT: 'limit',
  ADD_TABLE: 'add_table',
  ADD_GUEST: 'add_guest',
  EDIT_TABLE: 'edit_table',
  AUTH: 'auth',
  DELETE_TABLE_CONFIRM: 'delete_table_confirm',
  RESET_CONFIRM: 'reset_confirm',
  ADD_ELEMENT: 'add_element',
};

// Fonction pour aligner les positions sur une grille
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Fonction pour aligner les angles de rotation
function snapToAngle(value, angleStep = 15) {
  return Math.round(value / angleStep) * angleStep;
}

// Calcule les positions des chaises autour de la table
const getChairPositions = (type, capacity, tableWidth, tableHeight) => {
  return useMemo(() => {
    const positions = [];
    const chairSize = 30;
    const minDistanceFromTable = 0;
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
    } else if (type === "triangle") {
      const centerX = tableWidth / 2;
      const centerY = tableHeight / 2;
      const sideLength = Math.min(tableWidth, tableHeight);
      const height = (Math.sqrt(3) / 2) * sideLength;
      const chairsPerSide = Math.ceil(capacity / 3);
      const vertices = [
        { x: centerX, y: centerY - height / 2 },
        { x: centerX - sideLength / 2, y: centerY + height / 2 },
        { x: centerX + sideLength / 2, y: centerY + height / 2 },
      ];
      let chairCount = 0;
      for (let side = 0; side < 3 && chairCount < capacity; side++) {
        const startVertex = vertices[side];
        const endVertex = vertices[(side + 1) % 3];
        const chairsOnThisSide = Math.min(chairsPerSide, capacity - chairCount);
        for (let i = 0; i < chairsOnThisSide; i++) {
          const t = (i + 1) / (chairsOnThisSide + 1);
          const x = startVertex.x + t * (endVertex.x - startVertex.x);
          const y = startVertex.y + t * (endVertex.y - startVertex.y);
          const dx = endVertex.x - startVertex.x;
          const dy = endVertex.y - startVertex.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const normalX = -dy / length;
          const normalY = dx / length;
          const chairX = x + normalX * (minDistanceFromTable + chairSize / 2);
          const chairY = y + normalY * (minDistanceFromTable + chairSize / 2);
          positions.push({
            left: `${chairX - chairSize / 2}px`,
            top: `${chairY - chairSize / 2}px`,
          });
          chairCount++;
        }
      }
    } else {
      const perimeter = 2 * (tableWidth + tableHeight);
      const spacingBetweenChairs = perimeter / capacity;
      const topChairs = Math.round(tableWidth / spacingBetweenChairs);
      const rightChairs = Math.round(tableHeight / spacingBetweenChairs);
      const bottomChairs = Math.round(tableWidth / spacingBetweenChairs);
      const leftChairs = capacity - topChairs - rightChairs - bottomChairs;
      let count = 0;
      if (topChairs > 0) {
        const spacing = tableWidth / (topChairs + 1);
        for (let i = 0; i < topChairs && count < capacity; i++, count++) {
          positions.push({
            left: `${(i + 1) * spacing - chairSize / 2}px`,
            top: `${-minDistanceFromTable - chairSize}px`,
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
  }, [type, capacity, tableWidth, tableHeight]);
};

// Composant Chaise
function Chair({ number, style, isOccupied, guestName, onClick, isSelected, isMoving, zoomLevel }) {
  const adjustedStyle = {
    ...style,
    left: `calc(${style.left} * ${zoomLevel})`,
    top: `calc(${style.top} * ${zoomLevel})`,
    width: `${20 * zoomLevel}px`,
    height: `${20 * zoomLevel}px`,
    fontSize: `${Math.max(8, 10 * zoomLevel)}px`,
  };
  return (
    <div
      className={`rounded-full absolute border-2 shadow-lg flex items-center justify-center font-bold text-white cursor-pointer transition-all duration-300 transform hover:scale-110 ${
        isOccupied
          ? "bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 border-rose-300 hover:from-rose-600 hover:via-pink-600 hover:to-red-600 shadow-rose-300/50"
          : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 border-emerald-300 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-emerald-300/50"
      } ${isSelected ? 'ring-4 ring-blue-400/60 ring-offset-2 ring-offset-white scale-125' : ''} ${
        isMoving ? 'ring-4 ring-amber-400/60 ring-offset-2 ring-offset-white animate-pulse scale-110' : ''
      }`}
      style={adjustedStyle}
      title={isOccupied ? `Place ${number} - ${guestName}` : `Place ${number} - Libre`}
      onClick={onClick}
    >
      {number}
    </div>
  );
}

// Composant Table (modifié pour inclure la rotation des chaises)
function Table({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace, onEdit, movingGuest, zoomLevel, isMobile }) {
  if (!table) return null;
  const ref = useRef(null);
  const touchDataRef = useRef({});
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pos, setPos] = useState(table.position ?? { left: 100, top: 100 });
  const [rotation, setRotation] = useState(table.rotation ?? 0);
  const [isHovered, setIsHovered] = useState(false);

  // Synchronisation de la position et rotation avec les props
  useEffect(() => {
    setPos(table.position ?? { left: 100, top: 100 });
    setRotation(table.rotation ?? 0);
  }, [table.position, table.rotation]);

  const tableType = TABLE_TYPES.find(t => t.value === table.type) || TABLE_TYPES[0];
  const { width: tableWidth, height: tableHeight } = tableType;

  // Gestion du drag start
  const handleDragStart = (e) => {
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
    setDragging(true);
  };

  // Gestion de la fin du drag
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

  // Gestion du touch start pour mobile
  const handleTouchStart = (e) => {
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
    e.preventDefault();
    const touch = e.touches[0];
    const tableElement = e.currentTarget;
    const tableRect = tableElement.getBoundingClientRect();
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: pos.left,
      initialTop: pos.top,
      offsetX: touch.clientX - tableRect.left,
      offsetY: touch.clientY - tableRect.top,
      parentLeft: parentRect.left,
      parentTop: parentRect.top,
    };
    setDragging(true);
  };

  // Gestion du touch move pour mobile
  const handleTouchMove = (e) => {
    if (!touchDataRef.current || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    e.preventDefault();
    const touch = e.touches[0];
    const parent = ref.current.parentNode;
    if (!parent) return;
    const newX = (touch.clientX - touchDataRef.current.parentLeft - touchDataRef.current.offsetX + parent.scrollLeft) / zoomLevel;
    const newY = (touch.clientY - touchDataRef.current.parentTop - touchDataRef.current.offsetY + parent.scrollTop) / zoomLevel;
    const maxX = parent.clientWidth / zoomLevel - tableWidth;
    const maxY = parent.clientHeight / zoomLevel - tableHeight;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));
    setPos({ left: boundedX, top: boundedY });
  };

  // Gestion de la fin du touch
  const handleTouchEnd = () => {
    if (touchDataRef.current) {
      onMove(table.id, pos);
      touchDataRef.current = null;
      setDragging(false);
    }
  };

  // Gestion de la rotation
  const handleRotate = (direction) => {
    setRotating(true);
    const angleStep = 15;
    const newRotation = snapToAngle(
      direction === "clockwise" ? rotation + angleStep : rotation - angleStep
    );
    setRotation(newRotation);
    onRotate(table.id, newRotation);
    setTimeout(() => setRotating(false), 300);
  };

  // Vérifie si une chaise est occupée
  const isChairOccupied = (chairIndex) => {
    return table.guests?.some(g => g.place === chairIndex + 1) || false;
  };

  // Récupère l'invité pour une chaise donnée
  const getGuestForChair = (chairIndex) => {
    return table.guests?.find(g => g.place === chairIndex + 1) || null;
  };

  // Gestion du clic sur une chaise
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
        transition: rotating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      draggable={!isMobile}
      onDragStart={!isMobile ? handleDragStart : undefined}
      onDragEnd={!isMobile ? handleDragEnd : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bouton d'édition */}
        <div className={`absolute -top-12 -right-5 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table);
            }}
            className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20"
            title="Modifier la table"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Boutons de rotation */}
        <div className={`absolute -top-12 -left-5 flex gap-1 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRotate("counterclockwise");
            }}
            className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 ${rotating ? 'ring-4 ring-blue-300/60 animate-spin' : ''}`}
            title="Pivoter à gauche"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRotate("clockwise");
            }}
            className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 ${rotating ? 'ring-4 ring-blue-300/60 animate-spin' : ''}`}
            title="Pivoter à droite"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      {/* Conteneur rotatif pour la table et les chaises */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center',
          transition: rotating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        
        {/* Rendu conditionnel pour la forme de la table */}
        {table.type === "triangle" ? (
          <svg
            width={tableWidth * zoomLevel}
            height={tableHeight * zoomLevel}
            viewBox={`0 0 ${tableWidth} ${tableHeight}`}
            className={`flex items-center justify-center w-full h-full relative transition-all duration-300 ${
              dragging || rotating
                ? 'scale-105'
                : 'border-indigo-300'
            } ${rotating ? 'ring-4 ring-blue-300/60' : ''}`}
          >
            <polygon
              points={`${tableWidth / 2},0 0,${tableHeight} ${tableWidth},${tableHeight}`}
              className="fill-current"
              style={{ fill: 'url(#tableGradient)' }}
            />
            <defs>
              <linearGradient id="tableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffd6e3' }} />
                <stop offset="50%" style={{ stopColor: '#ffd6e3' }} />
                <stop offset="100%" style={{ stopColor: '#ffd6e3' }} />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="font-bold text-indigo-800 select-none pointer-events-none drop-shadow-sm transform: rotate(-${rotation}deg)"
              style={{ fontSize: `${Math.max(10, 14 * zoomLevel)}px` }}
            >
              {table.nom}
            </text>
          </svg>
        ) : (
          <div
            className={`border-4 shadow-xl flex items-center justify-center w-full h-full relative transition-all duration-300 ${
              table.type === "ronde" || table.type === "ovale" ? "rounded-full" : ""
            } ${
              dragging || rotating
                ? 'shadow-2xl scale-105 border-indigo-400 bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100'
                : 'shadow-lg border-indigo-300 bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100'
            } ${rotating ? 'ring-4 ring-blue-300/60' : ''} backdrop-blur-sm`}
          >
            <span
              className="font-bold text-indigo-800 select-none pointer-events-none text-center break-words px-2 drop-shadow-sm"
              style={{ fontSize: `${Math.max(10, 14 * zoomLevel)}px` }}
            >
              {table.nom}
            </span>
          </div>
        )}
        {/* Rendu des chaises à l'intérieur du conteneur rotatif */}
        {getChairPositions(table.type, table.capacite, tableWidth, tableHeight).map((chairPos, i) => {
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
              guestName={guest?.nom || ''}
              onClick={(e) => {
                e.stopPropagation();
                handleChairClick(i);
              }}
              isSelected={isSelected}
              isMoving={isMovingTarget}
              zoomLevel={zoomLevel}
            />
          );
        })}
      </div>
      {/* Indicateur de déplacement */}
      {dragging && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg animate-bounce">
            <Move className="w-3 h-3" />
            Déplacement...
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Element (inchangé)
function Element({ element, onMove, onRotate, onDelete, zoomLevel, isMobile }) {
  if (!element) return null;
  const ref = useRef(null);
  const touchDataRef = useRef({});
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pos, setPos] = useState(element.position ?? { left: 100, top: 100 });
  const [rotation, setRotation] = useState(element.rotation ?? 0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setPos(element.position ?? { left: 100, top: 100 });
    setRotation(element.rotation ?? 0);
  }, [element.position, element.rotation]);

  const elementType = ELEMENT_TYPES.find(t => t.value === element.type) || ELEMENT_TYPES[0];
  const { width: elementWidth, height: elementHeight } = elementType;

  let shapeClass = "";
  if (element.type === "rond" || element.type === "petit_rond" || element.type === "ovale" || element.type === "petit_ovale") {
    shapeClass = "rounded-full";
  }

  const handleDragStart = (e) => {
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
    setDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!ref.current) return;
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    const x = snapToGrid((e.clientX - parentRect.left - elementWidth / 2) / zoomLevel);
    const y = snapToGrid((e.clientY - parentRect.top - elementHeight / 2) / zoomLevel);
    const maxX = parentRect.width / zoomLevel - elementWidth;
    const maxY = parentRect.height / zoomLevel - elementHeight;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));
    const newPos = { left: boundedX, top: boundedY };
    setPos(newPos);
    setDragging(false);
    onMove(element.id, newPos);
  };

  const handleTouchStart = (e) => {
    if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
    e.preventDefault();
    const touch = e.touches[0];
    const elementElement = e.currentTarget;
    const elementRect = elementElement.getBoundingClientRect();
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    touchDataRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialLeft: pos.left,
      initialTop: pos.top,
      offsetX: touch.clientX - elementRect.left,
      offsetY: touch.clientY - elementRect.top,
      parentLeft: parentRect.left,
      parentTop: parentRect.top,
    };
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!touchDataRef.current || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
    e.preventDefault();
    const touch = e.touches[0];
    const parent = ref.current.parentNode;
    if (!parent) return;
    const newX = (touch.clientX - touchDataRef.current.parentLeft - touchDataRef.current.offsetX + parent.scrollLeft) / zoomLevel;
    const newY = (touch.clientY - touchDataRef.current.parentTop - touchDataRef.current.offsetY + parent.scrollTop) / zoomLevel;
    const maxX = parent.clientWidth / zoomLevel - elementWidth;
    const maxY = parent.clientHeight / zoomLevel - elementHeight;
    const boundedX = Math.max(0, Math.min(snapToGrid(newX), maxX));
    const boundedY = Math.max(0, Math.min(snapToGrid(newY), maxY));
    setPos({ left: boundedX, top: boundedY });
  };

  const handleTouchEnd = () => {
    if (touchDataRef.current) {
      onMove(element.id, pos);
      touchDataRef.current = null;
      setDragging(false);
    }
  };

  const handleRotate = (direction) => {
    setRotating(true);
    const angleStep = 15;
    const newRotation = snapToAngle(
      direction === "clockwise" ? rotation + angleStep : rotation - angleStep
    );
    setRotation(newRotation);
    onRotate(element.id, newRotation);
    setTimeout(() => setRotating(false), 300);
  };

  return (
    <div
      ref={ref}
      className="absolute select-none group"
      style={{
        left: pos.left * zoomLevel,
        top: pos.top * zoomLevel,
        width: elementWidth * zoomLevel,
        height: elementHeight * zoomLevel,
        zIndex: dragging || rotating ? 50 : 10,
        touchAction: 'none',
        transition: rotating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      draggable={!isMobile}
      onDragStart={!isMobile ? handleDragStart : undefined}
      onDragEnd={!isMobile ? handleDragEnd : undefined}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute -top-12 -right-3 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(element.id);
          }}
          className="w-7 h-7 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20"
          title="Supprimer l'élément"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className={`absolute -top-12 -left-3 flex gap-1 transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-70 scale-90'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRotate("counterclockwise");
          }}
          className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 ${rotating ? 'ring-4 ring-blue-300/60 animate-spin' : ''}`}
          title="Pivoter à gauche"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRotate("clockwise");
          }}
          className={`w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 ${rotating ? 'ring-4 ring-blue-300/60 animate-spin' : ''}`}
          title="Pivoter à droite"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>
      {element.type === "triangle" ? (
        <svg
          width={elementWidth * zoomLevel}
          height={elementHeight * zoomLevel}
          viewBox={`0 0 ${elementWidth} ${elementHeight}`}
          className={`flex items-center justify-center w-full h-full relative transition-all duration-300 ${
            dragging || rotating
              ? 'scale-105 border-teal-400'
              : 'border-teal-300'
          } ${rotating ? 'ring-4 ring-blue-300/60' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: rotating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <polygon
            points={`${elementWidth / 2},0 0,${elementHeight} ${elementWidth},${elementHeight}`}
            className="fill-current"
            style={{ fill: 'url(#elementGradient)' }}
          />
          <defs>
            <linearGradient id="elementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#b4f8ed' }} />
              <stop offset="50%" style={{ stopColor: '#b4f8ed' }} />
              <stop offset="100%" style={{ stopColor: '#DBEAFE' }} />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="font-bold text-teal-800 select-none pointer-events-none drop-shadow-sm"
            style={{ fontSize: `${Math.max(10, 14 * zoomLevel)}px` }}
          >
            {element.nom}
          </text>
        </svg>
      ) : (
        <div
          className={`border-4 shadow-xl flex items-center justify-center w-full h-full relative transition-all duration-300 ${shapeClass} ${
            dragging || rotating
              ? 'shadow-2xl scale-105 border-teal-400 bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100'
              : 'shadow-lg border-teal-300 bg-gradient-to-br from-cyan-100 via-teal-50 to-blue-100'
          } ${rotating ? 'ring-4 ring-blue-300/60' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: rotating ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <span
            className="font-bold text-teal-800 select-none pointer-events-none text-center break-words px-2 drop-shadow-sm"
            style={{ fontSize: `${Math.max(10, 14 * zoomLevel)}px` }}
          >
            {element.nom}
          </span>
        </div>
      )}
      {dragging && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg animate-bounce">
            <Move className="w-3 h-3" />
            Déplacement...
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Modal générique
function Modal({ isOpen, onClose, title, children, className = "" }) {
  if (!isOpen) return null;
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/20 animate-scale-in ${className}`}>
        <div className="p-6">
          {title && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100/50 transition-all duration-200 hover:rotate-90"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function DemoPlanSalle() {
  const [tables, setTables] = useState([]);
  const [guests, setGuests] = useState([]);
  const [elements, setElements] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [movingGuest, setMovingGuest] = useState(null);
  const [currentModal, setCurrentModal] = useState(MODAL_TYPES.NONE);
  const [limitType, setLimitType] = useState('');
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[1]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState('');
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [tableToDelete, setTableToDelete] = useState(null);
  const [elementForm, setElementForm] = useState({
    type: "carre",
    nombre: "",
    nom: "",
  });
  const [form, setForm] = useState({
    capacite: "",
    type: "ronde",
    nombre: "",
    noms: [],
  });
  const [guestForm, setGuestForm] = useState({
    nom: "",
    prenom: "",
    tableId: null,
    place: null,
  });
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ajuster la taille du canvas pour mobile
  useEffect(() => {
    setCanvasSize(isMobile ? CANVAS_SIZES[0] : CANVAS_SIZES[1]);
  }, [isMobile]);

  // Gestionnaire pour fermer les modales
  const closeModalType = useCallback((modalType) => {
    setCurrentModal(MODAL_TYPES.NONE);
    setEditingTable(null);
    setLimitType('');
    setTableToDelete(null);
    setElementForm({ type: "carre", nombre: "", nom: "" });
    if (modalType === MODAL_TYPES.AUTH) {
      setAuthForm({ email: "", password: "" });
    }
  }, []);

  // Gestionnaire d'événement pour la touche Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (movingGuest) {
          setMovingGuest(null);
          setSelectedPlace(null);
        } else {
          closeModalType();
        }
      }
    },
    [movingGuest, closeModalType]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Gestion du zoom
  const handleZoom = (direction) => {
    setZoomLevel((prev) => {
      const step = isMobile ? 0.1 : 0.05;
      const newZoom = direction === "in" ? prev + step : prev - step;
      return Math.max(0.5, Math.min(newZoom, 2));
    });
  };

  // Vérification des limites de tables
  const checkTableLimit = (newTablesCount) => {
    if (tables.length + newTablesCount > MAX_TABLES) {
      setLimitType('tables');
      setCurrentModal(MODAL_TYPES.LIMIT);
      return false;
    }
    return true;
  };

  // Vérification des limites d'invités
  const checkGuestLimit = () => {
    if (guests.length >= MAX_GUESTS) {
      setLimitType('guests');
      setCurrentModal(MODAL_TYPES.LIMIT);
      return false;
    }
    return true;
  };

  // Vérification des limites d'éléments
  const checkElementLimit = (newElementsCount) => {
    if (elements.length + newElementsCount > MAX_ELEMENTS) {
      setLimitType('elements');
      setCurrentModal(MODAL_TYPES.LIMIT);
      return false;
    }
    return true;
  };

  const handleAddTableClick = () => {
    if (!checkTableLimit(1)) return;
    setCurrentModal(MODAL_TYPES.ADD_TABLE);
  };

  const handleAddGuestClick = () => {
    if (!checkGuestLimit()) return;
    setCurrentModal(MODAL_TYPES.ADD_GUEST);
  };

  const handleAddElementClick = () => {
    if (!checkElementLimit(1)) return;
    setCurrentModal(MODAL_TYPES.ADD_ELEMENT);
  };

  // Ajout de tables
  const handleAddTable = (e) => {
    e.preventDefault();
    const nombre = Number(form.nombre);
    if (!checkTableLimit(nombre)) return;
    if (!form.capacite || form.capacite < 1 || form.capacite > 12) {
      setError("La capacité doit être entre 1 et 12.");
      return;
    }
    const newTables = [];
    for (let i = 0; i < nombre; i++) {
      const typeInfo = TABLE_TYPES.find(t => t.value === form.type);
      const nom = form.noms[i] || `Table ${tables.length + i + 1}`;
      newTables.push({
        id: Date.now() + i,
        nom,
        capacite: Number(form.capacite) || 4,
        type: form.type,
        position: {
          left: snapToGrid(100 + i * 120),
          top: snapToGrid(100 + i * 120),
        },
        width: typeInfo.width,
        height: typeInfo.height,
        rotation: 0,
        guests: [],
      });
    }
    setTables(prev => [...prev, ...newTables]);
    setForm({ capacite: "", type: "ronde", nombre: "", noms: [] });
    setError('');
    setCurrentModal(MODAL_TYPES.NONE);
  };

  // Ajout d'invité
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!checkGuestLimit()) return;
    const table = tables.find(t => t.id === Number(guestForm.tableId));
    if (!table) {
      setError("Veuillez sélectionner une table valide.");
      return;
    }
    const occupiedPlaces = table.guests?.map(g => g.place) || [];
    const firstFreePlace = Array.from({ length: table.capacite }, (_, i) => i + 1)
      .find(place => !occupiedPlaces.includes(place));
    if (!firstFreePlace) {
      setError("Aucune place libre sur cette table.");
      return;
    }
    const newGuest = {
      id: Date.now(),
      nom: `${guestForm.nom} ${guestForm.prenom}`.trim(),
      prenom: guestForm.prenom,
      tableId: Number(guestForm.tableId),
      place: guestForm.place ? Number(guestForm.place) : firstFreePlace,
    };
    setGuests(prev => [...prev, newGuest]);
    setTables(prevTables =>
      prevTables.map(t => {
        if (t.id === newGuest.tableId) {
          return {
            ...t,
            guests: [...(t.guests || []), {
              id: newGuest.id,
              nom: newGuest.nom,
              place: newGuest.place,
            }],
          };
        }
        return t;
      })
    );
    setGuestForm({ nom: "", prenom: "", tableId: null, place: null });
    setError('');
    setCurrentModal(MODAL_TYPES.NONE);
  };

  // Ajout d'élément
  const handleAddElement = (e) => {
    e.preventDefault();
    const nombre = Number(elementForm.nombre);
    if (!checkElementLimit(nombre)) return;
    const newElements = [];
    for (let i = 0; i < nombre; i++) {
      const typeInfo = ELEMENT_TYPES.find(t => t.value === elementForm.type);
      const nom = elementForm.nom || `${typeInfo.label} ${elements.length + i + 1}`;
      newElements.push({
        id: Date.now() + i,
        nom,
        type: elementForm.type,
        position: {
          left: snapToGrid(150 + i * 80),
          top: snapToGrid(150 + i * 80),
        },
        width: typeInfo.width,
        height: typeInfo.height,
        rotation: 0,
      });
    }
    setElements(prev => [...prev, ...newElements]);
    setElementForm({ type: "carre", nombre: "", nom: "" });
    setError('');
    setCurrentModal(MODAL_TYPES.NONE);
  };

  // Gestion du clic sur une chaise
  const handlePlaceClick = (table, placeNumber) => {
    const guestAtPlace = table.guests?.find(g => g.place === placeNumber);
    if (movingGuest) {
      const targetGuest = table.guests?.find(g => g.place === placeNumber);
      if (targetGuest) {
        setError("Cette chaise est déjà occupée !");
        return;
      }
      setTables(prevTables =>
        prevTables.map(t => {
          if (t.id === movingGuest.sourceTableId && t.id === table.id) {
            return {
              ...t,
              guests: t.guests.map(g =>
                g.id === movingGuest.guestId ? { ...g, place: placeNumber } : g
              ),
            };
          } else if (t.id === movingGuest.sourceTableId) {
            return {
              ...t,
              guests: t.guests.filter(g => g.id !== movingGuest.guestId),
            };
          } else if (t.id === table.id) {
            return {
              ...t,
              guests: [
                ...(t.guests || []),
                { id: movingGuest.guestId, nom: movingGuest.guestName, place: placeNumber },
              ],
            };
          }
          return t;
        })
      );
      setGuests(prevGuests =>
        prevGuests.map(g =>
          g.id === movingGuest.guestId
            ? { ...g, tableId: table.id, place: placeNumber }
            : g
        )
      );
      setMovingGuest(null);
      setSelectedPlace(null);
      setError('');
    } else if (guestAtPlace) {
      setMovingGuest({
        guestId: guestAtPlace.id,
        guestName: guestAtPlace.nom,
        sourceTableId: table.id,
        sourceChairIndex: placeNumber,
      });
      setSelectedPlace({
        tableId: table.id,
        placeNumber,
        guestId: guestAtPlace.id,
        guestName: guestAtPlace.nom,
      });
    }
  };

  // Déplacement de table
  const handleTableMove = (tableId, position) => {
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, position } : t)));
  };

  // Rotation de table
  const handleTableRotate = (tableId, rotation) => {
    setTables(prev => prev.map(t => (t.id === tableId ? { ...t, rotation } : t)));
  };

  // Déplacement d'élément
  const handleElementMove = (elementId, position) => {
    setElements(prev => prev.map(e => (e.id === elementId ? { ...e, position } : e)));
  };

  // Rotation d'élément
  const handleElementRotate = (elementId, rotation) => {
    setElements(prev => prev.map(e => (e.id === elementId ? { ...e, rotation } : e)));
  };

  // Modification de table
  const handleTableChange = (id, field, value) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id === id) {
          const updatedTable = { ...t, [field]: value };
          if (field === "type") {
            const typeInfo = TABLE_TYPES.find(type => type.value === value);
            updatedTable.width = typeInfo.width;
            updatedTable.height = typeInfo.height;
          }
          if (field === "capacite") {
            updatedTable.capacite = Number(value) || 1;
            setGuests(prev =>
              prev.filter(g => g.tableId !== id || g.place <= updatedTable.capacite)
            );
            updatedTable.guests = updatedTable.guests?.filter(g => g.place <= updatedTable.capacite) || [];
          }
          return updatedTable;
        }
        return t;
      })
    );
    if (editingTable && editingTable.id === id) {
      setEditingTable(prev => ({ ...prev, [field]: value }));
    }
  };

  // Suppression de table
  const handleDeleteTable = (tableId) => {
    setTableToDelete(tableId);
    setCurrentModal(MODAL_TYPES.DELETE_TABLE_CONFIRM);
  };

  // Confirmation de suppression de table
  const confirmDeleteTable = () => {
    if (!tableToDelete) return;
    setTables(prev => prev.filter(t => t.id !== tableToDelete));
    setGuests(prev => prev.filter(g => g.tableId !== tableToDelete));
    if (selectedPlace?.tableId === tableToDelete) {
      setSelectedPlace(null);
      setMovingGuest(null);
    }
    closeModalType();
  };

  // Suppression d'élément
  const handleDeleteElement = (elementId) => {
    setElements(prev => prev.filter(e => e.id !== elementId));
  };

  // Réinitialisation
  const handleReset = () => {
    setCurrentModal(MODAL_TYPES.RESET_CONFIRM);
  };

  // Confirmation de réinitialisation
  const confirmReset = () => {
    setTables([]);
    setGuests([]);
    setElements([]);
    setMovingGuest(null);
    setSelectedPlace(null);
    closeModalType();
  };

  // Gestion du nombre de tables/éléments
  const handleNombreChange = (e, formType) => {
    const nb = Number(e.target.value);
    if (formType === 'table') {
      setForm(prev => ({
        ...prev,
        nombre: nb,
        noms: Array(nb).fill(""),
      }));
    } else if (formType === 'element') {
      setElementForm(prev => ({
        ...prev,
        nombre: nb,
        nom: "",
      }));
    }
  };

  // Gestion des noms
  const handleNomChange = (index, value, formType) => {
    if (formType === 'table') {
      const updatedNoms = [...form.noms];
      updatedNoms[index] = value;
      setForm(prev => ({ ...prev, noms: updatedNoms }));
    } else if (formType === 'element') {
      setElementForm(prev => ({ ...prev, nom: value }));
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      <div className="md:hidden bg-white/80 backdrop-blur-xl p-4 shadow-lg border-b border-white/20">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Plan des Tables ✨
          </h1>
          <div className="flex items-center gap-3">
            <div className="bg-white/50 rounded-full px-3 py-1 text-xs font-medium text-indigo-700">
              {(zoomLevel * 100).toFixed(0)}%
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleZoom("out")}
                disabled={zoomLevel <= 0.5}
                className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-full flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 shadow-md transition-all duration-200 hover:scale-105"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleZoom("in")}
                disabled={zoomLevel >= 2}
                className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-full flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 shadow-md transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
        <div className={`${isMobile
          ? 'fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-row gap-3'
          : 'fixed bottom-6 left-6 flex flex-col gap-3'
          } z-50`}>
          <button
            onClick={handleAddGuestClick}
            className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm"
          >
            <User className="w-5 h-5" />
            {!isMobile && <span className="text-sm font-medium">Invité</span>}
          </button>
          <button
            onClick={handleAddTableClick}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            {!isMobile && <span className="text-sm font-medium">Table</span>}
          </button>
          <button
            onClick={handleAddElementClick}
            className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm"
          >
            <Plus className="w-5 h-5" />
            {!isMobile && <span className="text-sm font-medium">Élément</span>}
          </button>
          <button
            onClick={handleReset}
            className="bg-gradient-to-br from-red-500 to-rose-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 backdrop-blur-sm"
          >
            <RefreshCcw className="w-5 h-5" />
            {!isMobile && <span className="text-sm font-medium">Reset</span>}
          </button>
          {movingGuest && (
            <button
              onClick={() => {
                setMovingGuest(null);
                setSelectedPlace(null);
                setError('');
              }}
              className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse border border-white/20 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
              {!isMobile && <span className="text-sm font-medium">Annuler</span>}
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center relative">
          {movingGuest && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
              <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 border border-amber-300/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 text-amber-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-sm font-bold">{movingGuest.guestName}</div>
                    <div className="text-xs text-amber-700 font-medium mt-1">Cliquez sur une chaise libre pour déplacer</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
              <div className="bg-red-100 border border-red-300 rounded-2xl p-4 shadow-lg">
                <div className="text-red-700 text-sm font-medium">{error}</div>
              </div>
            </div>
          )}
          <div
            ref={canvasRef}
            className="relative border-4 border-white/30 rounded-3xl shadow-2xl bg-gradient-to-br from-slate-50/90 via-blue-50/60 to-indigo-50/70 overflow-auto backdrop-blur-sm"
            style={{
              width: isMobile ? '100vw' : Math.min(canvasSize.width, window.innerWidth - 100),
              height: isMobile ? '60vh' : Math.min(canvasSize.height, window.innerHeight - 150),
              maxWidth: '100%',
              touchAction: 'auto',
            }}
          >
            {!isMobile && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-30">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 px-8 py-4">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                    Plan des Tables - Démo
                  </h1>
                </div>
              </div>
            )}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_70%)]" />
            </div>
            <div
              className="relative w-full h-full min-w-full min-h-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                minWidth: `${canvasSize.width}px`,
                minHeight: `${canvasSize.height}px`,
              }}
            >
              {tables.map(table => (
                <Table
                  key={table.id}
                  table={table}
                  onMove={handleTableMove}
                  onRotate={handleTableRotate}
                  onDelete={handleDeleteTable}
                  onPlaceClick={handlePlaceClick}
                  selectedPlace={selectedPlace}
                  onEdit={table => {
                    setEditingTable(table);
                    setCurrentModal(MODAL_TYPES.EDIT_TABLE);
                  }}
                  movingGuest={movingGuest}
                  zoomLevel={zoomLevel}
                  isMobile={isMobile}
                />
              ))}
              {elements.map(element => (
                <Element
                  key={element.id}
                  element={element}
                  onMove={handleElementMove}
                  onRotate={handleElementRotate}
                  onDelete={handleDeleteElement}
                  zoomLevel={zoomLevel}
                  isMobile={isMobile}
                />
              ))}
              {tables.length === 0 && elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6 max-w-lg mx-auto px-6">
                    <div className="relative">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50">
                        <Plus className="w-12 h-12 text-indigo-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        Créez votre plan parfait
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Commencez par ajouter des tables ou des éléments pour organiser votre événement de rêve
                      </p>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 rounded-xl border border-indigo-200/50">
                        <p className="text-sm text-indigo-700 font-medium">
                          Version démo
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          {MAX_TABLES} tables max • {MAX_GUESTS} invités max • {MAX_ELEMENTS} éléments max
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!isMobile && (
              <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-3 border border-white/30">
                <button
                  onClick={() => handleZoom("out")}
                  disabled={zoomLevel <= 0.5}
                  className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-bold text-indigo-700 min-w-[3rem] text-center">
                    {(zoomLevel * 100).toFixed(0)}%
                  </span>
                </div>
                <button
                  onClick={() => handleZoom("in")}
                  disabled={zoomLevel >= 2}
                  className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 rounded-xl flex items-center justify-center hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-3 text-xs border border-white/30">
              <div className="text-indigo-700 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Limites démo
              </div>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between gap-3">
                  <span>Tables:</span>
                  <span className="font-semibold text-indigo-600">{tables.length}/{MAX_TABLES}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Invités:</span>
                  <span className="font-semibold text-indigo-600">{guests.length}/{MAX_GUESTS}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Éléments:</span>
                  <span className="font-semibold text-indigo-600">{elements.length}/{MAX_ELEMENTS}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              : limitType === 'guests'
                ? `Vous avez atteint la limite de ${MAX_GUESTS} invités pour cette démonstration.`
                : `Vous avez atteint la limite de ${MAX_ELEMENTS} éléments pour cette démonstration.`}
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
      {/* Modal d'ajout de table */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.ADD_TABLE}
        onClose={() => closeModalType(MODAL_TYPES.ADD_TABLE)}
        title="Créer des Tables"
      >
        <form onSubmit={handleAddTable} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Capacité</label>
              <input
                name="capacite"
                type="number"
                value={form.capacite}
                onChange={(e) => setForm({ ...form, capacite: e.target.value })}
                placeholder="Ex: 4, 6, 8"
                required
                min="1"
                max="12"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de tables</label>
              <input
                name="nombre"
                type="number"
                value={form.nombre}
                onChange={(e) => handleNombreChange(e, 'table')}
                placeholder="Ex: 2"
                required
                min="1"
                max={MAX_TABLES - tables.length}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type de Table</label>
              <select
                name="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
              >
                {TABLE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          {form.noms.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                Noms des tables
              </h4>
              <div className="space-y-3">
                {form.noms.map((nom, index) => (
                  <input
                    key={index}
                    value={nom}
                    onChange={(e) => handleNomChange(index, e.target.value, 'table')}
                    placeholder={`Table ${index + 1}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => closeModalType(MODAL_TYPES.ADD_TABLE)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Créer
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />
              {tables.length}/{MAX_TABLES} tables maximum
            </div>
          </div>
        </form>
      </Modal>
      {/* Modal d'ajout d'invité */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.ADD_GUEST}
        onClose={() => closeModalType(MODAL_TYPES.ADD_GUEST)}
        title="Ajouter un Invité"
      >
        <form onSubmit={handleAddGuest} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
              <input
                name="nom"
                type="text"
                value={guestForm.nom}
                onChange={(e) => setGuestForm({ ...guestForm, nom: e.target.value })}
                placeholder="Nom"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
              <input
                name="prenom"
                type="text"
                value={guestForm.prenom}
                onChange={(e) => setGuestForm({ ...guestForm, prenom: e.target.value })}
                placeholder="Prénom"
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Table</label>
              <select
                name="tableId"
                value={guestForm.tableId || ""}
                onChange={(e) => setGuestForm({ ...guestForm, tableId: e.target.value })}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-gray-50/50"
              >
                <option value="" disabled>Sélectionnez une table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>{table.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-6">
                        <button
              type="button"
              onClick={() => closeModalType(MODAL_TYPES.ADD_GUEST)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Ajouter
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />
              {guests.length}/{MAX_GUESTS} invités maximum
            </div>
          </div>
        </form>
      </Modal>
      {/* Modal de modification de table */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.EDIT_TABLE}
        onClose={() => closeModalType(MODAL_TYPES.EDIT_TABLE)}
        title="Modifier la Table"
      >
        {editingTable && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentModal(MODAL_TYPES.NONE);
              setEditingTable(null);
            }}
            className="space-y-6"
          >
            {error && (
              <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                <input
                  name="nom"
                  type="text"
                  value={editingTable.nom}
                  onChange={(e) => setEditingTable({ ...editingTable, nom: e.target.value })}
                  placeholder="Nom de la table"
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacité</label>
                <input
                  name="capacite"
                  type="number"
                  value={editingTable.capacite}
                  onChange={(e) => handleTableChange(editingTable.id, "capacite", e.target.value)}
                  placeholder="Ex: 4, 6, 8"
                  required
                  min="1"
                  max="12"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type de Table</label>
                <select
                  name="type"
                  value={editingTable.type}
                  onChange={(e) => handleTableChange(editingTable.id, "type", e.target.value)}
                  required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50/50"
                >
                  {TABLE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => closeModalType(MODAL_TYPES.EDIT_TABLE)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        )}
      </Modal>
      {/* Modal de confirmation de suppression de table */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.DELETE_TABLE_CONFIRM}
        onClose={() => closeModalType(MODAL_TYPES.DELETE_TABLE_CONFIRM)}
        title="Confirmer la Suppression"
      >
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir supprimer cette table ? Tous les invités associés seront également supprimés.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => closeModalType(MODAL_TYPES.DELETE_TABLE_CONFIRM)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 cursor-pointer transition"
          >
            Annuler
          </button>
          <button
            onClick={confirmDeleteTable}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition"
          >
            Supprimer
          </button>
        </div>
      </Modal>
      {/* Modal de confirmation de réinitialisation */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.RESET_CONFIRM}
        onClose={() => closeModalType(MODAL_TYPES.RESET_CONFIRM)}
        title="Confirmer la Réinitialisation"
      >
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            Êtes-vous sûr de vouloir réinitialiser le plan ? Toutes les tables, invités et éléments seront supprimés.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => closeModalType(MODAL_TYPES.RESET_CONFIRM)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 cursor-pointer transition"
          >
            Annuler
          </button>
          <button
            onClick={confirmReset}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition"
          >
            Réinitialiser
          </button>
        </div>
      </Modal>
      {/* Modal d'ajout d'élément */}
      <Modal
        isOpen={currentModal === MODAL_TYPES.ADD_ELEMENT}
        onClose={() => closeModalType(MODAL_TYPES.ADD_ELEMENT)}
        title="Ajouter un Élément"
      >
        <form onSubmit={handleAddElement} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-xl p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre d'éléments</label>
              <input
                name="nombre"
                type="number"
                value={elementForm.nombre}
                onChange={(e) => handleNombreChange(e, 'element')}
                placeholder="Ex: 1, 2"
                required
                min="1"
                max={MAX_ELEMENTS - elements.length}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
              <input
                name="nom"
                type="text"
                value={elementForm.nom}
                onChange={(e) => handleNomChange(0, e.target.value, 'element')}
                placeholder="Nom de l'élément"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-gray-50/50"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type d'élément</label>
              <select
                name="type"
                value={elementForm.type}
                onChange={(e) => setElementForm({ ...elementForm, type: e.target.value })}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-gray-50/50"
              >
                {ELEMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => closeModalType(MODAL_TYPES.ADD_ELEMENT)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Ajouter
            </button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-xs font-medium">
              <Clock className="w-3 h-3" />
              {elements.length}/{MAX_ELEMENTS} éléments maximum
            </div>
          </div>
        </form>
      </Modal>
      {/* Modal d'authentification */}
      <AuthModal
        isOpen={currentModal === MODAL_TYPES.AUTH}
        onClose={() => closeModalType(MODAL_TYPES.AUTH)}
        authForm={authForm}
        setAuthForm={setAuthForm}
      />

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