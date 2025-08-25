import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "../../context/ContextProvider";
import {
  updateTablePosition,
  updateRotation,
  deleteTable,
  reassignGuestToTable,
} from "../../services/tableService";

// === Algorithme pour calculer les positions des chaises (amélioré) ===
function getPlacePositions(type, capacity) {
  const positions = [];
  const chairSize = 24; // Taille de la chaise (24px = w-6 h-6)
  const minDistanceFromTable = 8; // Distance minimale entre la chaise et la table

  // Dimensions des tables selon le type
  const tableDimensions = {
    ronde: { width: 64, height: 64 }, // w-16 h-16
    carree: { width: 64, height: 64 }, // w-16 h-16
    rectangle: { width: 96, height: 48 }, // w-24 h-12
    ovale: { width: 112, height: 80 }, // w-28 h-20
  };

  const { width: tableWidth, height: tableHeight } = tableDimensions[type] || tableDimensions.carree;

  if (type === "ronde" || type === "ovale") {
    // Pour les tables rondes/ovales
    const centerX = 60; // Centre du container 120px
    const centerY = 60;

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
      positions.push({ 
        left: `${x}px`, 
        top: `${y}px`,
        position: 'absolute'
      });
    }
  } else {
    // Pour les tables rectangulaires/carrées
    const centerX = 60;
    const centerY = 60;
    const tableLeft = centerX - tableWidth / 2;
    const tableTop = centerY - tableHeight / 2;
    const tableRight = centerX + tableWidth / 2;
    const tableBottom = centerY + tableHeight / 2;

    const perimetre = 2 * (tableWidth + tableHeight);
    const spacingBetweenChairs = perimetre / capacity;

    // Calculer combien de chaises par côté
    const topChairs = Math.max(1, Math.round((tableWidth / spacingBetweenChairs)));
    const rightChairs = Math.max(1, Math.round((tableHeight / spacingBetweenChairs)));
    const bottomChairs = Math.max(1, Math.round((tableWidth / spacingBetweenChairs)));
    const leftChairs = Math.max(0, capacity - topChairs - rightChairs - bottomChairs);

    let count = 0;

    // Côté du haut
    if (topChairs > 0 && count < capacity) {
      const spacing = tableWidth / (topChairs + 1);
      for (let i = 0; i < topChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableLeft + (i + 1) * spacing - chairSize / 2}px`,
          top: `${tableTop - minDistanceFromTable - chairSize}px`,
          position: 'absolute'
        });
      }
    }

    // Côté droit
    if (rightChairs > 0 && count < capacity) {
      const spacing = tableHeight / (rightChairs + 1);
      for (let i = 0; i < rightChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableRight + minDistanceFromTable}px`,
          top: `${tableTop + (i + 1) * spacing - chairSize / 2}px`,
          position: 'absolute'
        });
      }
    }

    // Côté du bas
    if (bottomChairs > 0 && count < capacity) {
      const spacing = tableWidth / (bottomChairs + 1);
      for (let i = 0; i < bottomChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableLeft + tableWidth - (i + 1) * spacing - chairSize / 2}px`,
          top: `${tableBottom + minDistanceFromTable}px`,
          position: 'absolute'
        });
      }
    }

    // Côté gauche
    if (leftChairs > 0 && count < capacity) {
      const spacing = tableHeight / (leftChairs + 1);
      for (let i = 0; i < leftChairs && count < capacity; i++, count++) {
        positions.push({
          left: `${tableLeft - minDistanceFromTable - chairSize}px`,
          top: `${tableTop + tableHeight - (i + 1) * spacing - chairSize / 2}px`,
          position: 'absolute'
        });
      }
    }
  }

  return positions;
}

// === Place (chaise) - Améliorée ===
function Place({ reserved, style, number, onClick, isSelected, guestName }) {
  return (
    <div
      onClick={onClick}
      className={`w-6 h-6 rounded-full border absolute cursor-pointer flex items-center justify-center 
        text-[10px] font-bold text-white shadow-md transition-all duration-200
        ${reserved 
          ? "bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600" 
          : "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600"
        }
        ${isSelected ? "ring-2 ring-blue-400 ring-offset-1 scale-110" : ""}
        border-white hover:scale-125`}
      title={reserved ? `Place ${number} - ${guestName}` : `Place ${number} - Libre`}
      style={style}
    >
      {number}
    </div>
  );
}

// === Actions Menu (rotation / suppression) ===
function TableActionsMenu({ onRotateLeft, onRotateRight, onDelete }) {
  return (
    <div className="absolute -top-8 right-0 flex gap-1 bg-white shadow-md rounded-full px-2 py-1 text-xs 
      z-20 backdrop-blur-sm bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={onRotateLeft}
        title="Rotation gauche (15°)"
        className="hover:text-indigo-600 p-1"
      >
        ↺
      </button>
      <button
        onClick={onRotateRight}
        title="Rotation droite (15°)"
        className="hover:text-indigo-600 p-1"
      >
        ↻
      </button>
      <button
        onClick={onDelete}
        title="Supprimer la table"
        className="hover:text-red-600 p-1"
      >
        🗑
      </button>
    </div>
  );
}

// === Table - Améliorée ===
function Table({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace }) {
  if (!table) return null;

  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState(table.position ?? { left: 100, top: 100 });
  const [rotation, setRotation] = useState(table.rotation ?? 0);

  useEffect(() => {
    setPos(table.position ?? { left: 100, top: 100 });
    setRotation(table.rotation ?? 0);
  }, [table.position, table.rotation]);

  // Fonction snap to grid améliorée
  const snapToGrid = (value, gridSize = 20) => {
    return Math.round(value / gridSize) * gridSize;
  };

  // Gestion drag souris
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const parentRect = ref.current?.parentNode?.getBoundingClientRect();
      if (!parentRect) return;
      
      const x = snapToGrid(e.clientX - parentRect.left - 60); // 60 = moitié de 120px (container)
      const y = snapToGrid(e.clientY - parentRect.top - 60);
      
      // Limites de la zone
      const maxX = 900 - 120; // largeur zone - largeur container
      const maxY = 650 - 120; // hauteur zone - hauteur container
      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));
      
      setPos({ left: boundedX, top: boundedY });
    };

    const handleMouseUp = (e) => {
      if (!dragging) return;
      setDragging(false);
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const parentRect = ref.current?.parentNode?.getBoundingClientRect();
      if (!parentRect) return;
      
      const x = snapToGrid(e.clientX - parentRect.left - 60);
      const y = snapToGrid(e.clientY - parentRect.top - 60);
      const maxX = 900 - 120;
      const maxY = 650 - 120;
      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));
      
      onMove(table.id, { left: boundedX, top: boundedY });
    };

    if (dragging) {
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, onMove, table.id]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  // Gestion tactile améliorée
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const parentRect = ref.current?.parentNode?.getBoundingClientRect();
    if (!parentRect) return;
    
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      offsetX: touch.clientX - parentRect.left - pos.left,
      offsetY: touch.clientY - parentRect.top - pos.top,
      parentLeft: parentRect.left,
      parentTop: parentRect.top,
    };
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!touchStart.current) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - touchStart.current.parentLeft - touchStart.current.offsetX;
    const newY = touch.clientY - touchStart.current.parentTop - touchStart.current.offsetY;
    
    const x = snapToGrid(newX);
    const y = snapToGrid(newY);
    const maxX = 900 - 120;
    const maxY = 650 - 120;
    const boundedX = Math.max(0, Math.min(x, maxX));
    const boundedY = Math.max(0, Math.min(y, maxY));
    
    setPos({ left: boundedX, top: boundedY });
  };

  const handleTouchEnd = () => {
    if (!touchStart.current) return;
    setDragging(false);
    onMove(table.id, pos);
    touchStart.current = null;
  };

  // Styles dynamiques
  const tableShape = {
    ronde: "rounded-full",
    carree: "rounded-md",
    rectangle: "rounded-md",
    ovale: "rounded-xl",
  };
  const sizeStyles = {
    ronde: "w-16 h-16",
    carree: "w-16 h-16",
    rectangle: "w-24 h-12",
    ovale: "w-28 h-20",
  };
  const tableColors = {
    ronde: "bg-gradient-to-br from-pink-100 to-pink-300",
    carree: "bg-gradient-to-br from-blue-100 to-blue-300",
    rectangle: "bg-gradient-to-br from-green-100 to-green-300",
    ovale: "bg-gradient-to-br from-yellow-100 to-yellow-300",
  };

  return (
    <div
      ref={ref}
      className="absolute select-none"
      style={{ 
        left: pos.left, 
        top: pos.top, 
        zIndex: dragging ? 50 : 10,
        touchAction: 'none' // Important pour le tactile
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="group relative"
        style={{
          transform: `rotate(${rotation}deg)`,
          width: "120px",
          height: "120px",
        }}
      >
        {/* Menu Actions */}
        <TableActionsMenu
          onRotateLeft={(e) => {
            e.stopPropagation();
            const newRot = (rotation - 15 + 360) % 360;
            setRotation(newRot);
            onRotate(table.id, newRot);
          }}
          onRotateRight={(e) => {
            e.stopPropagation();
            const newRot = (rotation + 15) % 360;
            setRotation(newRot);
            onRotate(table.id, newRot);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onDelete(table.id);
          }}
        />

        {/* Places autour de la table */}
        {getPlacePositions(table.type, table.capacite).map((style, i) => {
          const guest = table.guests?.find((g) => g.place === i + 1);
          const isSelected =
            selectedPlace?.tableId === table.id &&
            selectedPlace?.placeNumber === i + 1;

          return (
            <Place
              key={i}
              number={i + 1}
              reserved={!!guest}
              guestName={guest?.nom}
              style={style}
              isSelected={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onPlaceClick(table, i + 1);
              }}
            />
          );
        })}

        {/* Table au centre */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${tableShape[table.type] || "rounded-md"}
            ${tableColors[table.type] || "bg-white"}
            ${sizeStyles[table.type] || "w-16 h-16"}
            flex items-center justify-center
            border-4 border-indigo-400 shadow-lg
            ${dragging ? 'cursor-grabbing opacity-70 ring-4 ring-indigo-300 scale-105' : 'cursor-grab hover:scale-105 hover:ring-2 hover:ring-indigo-500'}
            select-none transition-all duration-200 ease-in-out`}
        >
          <span className="text-xs font-bold text-indigo-700 select-none pointer-events-none">
            {table.nom}
          </span>
        </div>
      </div>
    </div>
  );
}

