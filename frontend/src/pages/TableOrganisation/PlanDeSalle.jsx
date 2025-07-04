import React, { useEffect, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import axios from "axios";

const TableItem = ({ table, onDragEnd }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.id.toString(),
  });

  const style = {
    position: "absolute",
    top: transform ? table.position.top + transform.y : table.position.top,
    left: transform ? table.position.left + transform.x : table.position.left,
    width: 80,
    height: 80,
    borderRadius: table.type === "ronde" ? "50%" : "10%",
    backgroundColor: "#1976d2",
    color: "#fff",
    textAlign: "center",
    lineHeight: "80px",
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      Table {table.numero}
    </div>
  );
};

export default function PlanDeSalle() {
  const [tables, setTables] = useState([]);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3000/tables/by-last-event", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setTables(res.data));
  }, []);

  const handleDragEnd = (event) => {
    const { delta, active } = event;
    const tableId = parseInt(active.id);
    const movedTable = tables.find((t) => t.id === tableId);

    const newLeft = movedTable.position.left + delta.x;
    const newTop = movedTable.position.top + delta.y;

    axios.patch(
      `http://localhost:3000/tables/${tableId}/position`,
      { left: newLeft, top: newTop },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Mise à jour locale (optimiste)
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, position: { left: newLeft, top: newTop } } : t
      )
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div style={{ position: "relative", width: "100%", height: "600px", background: "#f3f3f3" }}>
        {tables.map((table) => (
          <TableItem key={table.id} table={table} />
        ))}
      </div>
    </DndContext>
  );
}
