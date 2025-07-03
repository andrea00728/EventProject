import React, { useEffect, useState } from "react";
import { getGuestsByEventId } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import DeleteGuestButton from "../../util/DeleteInviteButton";
import EditGuestButton from "../../util/buttonModifIvite";

// Composant pour une option d'événement dans le modal
const EventOption = ({ event, onSelect }) => (
  <div
    className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors duration-200"
    onClick={() => onSelect(event.id, event.nom)}
  >
    {event.nom} ({new Date(event.date).toLocaleDateString("fr-FR")})
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
      .then((data) => {
        setGuests(data);
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

  // Configuration des colonnes du DataGrid
  const columns = [
    { field: "nom", headerName: "Nom", width: 150, headerClassName: "font-bold text-gray-900" },
    { field: "prenom", headerName: "Prénom", width: 150, headerClassName: "font-bold text-gray-900" },
    { field: "email", headerName: "Email", width: 200, headerClassName: "font-bold text-gray-900" },
    {
      field: "sex",
      headerName: "Sexe",
      width: 150,
      headerClassName: "font-bold text-gray-900",
      valueGetter: ({ row }) => (row?.sex === "M" ? "Homme" : row?.sex === "F" ? "Femme" : "-"),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
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
    <div  >
      <div className="mb-[-30px]">
        {/* Sélecteur d'événement avec modal */}
        <div className="mb-4">
          <label htmlFor="eventSelect" className="text-sm font-medium text-gray-700 mb-2 block">
            Sélectionner un événement
          </label>
          <div
            className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 w-full max-w-md cursor-pointer hover:bg-gray-100 focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all duration-200 text-gray-900 flex items-center justify-between"
            onClick={() => setShowModal(true)}
          >
            <span>{selectedEventName || "-- Sélectionner un événement --"}</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-white opacity-50 flex items-center justify-center z-50">
              <div className="bg-black p-6 rounded-xl shadow-lg w-full max-w-md animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg  text-white">Sélectionner un événement</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-gray-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {events.map((event) => (
                    <EventOption key={event.id} event={event} onSelect={handleEventSelect} />
                  ))}
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

        {/* Tableau des invités avec scroll si > 5 */}
        {!isLoading && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <DataGrid
              rows={guests}
              columns={columns}
              getRowId={(row) => row.id}
              pageSizeOptions={[5, 10, 20]}
              autoHeight={guests.length <= 5}
              getRowHeight={() => (guests.length > 5 ? "auto" : undefined)}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "rgba(243, 244, 246, 0.8)",
                  color: "#111827",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e5e7eb",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f9fafb",
                },
                ...(guests.length > 5 && {
                  height: "384px", // h-96
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