// === PlanSalle (global) ===
export default function PlanSalle({ event, tables, setTables }) {
  const { isAuthenticated } = useStateContext();
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Gestion du clic sur une place (invité)
  const handlePlaceClick = (table, placeNumber) => {
    const guestAtPlace = table.guests?.find((g) => g.place === placeNumber);

    if (guestAtPlace) {
      // Sélectionner l'invité pour le déplacer
      setSelectedPlace({
        tableId: table.id,
        placeNumber,
        guestId: guestAtPlace.id,
        guestName: guestAtPlace.nom,
      });
    } else {
      // Place libre - déplacer l'invité sélectionné ou afficher message
      if (selectedPlace) {
        // Vérifier si on clique sur la même place
        if (selectedPlace.tableId === table.id && selectedPlace.placeNumber === placeNumber) {
          setSelectedPlace(null);
          return;
        }
        
        // Déplacer l'invité vers cette place libre
        reassignGuestToTable(selectedPlace.guestId, table.id, placeNumber)
          .then(() => {
            setTables((prevTables) =>
              prevTables.map((t) => {
                if (t.id === selectedPlace.tableId && t.id === table.id) {
                  // Même table : juste changer la place
                  return {
                    ...t,
                    guests: t.guests.map((g) =>
                      g.id === selectedPlace.guestId ? { ...g, place: placeNumber } : g
                    ),
                  };
                } else if (t.id === selectedPlace.tableId) {
                  // Table source : retirer l'invité
                  return {
                    ...t,
                    guests: t.guests.filter((g) => g.id !== selectedPlace.guestId),
                  };
                } else if (t.id === table.id) {
                  // Table destination : ajouter l'invité
                  return {
                    ...t,
                    guests: [
                      ...t.guests.filter((g) => g.id !== selectedPlace.guestId),
                      { id: selectedPlace.guestId, nom: selectedPlace.guestName, place: placeNumber },
                    ],
                  };
                }
                return t;
              })
            );
            setSelectedPlace(null);
          })
          .catch((err) => {
            console.error("Erreur déplacement invité :", err);
            alert("Erreur lors du déplacement de l'invité : " + err.message);
          });
      } else {
        alert("Cliquez d'abord sur une place occupée pour sélectionner un invité à déplacer.");
      }
    }
  };

  // Déplacement table
  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, position } : t)));
    } catch (error) {
      console.error("Erreur mise à jour position :", error);
    }
  };

  // Rotation table
  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation);
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, rotation } : t)));
    } catch (error) {
      console.error("Erreur rotation :", error);
    }
  };

  // Suppression table
  const handleTableDelete = async (tableId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette table ? Tous les invités assignés seront également supprimés.")) return;
    try {
      await deleteTable(tableId);
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      // Réinitialiser la sélection si elle concernait cette table
      if (selectedPlace?.tableId === tableId) {
        setSelectedPlace(null);
      }
    } catch (error) {
      console.error("Erreur suppression table :", error);
      alert("Erreur lors de la suppression de la table : " + error.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[900px] h-[650px] bg-white border border-gray-300 rounded-2xl shadow-2xl
                  max-w-full max-h-[80vh] overflow-hidden">
        
        {/* Titre */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow z-30">
          Plan des Tables - {event?.nom || "Événement"}
        </div>

        {/* Instructions pour mobile */}
        {selectedPlace && (
          <div className="absolute top-16 left-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg text-sm z-30">
            Invité sélectionné: <strong>{selectedPlace.guestName}</strong>. Cliquez sur une chaise libre pour le déplacer.
          </div>
        )}

        {/* Grille de fond */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Tables */}
        {tables.map((table) => (
          <Table
            key={table.id}
            table={table}
            onMove={handleTableMove}
            onRotate={handleTableRotate}
            onDelete={handleTableDelete}
            onPlaceClick={handlePlaceClick}
            selectedPlace={selectedPlace}
          />
        ))}

        {/* Message si aucune table */}
        {tables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-lg">
            Aucune table créée. Ajoutez des tables depuis le formulaire.
          </div>
        )}
      </div>
    </div>
  );
}