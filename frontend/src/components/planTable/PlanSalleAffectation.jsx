import React, { useState } from "react";
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

function Table({ table, onPlaceClick, selectedPlace }) {
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
      className="absolute transition-all duration-150 ease-in-out"
      style={{ left: table.position?.left ?? 0, top: table.position?.top ?? 0 }}
    >
      <div className="relative w-20 h-20" style={{ transform: `rotate(${table.rotation ?? 0}deg)` }}>
        {Array.isArray(getPlacePositions(table.type, table.capacite)) &&
          getPlacePositions(table.type, table.capacite).map((style, i) => {
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
                  e.stopPropagation();
                  onPlaceClick(table, i + 1);
                }}
              />
            );
          })}

        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${tableShape[table.type] || "rounded-md"}
            ${tableColors[table.type] || "bg-white"}
            ${sizeStyles[table.type] || "w-16 h-16"}
            flex items-center justify-center
            border-4 border-indigo-400 shadow-md
            select-none text-xs font-bold text-indigo-700`}
        >
          Table {table.nom}
        </div>
      </div>
    </div>
  );
}

export default function PlanSalleAffectation({ tables = [], setTables, reassignGuest, token }) {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceClick = (table, placeNumber) => {
    const guest = table.guests?.find((g) => g.place === placeNumber);

    if (guest) {
      setSelectedPlace({
        tableId: table.id,
        placeNumber,
        guestId: guest.id,
        guestName: guest.nom,
      });
    } else {
      if (selectedPlace) {
        reassignGuest(selectedPlace.guestId, table.id, placeNumber, token)
          .then(() => {
            setTables((prevTables) =>
              prevTables.map((t) => {
                if (t.id === selectedPlace.tableId && t.id === table.id) {
                  return {
                    ...t,
                    guests: t.guests.map((g) =>
                      g.id === selectedPlace.guestId ? { ...g, place: placeNumber } : g
                    ),
                  };
                } else if (t.id === selectedPlace.tableId) {
                  return {
                    ...t,
                    guests: t.guests.filter((g) => g.id !== selectedPlace.guestId),
                  };
                } else if (t.id === table.id) {
                  return {
                    ...t,
                    guests: [
                      ...(t.guests || []),
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
          .catch((err) => alert("Erreur déplacement invité : " + err.message));
      } else {
        alert("Cliquez d'abord sur une place occupée pour déplacer un invité.");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700">
          Affectation des invités
        </div>

        {Array.isArray(tables) &&
          tables.map((table) => (
            <Table
              key={table.id}
              table={table}
              onPlaceClick={handlePlaceClick}
              selectedPlace={selectedPlace}
            />
          ))}

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </div>
  );
}