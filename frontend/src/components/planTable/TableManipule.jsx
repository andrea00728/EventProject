import { Edit, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import getChairPositions from "./getChairPositions";
import Chair from "./Chair";
import { TABLE_TYPES } from "./constant";

// Fonction pour aligner les positions sur une grille (snap to grid)
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Fonction pour aligner les angles de rotation sur une grille angulaire
function snapToAngle(value, angleStep = 15) {
  return Math.round(value / angleStep) * angleStep;
}

// Composant Table : représente une table avec ses chaises
function TableManipule({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace, onEdit, movingGuest, zoomLevel }) {
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

export default TableManipule
