import React, { useState, useEffect } from "react";
import PlanSalle from "./PlanSalle";
import { getTablesByEventId } from "../../services/tableService";

export default function GestionPlan({ selectedEventId }) {
  const [tables, setTables] = useState([]);
<<<<<<< HEAD
  console.log("GestionPlan - selectedEventId:", selectedEventId);
=======

>>>>>>> 0ef7910015ba8bcaffd4a3e5719f6f870aba665c
  useEffect(() => {
    if (!selectedEventId) return;
    getTablesByEventId(selectedEventId).then(setTables).catch(console.error);
  }, [selectedEventId]);

<<<<<<< HEAD
  console.log("GestionPlan - selectedEventId:", tables);

=======
>>>>>>> 0ef7910015ba8bcaffd4a3e5719f6f870aba665c
  if (!selectedEventId) return <p className="text-gray-600 p-6">Sélectionnez un événement.</p>;

  return <PlanSalle event={{ id: selectedEventId }} tables={tables} setTables={setTables} />;
}