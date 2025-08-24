import React, { useState, useRef, useEffect } from "react";
import { useStateContext } from "../../context/ContextProvider";
import {
  updateTablePosition,
  updateRotation,
  deleteTable,
  reassignGuestToTable,
} from "../../services/tableService";
import getPlacePositions from "./AlgorithmeFor_Table";

function Place({ reserved, style, number, onClick, isSelected, guestName }) {
  return (
    <div
      onClick={onClick}
      className={`w-5 h-5 rounded-full border absolute cursor-pointer flex items-center justify-center text-[10px] font-bold text-white
        ${reserved ? "bg-red-500" : "bg-green-400"}
        ${isSelected ? "ring-2 ring-yellow-300" : ""}
        border-white shadow-sm transition duration-200 hover:scale-110`}
      title={reserved ? `${guestName}` : `Place libre`}
      style={style}
    >
      {number}
    </div>
  );
}

/**
 * Retourne les positions des places autour de la table selon sa forme et capacité
 */



function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

function TableActionsMenu({ onRotateLeft, onRotateRight, onDelete }) {
  return (
    <div className="absolute -top-6 right-0 flex gap-1 bg-white shadow-lg rounded-full px-2 py-1 text-xs z-10 backdrop-blur-sm bg-opacity-90 opacity-0 group-hover:opacity-100 transition">
      <button onClick={onRotateLeft} title="↺ gauche" className="hover:text-indigo-600">↺</button>
      <button onClick={onRotateRight} title="↻ droite" className="hover:text-indigo-600">↻</button>
      <button onClick={onDelete} title="🗑 supprimer" className="hover:text-red-600">🗑</button>
    </div>
  );
}

