import { useEffect, useState } from "react";
import { getTablesByEventId, getAvailableSeats, createTable } from "../services/tableService";
import Table3DScene from "../components/table3D";
import CreateTable from "../components/tableForm";
import { useStateContext } from "../context/ContextProvider";

export default function Table({ eventId, onNext, onBack }) {
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
      await createTable({ ...formData, eventId }, token);
      await loadTables();
    } catch (err) {
      console.error("Erreur lors de la création d'une table", err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <CreateTable onSubmitTable={handleCreateTable} />
      <Table3DScene tables={tables} eventId={eventId} />

      <div className="flex gap-4 mt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Retour
          </button>
        )}

        {tables.length > 0 && onNext && (
          <button
            onClick={onNext}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Étape suivante : Ajouter des invités
          </button>
        )}
      </div>
    </div>
  );
}

