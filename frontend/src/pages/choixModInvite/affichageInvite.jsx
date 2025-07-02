import React, { useEffect, useState } from "react";
import { getGuestsByEventId } from "../../services/inviteService";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import DeleteGuestButton from "../../util/DeleteInviteButton";

export default function AffichageInvite() {
  const { token } = useStateContext();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [guests, setGuests] = useState([]);

  // Récupération des événements de l'utilisateur connecté
  useEffect(() => {
    if (!token) return;
    getMyEvents(token)
      .then((data) => setEvents(data))
      .catch((err) => console.error("Erreur chargement événements:", err));
  }, [token]);

  // Récupération des invités lorsque l'événement change
  useEffect(() => {
    if (!selectedEventId || !token) return;
    getGuestsByEventId(selectedEventId, token)
      .then(setGuests)
      .catch((err) => console.error("Erreur chargement invités:", err));
  }, [selectedEventId, token]);

  const handleEventChange = (e) => {
    const selected = e.target.value;
    setSelectedEventId(selected ? Number(selected) : null);
    setGuests([]); // réinitialise les invités pendant le chargement
  };

  const columns = [
    { field: "nom", headerName: "Nom", width: 130 },
    { field: "prenom", headerName: "Prénom", width: 130 },
    { field: "email", headerName: "Email", width: 140 },
    {field: "sex",headerName: "Sexe", width: 170, valueGetter: (params) => {
        if (!params.row || params.row.sex === undefined) {
          return "-";
        }
        return params.row.sex === "M" ? "Homme" : params.row.sex === "F" ? "Femme" : "-";
      },
    },
{ field: "actions", headerName: "Actions", width: 150, sortable: false, renderCell: (params) => (
    <DeleteGuestButton
      guestId={params.row.id}
      onDeleted={(deletedId) => {
        setGuests((prev) => prev.filter((g) => g.id !== deletedId));
      }}
    />
  ),
}

  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Afficher les invités par événement
      </h2>

      <select
        value={selectedEventId || ""}
        onChange={handleEventChange}
        className="border p-2 rounded mb-4 w-full max-w-md"
      >
        <option value="">-- Sélectionner un événement --</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.nom} ({new Date(event.date).toLocaleDateString()})
          </option>
        ))}
      </select>

      <div style={{ height: 420, width: "100%" }}>
        <DataGrid
          rows={guests}
          columns={columns}
          getRowId={(row) => row.id} 
          pageSize={5}
          rowsPerPageOptions={[5]}
          autoHeight={false} 
        />
      </div>
    </div>
  );
}