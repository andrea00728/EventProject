// import React, { useState, useEffect } from "react";
// import PlanSalle from "./PlanSalle";
// import { getTablesByEventId, updateTablePosition } from "../../services/tableService";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// export default function GestionPlan({ selectedEventId }) {
//   const [tables, setTables] = useState([]);

//   useEffect(() => {
//     if (!selectedEventId) return;
//     // Charger les tables depuis backend
//     getTablesByEventId(selectedEventId).then(setTables);
//   }, [selectedEventId]);

//   const handleTableMove = (tableId, newPosition) => {
//     // Met à jour localement
//     setTables((prev) =>
//       prev.map((t) => (t.id === tableId ? { ...t, position: newPosition } : t))
//     );
//     // Envoie la nouvelle position au backend
//     updateTablePosition(tableId, newPosition).catch(console.error);
//   };

//   if (!selectedEventId) return <p>Sélectionnez un événement.</p>;

//   return <PlanSalle event={selectedEventId} tables={tables} onTableMove={handleTableMove} />;
//   //  return (
//   //   <DndProvider backend={HTML5Backend}>
//   //     {/* toute la zone qui utilise useDrag/useDrop */}
//   //   </DndProvider>
//   // );
// }


import React, { useState, useEffect } from "react";
import PlanSalle from "./PlanSalle";
import { getTablesByEventId, updateTablePosition } from "../../services/tableService";

export default function GestionPlan({ selectedEventId }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    if (!selectedEventId) return;
    // Charger les tables depuis backend
    getTablesByEventId(selectedEventId).then(setTables).catch(console.error);
  }, [selectedEventId]);

  const handleTableMove = async (tableId, newPosition) => {
    try {
      // Met à jour localement
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, position: newPosition } : t))
      );
      // Envoie la nouvelle position au backend
      await updateTablePosition(tableId, newPosition);
    } catch (error) {
      console.error("Erreur mise à jour position :", error);
    }
  };

  if (!selectedEventId) return <p className="text-gray-600 p-6">Sélectionnez un événement.</p>;

  return <PlanSalle event={{ id: selectedEventId }} tables={tables} />;
}