function Table({ table, onMove, onRotate, onDelete, onPlaceClick, selectedPlace }) {
  if (!table) return null;

  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState(table.position ?? { left: 0, top: 0 });
  const [rotation, setRotation] = useState(table.rotation ?? 0);

  useEffect(() => {
    setPos(table.position ?? { left: 0, top: 0 });
    setRotation(table.rotation ?? 0);
  }, [table.position, table.rotation]);

  // Gestion du drag manuel avec souris
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const parentRect = ref.current?.parentNode?.getBoundingClientRect();
      if (!parentRect) return;
      const x = snapToGrid(e.clientX - parentRect.left - 40);
      const y = snapToGrid(e.clientY - parentRect.top - 40);
      setPos({ left: x, top: y });
    };

    const handleMouseUp = (e) => {
      if (!dragging) return;
      setDragging(false);
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      const parentRect = ref.current?.parentNode?.getBoundingClientRect();
      if (!parentRect) return;
      const x = snapToGrid(e.clientX - parentRect.left - 40);
      const y = snapToGrid(e.clientY - parentRect.top - 40);
      onMove(table.id, { left: x, top: y });
    };

    if (dragging) {
      document.body.style.userSelect = "none"; // évite sélection de texte pendant drag
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const tableShape = {
    ronde: "rounded-full",
    carree: "rounded-md",
    rectangle: "rounded-md",
    ovale: "rounded-xl",
  };
  const sizeStyles = {
  ronde: "w-12 h-12",        
  carree: "w-12 h-12",      
  rectangle: "w-20 h-10",   
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
      className="absolute transition-all duration-150 ease-in-out"
      style={{ left: pos.left, top: pos.top, zIndex: dragging ? 50 : 10 }}
    >
      <div className="group relative w-20 h-20" style={{ transform: `rotate(${rotation}deg)` }}>
        <TableActionsMenu
          onRotateLeft={() => {
            const newRot = (rotation - 15 + 360) % 360;
            setRotation(newRot);
            onRotate(table.id, newRot);
          }}
          onRotateRight={() => {
            const newRot = (rotation + 15) % 360;
            setRotation(newRot);
            onRotate(table.id, newRot);
          }}
          onDelete={() => onDelete(table.id)}
        />

        {getPlacePositions(table.type, table.capacite).map((style, i) => {
          const guest = table.guests?.find((g) => g.place === i + 1);
          const isSelected = selectedPlace?.tableId === table.id && selectedPlace?.placeNumber === i + 1;

          return (
            <Place
              key={i}
              number={i + 1}
              reserved={!!guest}
              guestName={guest?.nom}
              style={style}
              isSelected={isSelected}
              onClick={(e) => {
                e.stopPropagation(); // IMPORTANT : empêche propagation clic à la table
                onPlaceClick(table, i + 1);
              }}
            />
          );
        })}

       <div
  onMouseDown={handleMouseDown}
  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
    ${tableShape[table.type] || "rounded-md"}
    ${tableColors[table.type] || "bg-white"}
    ${sizeStyles[table.type] || "w-16 h-16"} flex items-center justify-center
    border-4 border-indigo-400 shadow-md
    cursor-grab active:cursor-grabbing select-none
    transition-all duration-200 ease-in-out
    ${dragging ? "opacity-60 ring-4 ring-indigo-300" : ""}
    hover:scale-105 hover:ring-2 hover:ring-indigo-500 backdrop-blur-sm bg-opacity-70`}
>
  <span className="text-xs font-bold text-indigo-700">Table {table.nom}</span>
</div>
      </div>
    </div>
  );
}

export default function PlanSalle({ event, tables, setTables }) {
  const { isAuthenticated } = useStateContext();
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Gestion du clic sur une place (invité)
  const handlePlaceClick = (table, placeNumber) => {
  const guestAtPlace = table.guests?.find((g) => g.place === placeNumber);

  if (guestAtPlace) {
    // Place occupée -> sélectionner l'invité
    setSelectedPlace({
      tableId: table.id,
      placeNumber,
      guestId: guestAtPlace.id,
      guestName: guestAtPlace.nom,
    });
  } else {
    if (selectedPlace) {
      // Déplacement invité vers place libre
      if (selectedPlace.tableId === table.id && selectedPlace.placeNumber === placeNumber) {
        // Clic sur la même place = désélection
        setSelectedPlace(null);
        return;
      }

      reassignGuestToTable(selectedPlace.guestId, table.id, placeNumber)
        .then(() => {
          setTables((prevTables) =>
            prevTables.map((t) => {
              if (t.id === selectedPlace.tableId && t.id === table.id) {
                // Même table : modifier uniquement la place de l'invité
                return {
                  ...t,
                  guests: t.guests.map((g) =>
                    g.id === selectedPlace.guestId ? { ...g, place: placeNumber } : g
                  ),
                };
              } else if (t.id === selectedPlace.tableId) {
                // Ancienne table différente: retirer invité
                return {
                  ...t,
                  guests: t.guests.filter((g) => g.id !== selectedPlace.guestId),
                };
              } else if (t.id === table.id) {
                // Nouvelle table différente: ajouter invité
                return {
                  ...t,
                  guests: [
                    ...t.guests.filter((g) => g.id !== selectedPlace.guestId),
                    {
                      id: selectedPlace.guestId,
                      nom: selectedPlace.guestName,
                      place: placeNumber,
                    },
                  ],
                };
              }
              return t;
            })
          );
          setSelectedPlace(null);
        })
        .catch((err) => {
          alert("Erreur déplacement invité : " + err.message);
        });
    } else {
      alert("Sélectionnez d'abord un invité en cliquant sur une place occupée.");
    }
  }
};


  // Gestion déplacement table
  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position);
      if (setTables) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, position } : t))
        );
      }
    } catch (error) {
      console.error("Erreur mise à jour position :", error);
    }
  };

  // Gestion rotation table
  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation);
      if (setTables) {
        setTables((prev) =>
          prev.map((t) => (t.id === tableId ? { ...t, rotation } : t))
        );
      }
    } catch (error) {
      console.error("Erreur mise à jour rotation :", error);
    }
  };

  // Suppression table
  const handleTableDelete = async (tableId) => {
    const confirm = window.confirm("Supprimer cette table ?");
    if (!confirm) return;
    try {
      await deleteTable(tableId);
      if (setTables) {
        setTables((prev) => prev.filter((t) => t.id !== tableId));
      }
    } catch (error) {
      console.error("Erreur suppression table :", error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow-lg">
          Plan des Tables
        </div>

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

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </div>
  );
}