import React, { useEffect, useState } from "react";
import { getGuestsByEventId } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import DeleteGuestButton from "../../util/DeleteInviteButton";
import EditGuestButton from "../../util/buttonModifIvite";

const EventOption = ({ event, onSelect }) => (
  <div
    className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
    onClick={() => onSelect(event.id, event.nom)}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{event.nom}</span>
      <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString("fr-FR")}</span>
    </div>
    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  </div>
);

export default function AffichageInvite() {
  const { isAuthenticated } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    getMyEvents()
      .then((data) => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement événements:", err);
        setError("Erreur lors du chargement des événements.");
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedEventId || !isAuthenticated) return;
    setIsLoading(true);
    getGuestsByEventId(selectedEventId)
      .then((guestsData) => {
        setGuests(guestsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement invités:", err);
        setError("Erreur lors du chargement des invités.");
        setIsLoading(false);
      });
  }, [selectedEventId, isAuthenticated]);

  const handleEventSelect = (id, name) => {
    setSelectedEventId(id);
    setSelectedEventName(name);
    setGuests([]);
    setError(null);
    setShowModal(false);
  };

  const columns = [
    { 
      field: "nom", 
      headerName: "Nom", 
      width: 150, 
      headerClassName: "font-semibold text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50" 
    },
    { 
      field: "prenom", 
      headerName: "Prénom", 
      width: 150, 
      headerClassName: "font-semibold text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50" 
    },
    { 
      field: "email", 
      headerName: "Email", 
      width: 250, 
      headerClassName: "font-semibold text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50" 
    },
    {
      field: "sex",
      headerName: "Sexe",
      width: 120,
      headerClassName: "font-semibold text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50",
      valueGetter: ({ row }) => (row?.sex === "M" ? "Homme" : row?.sex === "F" ? "Femme" : "-"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 160,
      sortable: false,
      headerClassName: "font-semibold text-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50",
      renderCell: ({ row }) => (
        <div className="flex gap-2">
          <EditGuestButton
            guest={row}
            onUpdated={(updatedGuest) =>
              setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)))
            }
          />
          <DeleteGuestButton
            guestId={row.id}
            onDeleted={(deletedId) =>
              setGuests((prev) => prev.filter((g) => g.id !== deletedId))
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header avec titre et sélecteur d'événement */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Liste des Invités</h1>
            <p className="text-gray-600">Gérez vos invités par événement</p>
          </div>
        </div>

        {/* Sélecteur d'événement */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Événement :</label>
          <button
            className="w-full max-w-md flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => setShowModal(true)}
          >
            <span className="font-medium text-gray-700">
              {selectedEventName || "-- Sélectionner un événement --"}
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Sélectionner un événement</h3>
                  <button
                    className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-3">
                    {events.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">Aucun événement disponible.</div>
                    ) : (
                      events.map((event) => (
                        <EventOption key={event.id} event={event} onSelect={handleEventSelect} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        ) : (
          selectedEventId && (
            <div className="h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <DataGrid
                rows={guests}
                columns={columns}
                getRowId={(row) => row.id}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                  height: '100%',
                  border: 'none',
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "transparent",
                    borderBottom: "2px solid #e2e8f0",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: "0.9rem",
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "2px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                  },
                }}
                className="bg-white"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}