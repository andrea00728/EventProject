import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { updateTablePosition } from "../../services/tableService";
import { useStateContext } from "../../context/ContextProvider";

// Type drag pour table
const ItemTypes = { TABLE: "table" };

// Composant Place (une place autour de la table)
function Place({ reserved, number }) {
  return (
    <div
      className={`w-5 h-5 rounded-full m-1 inline-block ${
        reserved ? "bg-red-500" : "bg-green-500"
      } hover:scale-110 transition-transform duration-200`}
      title={`Place ${number} ${reserved ? "réservée" : "libre"}`}
    />
  );
}

// Composant Table draggable
function Table({ table, onMove }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TABLE,
    item: { id: table.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.TABLE,
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newPosition = {
          left: Math.round((table.position?.left || 0) + delta.x),
          top: Math.round((table.position?.top || 0) + delta.y),
        };
        onMove(table.id, newPosition);
      }
    },
  }));

  // Combiner drag et drop refs
  const ref = (node) => {
    drag(node);
    drop(node);
  };

  const tableShape = {
    ronde: "rounded-full",
    carree: "rounded-md",
    rectangle: "rounded-md",
    ovale: "rounded-xl",
  };

  // Valeurs par défaut pour position
  const position = table.position || { left: 0, top: 0 };

  return (
    <div
      ref={ref}
      className={`absolute border-2 border-gray-800 bg-white p-3 shadow-lg
        ${tableShape[table.type] || "rounded-md"}
        w-28 h-28 flex flex-col items-center justify-center
        ${isDragging ? "opacity-50" : "opacity-100"}
        cursor-move select-none hover:shadow-xl transition-all duration-200`}
      style={{ left: position.left, top: position.top }}
    >
      <div className="font-semibold text-gray-800 text-sm mb-2">
        Table {table.numero}
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {Array.from({ length: table.capacite }).map((_, i) => (
          <Place
            key={i}
            number={i + 1}
            reserved={table.placeReserve > i}
          />
        ))}
      </div>
    </div>
  );
}

