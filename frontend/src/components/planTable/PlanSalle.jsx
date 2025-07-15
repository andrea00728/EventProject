import React from "react";
import { useStateContext } from "../../context/ContextProvider";
import { updateTablePosition, updateRotation ,deleteTable} from "../../services/tableService";

// Composant visuel d’une place
function Place({ reserved, style, number }) {
  return (
    <div
      className={`w-4 h-4 rounded-full border absolute ${
        reserved ? "bg-red-500" : "bg-green-400"
      } border-white shadow-sm transition duration-200 hover:scale-110`}
      title={`Place ${number} ${reserved ? "réservée" : "libre"}`}
      style={style}
    />
  );
}

// Calcul des positions autour de la table
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

// Snap to grid
function snapToGrid(value, gridSize = 40) {
  return Math.round(value / gridSize) * gridSize;
}

// Menu d'actions
function TableActionsMenu({ onRotateLeft, onRotateRight, onDelete, onDuplicate }) {
  return (
    <div className="absolute -top-6 right-0 flex gap-1 bg-white shadow-lg rounded-full px-2 py-1 text-xs z-10 backdrop-blur-sm bg-opacity-90 opacity-0 group-hover:opacity-100 transition">
      <button onClick={onRotateLeft} title="↺ gauche" className="hover:text-indigo-600">↺</button>
      <button onClick={onRotateRight} title="↻ droite" className="hover:text-indigo-600">↻</button>
      <button onClick={onDelete} title="🗑 supprimer" className="hover:text-red-600">🗑</button>
    </div>
  );
}

// Composant Table
function Table({ table, onMove, onRotate, onDelete, onDuplicate }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [pos, setPos] = React.useState(table.position || { left: 0, top: 0 });
  const [rotation, setRotation] = React.useState(table.rotation || 0);

  React.useEffect(() => {
    setPos(table.position || { left: 0, top: 0 });
    setRotation(table.rotation || 0);
  }, [table.position, table.rotation]);

  const handleDragStart = (e) => {
    setDragging(true);
    e.dataTransfer.setData("tableId", table.id);
    const img = new Image();
    img.src = "";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    const parentRect = ref.current.parentNode.getBoundingClientRect();
    const x = snapToGrid(e.clientX - parentRect.left - 40);
    const y = snapToGrid(e.clientY - parentRect.top - 40);
    setPos({ left: x, top: y });
    onMove(table.id, { left: x, top: y });
  };

  const handleRotateLeft = () => {
    const newRotation = (rotation - 15 + 360) % 360;
    setRotation(newRotation);
    onRotate(table.id, newRotation);
  };

  const handleRotateRight = () => {
    const newRotation = (rotation + 15) % 360;
    setRotation(newRotation);
    onRotate(table.id, newRotation);
  };

  const handleDelete = () => onDelete(table.id);

  const handleDuplicate = () => {
    const newTable = {
      ...table,
      id: Date.now(),
      numero: table.numero + " bis",
      position: { left: pos.left + 40, top: pos.top + 40 },
    };
    onDuplicate(newTable);
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
      className="absolute"
      style={{ left: pos.left, top: pos.top, zIndex: dragging ? 50 : 10 }}
    >
      <div className="group relative w-20 h-20" style={{ transform: `rotate(${rotation}deg)` }}>
        <TableActionsMenu
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

        {getPlacePositions(table.type, table.capacite).map((style, i) => (
          <Place key={i} number={i + 1} reserved={table.placeReserve > i} style={style} />
        ))}

        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${tableShape[table.type] || "rounded-md"}
            ${tableColors[table.type] || "bg-white"}
            w-16 h-16 flex items-center justify-center
            border-4 border-indigo-400 shadow-md
            cursor-grab active:cursor-grabbing select-none
            transition-all duration-200 ease-in-out
            ${dragging ? "opacity-60 ring-4 ring-indigo-300" : ""}
            hover:scale-105 hover:ring-2 hover:ring-indigo-500 backdrop-blur-sm bg-opacity-70`}
        >
          <span className="text-xs font-bold text-indigo-700">Table {table.numero}</span>
        </div>
      </div>
    </div>
  );
}

// Composant principal
export default function PlanSalle({ event, tables, setTables }) {
  const { token } = useStateContext();

  const handleTableMove = async (tableId, position) => {
    try {
      await updateTablePosition(tableId, position, token);
      if (setTables) {
        setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, position } : t)));
      }
    } catch (error) {
      console.error("Erreur mise à jour position :", error);
    }
  };

  const handleTableRotate = async (tableId, rotation) => {
    try {
      await updateRotation(tableId, rotation, token);
      if (setTables) {
        setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, rotation } : t)));
      }
    } catch (error) {
      console.error("Erreur mise à jour rotation :", error);
    }
  };

  const handleTableDelete = async (tableId) => {
     const confirm = window.confirm("Supprimer cette table ?");
  if (!confirm) return;
    try{
      await deleteTable(tableId, token);
     if (setTables) {
      setTables((prev) => prev.filter((t) => t.id !== tableId)); // 👈 mise à jour locale
    }
    }catch (error) {
      console.error("Erreur suppression table :", error);
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="relative w-[800px] h-[600px] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xl font-extrabold text-indigo-700 tracking-wide drop-shadow-lg">
          🪑 Plan de salle : {event?.nom || "Événement"}
        </div>

        {/* Tables */}
        {tables.map((table) => (
          <Table
            key={table.id}
            table={table}
            onMove={handleTableMove}
            onRotate={handleTableRotate}
            onDelete={handleTableDelete}
          />
        ))}

        {/* Grille */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(200,200,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(200,200,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </div>
  );
}