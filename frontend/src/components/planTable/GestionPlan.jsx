import React, { useState, useEffect } from "react";
import PlanSalle from "./PlanSalle";
import { getTablesByEventId } from "../../services/tableService";

export default function GestionPlan({ selectedEventId }) {
  const [tables, setTables] = useState([]);
  console.log("GestionPlan - selectedEventId:", selectedEventId);
  useEffect(() => {
    if (!selectedEventId) return;
    getTablesByEventId(selectedEventId).then(setTables).catch(console.error);
  }, [selectedEventId]);

  console.log("GestionPlan - selectedEventId:", tables);

  if (!selectedEventId) return <p className="text-gray-600 p-6">Sélectionnez un événement.</p>;

  return <PlanSalle event={{ id: selectedEventId }} tables={tables} setTables={setTables} />;
}