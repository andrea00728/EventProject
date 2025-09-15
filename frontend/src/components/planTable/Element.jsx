import { useEffect, useRef, useState } from "react";
import { ELEMENT_TYPES } from "./constant";
import { Camera, Coffee, DoorClosed, Flower, GlassWater, LogOut, Monitor, MonitorCheck, Music, Package, Pen, PenBox, RefreshCcw, Trash } from "lucide-react";

// Fonction pour aligner les positions sur une grille (snap to grid)
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Fonction pour aligner les angles de rotation sur une grille angulaire
function snapToAngle(value, angleStep = 15) {
  return Math.round(value / angleStep) * angleStep;
}

// Composant Element : représente un objets supplémentaire (porte, estrade, etc.)
export function Element({ element, onMove, onRotate, onSelect, onResize, canvasSize, isSelected, zoomLevel, onDelete }) { // Ajout de onDelete en prop
  const { id, nom, type, position, width, height, rotation, color, shape } = element;
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [pos, setPos] = useState(position || { left: 100, top: 100 });
  const [currentRotation, setCurrentRotation] = useState(rotation || 0);
  const elementRef = useRef(null);
  const touchDataRef = useRef({});

  const handleUpdate = () => {
    alert("demain ity ataoko e")
  }

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
      ecran: <MonitorCheck {...props} />, // écran / projection
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
          handleUpdate(); // Appeler onDelete avec l'ID de l'objets
        }}
        className="absolute -top-2 right-6 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Modifier l'objets"
      >
        <Pen className="w-3 h-3" />
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