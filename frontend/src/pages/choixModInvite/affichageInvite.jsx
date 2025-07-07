import React, { useEffect, useState } from "react";
import { getGuestsByEventId } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import DeleteGuestButton from "../../util/DeleteInviteButton";
import EditGuestButton from "../../util/buttonModifIvite";

// Composant pour une option d'événement dans le modal (UI/UX moderne)
const EventOption = ({ event, onSelect }) => (
  <div
    className="flex items-center gap-3 px-5 py-4 hover:bg-indigo-50 cursor-pointer rounded-xl transition-all duration-200 border border-transparent hover:border-indigo-300 shadow-sm"
    onClick={() => onSelect(event.id, event.nom)}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-indigo-700">{event.nom}</span>
      <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString("fr-FR")}</span>
    </div>
  </div>
);

export default function AffichageInvite() {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Récupération des événements
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    getMyEvents(token)
      .then((data) => {
        setEvents(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement événements:", err);
        setError("Erreur lors du chargement des événements.");
        setIsLoading(false);
      });
  }, [token]);

  // Récupération des invités pour l'événement sélectionné
  useEffect(() => {
    if (!selectedEventId || !token) return;
    setIsLoading(true);
    getGuestsByEventId(selectedEventId, token)
      .then((guestsData) => {
        setGuests(guestsData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement invités:", err);
        setError("Erreur lors du chargement des invités.");
        setIsLoading(false);
      });
  }, [selectedEventId, token]);

  // Gestion de la sélection d'événement via le modal
  const handleEventSelect = (id, name) => {
    setSelectedEventId(id);
    setSelectedEventName(name);
    setGuests([]);
    setError(null);
    setShowModal(false);
  };

  // Configuration des colonnes du DataGrid (sans table/place)
  const columns = [
    { field: "nom", headerName: "Nom", width: 150, headerClassName: "font-bold text-gray-900" },
    { field: "prenom", headerName: "Prénom", width: 150, headerClassName: "font-bold text-gray-900" },
    { field: "email", headerName: "Email", width: 200, headerClassName: "font-bold text-gray-900" },
    {
      field: "sex",
      headerName: "Sexe",
      width: 120,
      headerClassName: "font-bold text-gray-900",
      valueGetter: ({ row }) => (row?.sex === "M" ? "Homme" : row?.sex === "F" ? "Femme" : "-"),
    },
    {
      field: "actions",
      headerName: "",
      width: 160,
      sortable: false,
      headerClassName: "font-bold text-gray-900",
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
    <div>
      <div className="mb-[-30px]">
        {/* Sélecteur d'événement avec modal UX moderne */}
        <div className="mb-6">
          <label htmlFor="eventSelect" className="text-base font-semibold text-gray-800 mb-2 block">
            Sélectionner un événement
          </label>
          <div
            className="border border-indigo-200 bg-white rounded-xl px-5 py-4 w-full max-w-md cursor-pointer hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all duration-200 text-gray-900 flex items-center justify-between shadow"
            onClick={() => setShowModal(true)}
          >
            <span className="font-medium text-indigo-700">{selectedEventName || "-- Sélectionner un événement --"}</span>
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-2xl relative">
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl font-bold focus:outline-none"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
                <h3 className="text-2xl font-bold text-center mb-6 text-indigo-700">Sélectionnez un événement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500">Aucun événement disponible.</div>
                  ) : (
                    events.map((event) => (
                      <EventOption key={event.id} event={event} onSelect={handleEventSelect} />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {error && (
          <p className="text-red-600 bg-red-50 py-3 px-4 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Tableau des invités */}
        {!isLoading && (
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow">
            <DataGrid
              rows={guests}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 20, 100]}
              autoHeight={guests.length <= 5}
              getRowHeight={() => (guests.length > 5 ? "auto" : undefined)}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(238,242,255,0.8)",
                  color: "#3730a3",
                  fontWeight: "bold",
                  fontSize: "1rem",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0e7ff",
                  fontSize: "0.98rem",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f1f5f9",
                },
                ...(guests.length > 5 && {
                  height: "384px",
                  "& .MuiDataGrid-virtualScroller": {
                    overflowY: "auto",
                  },
                }),
              }}
              className="bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}