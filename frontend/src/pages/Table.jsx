import { useEffect, useState } from "react";
import { getTablesByEventId, getAvailableSeats, createTable } from "../services/tableService";
import Table3DScene from "../components/table3D";
import CreateTable from "../components/tableForm";
import { useStateContext } from "../context/ContextProvider";

export default function Table({ eventId }) {
  const [tables, setTables] = useState([]);
  const { token } = useStateContext();

  const loadTables = async () => {
    if (!eventId || !token) return;
    try {
      const data = await getTablesByEventId(eventId, token);
      const withSeats = await Promise.all(
        data.map(async (t) => {
          const available = await getAvailableSeats(t.id);
          return { ...t, available };
        })
      );
      setTables(withSeats);
    } catch (error) {
      console.error("Erreur chargement tables", error);
    }
  };

  useEffect(() => {
    loadTables();
  }, [eventId, token]);

  const handleCreateTable = async (formData) => {
    try {
      await createTable(formData, token);
      await loadTables();
    } catch (err) {
      console.error("Erreur lors de la création d'une table", err);
    }
  };

  return (
    <>
      <CreateTable onSubmitTable={handleCreateTable} />
      <Table3DScene tables={tables} eventId={eventId} />
    </>
  );
}
