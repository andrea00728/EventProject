import React from "react";
import { useStateContext } from "../../context/ContextProvider";
import { updateTablePosition } from "../../services/tableService";

// Place composant inchangé
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

// Table composant avec drag natif HTML5
function Table({ table, onMove }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  // Position initiale
  const [pos, setPos] = React.useState(table.position || { left: 0, top: 0 });

  // Met à jour la position si la prop change (ex: depuis le parent)
  React.useEffect(() => {
    setPos(table.position || { left: 0, top: 0 });
  }, [table.position]);

  // Drag handlers
  const handleDragStart = (e) => {
    setDragging(true);
    e.dataTransfer.setData("tableId", table.id);
    e.dataTransfer.effectAllowed = "move";
    // Pour l'effet drag, sinon Chrome ne drag pas
    const crt = document.createElement("div");
    crt.style.visibility = "hidden";
    document.body.appendChild(crt);
    e.dataTransfer.setDragImage(crt, 0, 0);
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    const x = e.clientX - parentRect.left - 40; // 40 = moitié de w-20
    const y = e.clientY - parentRect.top - 40;
    setPos({ left: x, top: y });
    onMove(table.id, { left: x, top: y });
  };

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

  return (
    <div
      ref={ref}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`absolute border-4 border-indigo-400 ${tableShape[table.type] || "rounded-md"}
        ${tableColors[table.type] || "bg-white"}
        w-20 h-20 flex flex-col items-center justify-center
        shadow-xl hover:shadow-2xl transition-all duration-200
        cursor-grab active:cursor-grabbing select-none group
        ${dragging ? "opacity-60 ring-4 ring-indigo-300" : ""}
      `}
      style={{ left: pos.left, top: pos.top, zIndex: dragging ? 50 : 10 }}
    >
      <div className="font-bold text-indigo-700 text-xs mb-1 group-hover:scale-110 transition-transform">
        <span className="inline-block bg-white border border-indigo-300 px-2 py-1 rounded-full shadow text-xs">
          Table {table.numero}
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-1">
        {Array.from({ length: table.capacite }).map((_, i) => (
          <Place key={i} number={i + 1} reserved={table.placeReserve > i} />
        ))}
      </div>
    </div>
  );
}

export default function PlanSalle({ event, tables, setTables }) {
  const { token } = useStateContext();

  // Met à jour la position localement et côté backend
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

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow-lg">
          🪑 Plan de salle : {event?.nom || "Événement"}
        </div>
        {tables.map((table) => (
          <Table key={table.id} table={table} onMove={handleTableMove} />
        ))}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
    </div>
  );
}