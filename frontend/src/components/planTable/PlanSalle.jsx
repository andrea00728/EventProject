import React, { useState } from "react";
import { useStateContext } from "../../context/ContextProvider";
import {
  updateTablePosition,
  updateRotation,
  deleteTable,
  reassignGuestToTable,
} from "../../services/tableService";

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

export default function PlanSalle({ event, tables, setTables }) {
  const { token } = useStateContext();
  // selectedPlace: { tableId, placeNumber, guestId } ou null
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceClick = (table, placeNumber) => {
    const guestAtPlace = table.guests?.find((g) => g.place === placeNumber);

    if (guestAtPlace) {
      // Cliqué sur place occupée -> sélectionne cette place (pick)
      setSelectedPlace({
        tableId: table.id,
        placeNumber,
        guestId: guestAtPlace.id,
        guestName: guestAtPlace.nom,
      });
    } else {
      // Cliqué sur place libre
      if (selectedPlace) {
        // On a une place sélectionnée = on réassigne l'invité sélectionné ici
        if (
          selectedPlace.tableId === table.id &&
          selectedPlace.placeNumber === placeNumber
        ) {
          // Clic sur la même place, on désélectionne
          setSelectedPlace(null);
          return;
        }

        // Appel API pour réassigner
        reassignGuestToTable(selectedPlace.guestId, table.id, placeNumber, token)
          .then(() => {
            alert(
              `Invité ${selectedPlace.guestName} déplacé à la place ${placeNumber} de la table ${table.numero}`
            );
            setTables((prevTables) =>
              prevTables.map((t) => {
                if (t.id === selectedPlace.tableId) {
                  return {
                    ...t,
                    guests: t.guests.filter((g) => g.id !== selectedPlace.guestId),
                  };
                }
                if (t.id === table.id) {
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

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow-lg">
          🪑 Plan de salle : {event?.nom || "Événement"}
          {selectedPlace && (
            <span className="ml-4 text-yellow-600 font-semibold">
              Invité sélectionné : {selectedPlace.guestName}
            </span>
          )}
        </div>

        {tables.map((table) => {
          const tableShape = {
            ronde: "rounded-full",
            carree: "rounded-md",
            rectangle: "rounded-md",
            ovale: "rounded-xl",
          };
          const tableColors = {
            ronde: "bg-gradient-to-br from-pink-100 to-pink-300",
            carree: "bg-gradient-to-br from-blue-100 to-blue-300",
            rectangle: "bg-gradient-to-br from-green-100 to-green-300",
            ovale: "bg-gradient-to-br from-yellow-100 to-yellow-300",
          };
          const positions = getPlacePositions(table.type, table.capacite);

          return (
            <div
              key={table.id}
              className="absolute"
              style={{ left: table.position?.left || 0, top: table.position?.top || 0 }}
            >
              <div
                className="group relative w-20 h-20"
                style={{ transform: `rotate(${table.rotation || 0}deg)` }}
              >
                {positions.map((style, i) => {
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
                      onClick={() => handlePlaceClick(table, i + 1)}
                    />
                  );
                })}

                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  ${tableShape[table.type] || "rounded-md"}
                  ${tableColors[table.type] || "bg-white"}
                  w-16 h-16 flex items-center justify-center
                  border-4 border-indigo-400 shadow-md
                  cursor-grab active:cursor-grabbing select-none
                  transition-all duration-200 ease-in-out
                  hover:scale-105 hover:ring-2 hover:ring-indigo-500 backdrop-blur-sm bg-opacity-70`}
                >
                  <span className="text-xs font-bold text-indigo-700">
                    Table {table.numero}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </div>
  );
}



/**
 * 
 * @param {*} type 
 * @param {*} capacity 
 * @returns 
 * position de la place 
 * 
 */
function getPlacePositions(type, capacity) {
  const positions = [];
  if (type === "ronde" || type === "ovale") {
    const radius = 45;
    for (let i = 0; i < capacity; i++) {
      const angle = (2 * Math.PI * i) / capacity;
      const x = 40 + radius * Math.cos(angle);
      const y = 40 + radius * Math.sin(angle);
      positions.push({
        left: `${x}px`,
        top: `${y}px`,
        transform: "translate(-50%, -50%)",
      });
    }
  } else {
    const perSide = Math.ceil(capacity / 4);
    let count = 0;
    const spacing = 20;
    for (let i = 0; i < perSide && count < capacity; i++, count++)
      positions.push({ top: "-10px", left: `${10 + i * spacing}px` });
    for (let i = 0; i < perSide && count < capacity; i++, count++)
      positions.push({ top: `${10 + i * spacing}px`, left: "90px" });
    for (let i = 0; i < perSide && count < capacity; i++, count++)
      positions.push({ top: "90px", left: `${60 - i * spacing}px` });
    for (let i = 0; i < perSide && count < capacity; i++, count++)
      positions.push({ top: `${60 - i * spacing}px`, left: "-10px" });
  }
  return positions;
}
