import { useEffect, useState } from "react";
import { getTablesByEventId, getAvailableSeats, createTable } from "../services/tableService";
import CreateTable from "../components/tableForm";
import { useStateContext } from "../context/ContextProvider";

// Types de tables avec schéma (icône SVG simple pour l'exemple)
const TABLE_TYPES = [
  {
    value: "ronde",
    label: "Table ronde",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-2">
        <circle cx="24" cy="24" r="18" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "rectangle", // <-- ici
    label: "Table rectangulaire",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-2">
        <rect x="8" y="16" width="32" height="16" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "ovale",
    label: "Table ovale",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-2">
        <ellipse cx="24" cy="24" rx="16" ry="10" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
  {
    value: "carree", // Optionnel si tu veux gérer les tables carrées
    label: "Table carrée",
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-2">
        <rect x="12" y="12" width="24" height="24" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      </svg>
    ),
  },
];

export default function Table({ eventId, onNext, onBack }) {
  const [tables, setTables] = useState([]);
  const { token } = useStateContext();
  const [modalTypeOpen, setModalTypeOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(TABLE_TYPES[0].value);

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

  // Passe le type de table sélectionné au formulaire
  const handleCreateTable = async (formData) => {
    try {
      await createTable({ ...formData, eventId }, token); // NE PAS forcer type: selectedType ici
      await loadTables();
    } catch (err) {
      console.error("Erreur lors de la création d'une table", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-10 px-4">
      <div className="w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 mb-8">
        <h2 className="text-3xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">
          Gestion des tables
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Créez et visualisez vos tables pour organiser vos invités.
        </p>
        {/* <button
          className="mb-6 mx-auto block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow hover:bg-indigo-700 transition"
          onClick={() => setModalTypeOpen(true)}
        >
          Choisir le type de table
        </button> */}
        <CreateTable onSubmitTable={handleCreateTable} selectedType={selectedType} />
      </div>

      {/* Modal de sélection du type de table */}
      {modalTypeOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-2xl relative">
            <button
              className="absolute top-4 right-6 text-3xl font-bold text-gray-400 hover:text-red-600"
              onClick={() => setModalTypeOpen(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-center mb-8 text-indigo-700">
              Sélectionnez le type de table
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {TABLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex flex-col items-center justify-center rounded-xl p-6 border-2 transition shadow-md hover:shadow-lg focus:outline-none ${
                    selectedType === type.value
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-400"
                      : "border-gray-200 bg-white"
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.icon}
                  <span className="text-lg font-semibold mb-2">{type.label}</span>
                </button>
              ))}
            </div>
            <button
              className="mt-8 w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              onClick={() => setModalTypeOpen(false)}
              type="button"
            >
              Valider le type de table
            </button>
          </div>
        </div>
      )}

      <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
        <h3 className="text-2xl font-bold text-indigo-700 mb-6">Tables créées</h3>
        {tables.length === 0 ? (
          <div className="text-center text-gray-400 py-8">Aucune table créée pour cet événement.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const typeObj = TABLE_TYPES.find((t) => t.value === table.type);
              return (
                <div
                  key={table.id}
                  className="rounded-xl border-2 border-indigo-100 bg-indigo-50 p-6 flex flex-col items-center shadow hover:shadow-lg transition"
                >
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-indigo-200 mb-3 text-2xl font-bold text-indigo-800 shadow">
                    {table.numero}
                  </div>
                  <div className="text-lg font-semibold text-indigo-900 mb-2">
                    Capacité : {table.capacite}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Places disponibles :{" "}
                    <span className="font-bold text-green-700">{table.available}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Type : {typeObj ? typeObj.label : table.type || "-"}
                  </div>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {typeObj?.icon}
                      {typeObj?.label || "Type inconnu"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-200 text-indigo-800 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
          >
            Retour
          </button>
        )}

        {tables.length > 0 && onNext && (
          <button
            onClick={onNext}
            className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold shadow hover:bg-green-700 transition"
          >
            Étape suivante : Ajouter des invités
          </button>
        )}
      </div>
    </div>
  );
}