// Zone principale
export default function PlanSalle({ event, tables }) {
  const { token } = useStateContext();

  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position);
    } catch (error) {
      console.error("Erreur mise à jour position :", error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div
          className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-lg shadow-xl
            bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(135deg,#f3f4f6_25%,transparent_25%),linear-gradient(225deg,#f3f4f6_25%,transparent_25%),linear-gradient(315deg,#f3f4f6_25%,transparent_25%)]
            bg-[length:20px_20px] bg-[0_0,10px_0,10px_0,0_0]"
        >
          <div className="absolute top-4 left-4 text-lg font-bold text-gray-800">
            Plan de salle: {event?.nom || "Événement"}
          </div>
          {tables.map((table) => (
            <Table key={table.id} table={table} onMove={handleTableMove} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}



// import React, { useState, useEffect } from "react";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import {
//   updateTablePosition,
//   getInvitesByEventId,
//   assignGuestToTable,
//   getTablesByEventId,
// } from "../../services/tableService";
// import { useStateContext } from "../../context/ContextProvider";
// import {
//   MagnifyingGlassPlusIcon,
//   MagnifyingGlassMinusIcon,
//   ArrowPathIcon,
//   ArrowLeftCircleIcon,
//   ArrowRightCircleIcon,
// } from "@heroicons/react/24/solid";

// const ItemTypes = { TABLE: "table" };

// function Place({ reserved, number, tableId, onAssignGuest, guestName }) {
//   return (
//     <div
//       className={`relative w-7 h-7 m-1 flex items-center justify-center rounded-full
//         ${reserved ? "bg-red-600 text-white" : "bg-green-600 text-white"}
//         hover:scale-110 transition-transform duration-200 cursor-pointer group`}
//       title={`Place ${number} ${reserved ? `réservée (${guestName || "Inconnu"})` : "libre"}`}
//       onClick={() => !reserved && onAssignGuest(tableId, number)}
//     >
//       <span className="absolute -top-2 -right-2 text-xs font-bold bg-gray-800 rounded-full w-5 h-5 flex items-center justify-center">
//         {number}
//       </span>
//       <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-10">
//         Place {number} {reserved ? `réservée (${guestName || "Inconnu"})` : "libre"}
//       </div>
//     </div>
//   );
// }

// function Table({ table, onMove, onAssignGuest }) {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: ItemTypes.TABLE,
//     item: { id: table.id },
//     collect: (monitor) => ({
//       isDragging: !!monitor.isDragging(),
//     }),
//   }));

//   const [, drop] = useDrop(() => ({
//     accept: ItemTypes.TABLE,
//     drop: (item, monitor) => {
//       const delta = monitor.getDifferenceFromInitialOffset();
//       if (delta) {
//         const newPosition = {
//           left: Math.round((table.position?.left || 0) + delta.x),
//           top: Math.round((table.position?.top || 0) + delta.y),
//           rotation: table.position?.rotation || 0,
//         };
//         onMove(table.id, newPosition);
//       }
//     },
//   }));

//   const ref = (node) => {
//     drag(node);
//     drop(node);
//   };

//   const tableShape = {
//     ronde: "rounded-full",
//     carree: "rounded-lg",
//     rectangle: "rounded-md aspect-[2/1]",
//     ovale: "rounded-3xl aspect-[3/2]",
//   };

//   const position = table.position || { left: 0, top: 0, rotation: 0 };

//   const handleRotate = async (degrees) => {
//     const newRotation = (position.rotation + degrees) % 360;
//     const newPosition = { ...position, rotation: newRotation };
//     onMove(table.id, newPosition);
//   };

//   const getPlaceLayout = () => {
//     const places = Array.from({ length: table.capacite }).map((_, i) => {
//       const guest = table.guests?.find((g) => g.seatNumber === i + 1);
//       return (
//         <Place
//           key={i}
//           number={i + 1}
//           reserved={table.guests ? !!guest : table.placeReserve > i}
//           tableId={table.id}
//           onAssignGuest={onAssignGuest}
//           guestName={guest ? `${guest.nom} ${guest.prenom}` : null}
//         />
//       );
//     });

//     if (table.type === "ronde") {
//       return (
//         <div className="relative w-full h-full flex items-center justify-center">
//           <div
//             className="absolute grid grid-cols-3 gap-1"
//             style={{ transform: `rotate(${-position.rotation}deg)` }}
//           >
//             {places}
//           </div>
//         </div>
//       );
//     }

//     return <div className="flex flex-wrap justify-center gap-1">{places}</div>;
//   };

//   return (
//     <div
//       ref={ref}
//       className={`absolute bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-xl border-2 border-gray-700
//         ${tableShape[table.type] || "rounded-md"}
//         w-40 h-40 flex flex-col items-center justify-center
//         ${isDragging ? "opacity-60 scale-105" : "opacity-100"}
//         cursor-move select-none hover:shadow-2xl transition-all duration-300 group`}
//       style={{
//         left: position.left,
//         top: position.top,
//         transform: `rotate(${position.rotation}deg)`,
//         transition: "transform 0.3s ease",
//       }}
//     >
//       <div className="flex items-center justify-between w-full mb-2">
//         <span className="font-bold text-gray-800 text-sm">
//           Table {table.numero}
//         </span>
//         <span className="text-xs text-gray-500">
//           {table.capacite - (table.guests?.length || table.placeReserve)}/{table.capacite}
//         </span>
//       </div>
//       <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
//         <button onClick={() => handleRotate(-15)} className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700" title="Pivoter à gauche">
//           <ArrowLeftCircleIcon className="w-4 h-4" />
//         </button>
//         <button onClick={() => handleRotate(15)} className="p-1 bg-gray-600 text-white rounded-full hover:bg-gray-700" title="Pivoter à droite">
//           <ArrowRightCircleIcon className="w-4 h-4" />
//         </button>
//       </div>
//       {getPlaceLayout()}
//     </div>
//   );
// }

// export default function PlanSalle({ event }) {
//   const { token } = useStateContext();
//   const [zoom, setZoom] = useState(1);
//   const [message, setMessage] = useState("");
//   const [guests, setGuests] = useState([]);
//   const [selectedGuest, setSelectedGuest] = useState(null);
//   const [tables, setTables] = useState([]);

//   useEffect(() => {
//     const fetchTables = async () => {
//       try {
//         if (!event?.id || !token) return;
//         const data = await getTablesByEventId(event.id, token);
//         setTables(data);
//       } catch (error) {
//         console.error("Erreur chargement tables :", error);
//       }
//     };
//     fetchTables();
//   }, [event?.id, token]);

//   useEffect(() => {
//     const fetchGuests = async () => {
//       try {
//         if (!event?.id || !token) return;
//         const data = await getInvitesByEventId(event.id, token);
//         setGuests(data);
//       } catch (error) {
//         console.error("Erreur chargement invités :", error);
//       }
//     };
//     fetchGuests();
//   }, [event?.id, token]);

//   const handleTableMove = async (tableId, position) => {
//     try {
//       await updateTablePosition(tableId, position, token);
//       setTables((prev) =>
//         prev.map((t) => (t.id === tableId ? { ...t, position } : t))
//       );
//     } catch (error) {
//       console.error("Erreur mise à jour position :", error);
//     }
//   };

//   const handleAssignGuest = async (tableId, seatNumber) => {
//     if (!selectedGuest) return;
//     try {
//       const updatedTable = await assignGuestToTable(selectedGuest.id, tableId, seatNumber, token);
//       setMessage(`✅ Invité assigné à la place ${seatNumber}`);
//       const guestData = await getInvitesByEventId(event.id, token);
//       setGuests(guestData);
//       setTables((prev) =>
//         prev.map((t) => (t.id === tableId ? updatedTable : t))
//       );
//     } catch (error) {
//       console.error("Erreur assignation invité :", error);
//     }
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="flex p-4 min-h-screen bg-gray-100">
//         {/* Sidebar */}
//         <div className="w-64 bg-white p-4 shadow-md rounded-lg mr-4">
//           <h2 className="text-xl font-bold mb-4">Événement : {event?.nom}</h2>
//           <p>Date : {event?.date}</p>
//           <p>Tables : {tables.length}</p>
//           <p>
//             Total places : {tables.reduce((sum, t) => sum + t.capacite, 0)}
//           </p>
//           <p>
//             Places réservées :{" "}
//             {tables.reduce((sum, t) => sum + (t.guests?.length || 0), 0)}
//           </p>
//           <div className="mt-4">
//             <label className="text-sm">Sélectionner un invité</label>
//             <select
//               value={selectedGuest?.id || ""}
//               onChange={(e) => {
//                 const guest = guests.find((g) => g.id === parseInt(e.target.value));
//                 setSelectedGuest(guest || null);
//               }}
//               className="w-full border mt-1 rounded px-2 py-1"
//             >
//               <option value="">Choisir</option>
//               {guests.map((guest) => (
//                 <option key={guest.id} value={guest.id}>
//                   {guest.nom} {guest.prenom}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex space-x-2 mt-4">
//             <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))} className="bg-blue-600 text-white px-2 py-1 rounded">
//               <MagnifyingGlassPlusIcon className="w-5 h-5" />
//             </button>
//             <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} className="bg-blue-600 text-white px-2 py-1 rounded">
//               <MagnifyingGlassMinusIcon className="w-5 h-5" />
//             </button>
//             <button
//               onClick={async () => {
//                 const resetPos = { left: 0, top: 0, rotation: 0 };
//                 await Promise.all(tables.map((t) => updateTablePosition(t.id, resetPos, token)));
//                 setTables(tables.map((t) => ({ ...t, position: resetPos })));
//               }}
//               className="bg-gray-600 text-white px-2 py-1 rounded"
//             >
//               <ArrowPathIcon className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Plan de salle */}
//         <div
//           className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden"
//           style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
//         >
//           {tables.map((table) => (
//             <Table
//               key={table.id}
//               table={table}
//               onMove={handleTableMove}
//               onAssignGuest={handleAssignGuest}
//             />
//           ))}
//         </div>
//         {message && (
//           <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
//             {message}
//           </div>
//         )}
//       </div>
//     </DndProvider>
//   );
// }
