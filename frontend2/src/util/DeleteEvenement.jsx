import React from "react";
import { useStateContext } from "../context/ContextProvider";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteEvent } from "../services/evenementServ";


export default function DeleteEventButton({ eventId, onDeleted }) {
  const { token } = useStateContext();
  const handleDelete = async () => {
    if (!token) {
      alert("Utilisateur non authentifié");
      return;
    }
    if (!eventId) {
      alert("Aucun événement sélectionné !");
      return;
    }
    const confirm = window.confirm("Voulez-vous vraiment supprimer cet evenement ?");
    if (!confirm) return;

    try {
      await DeleteEvent(eventId, token);
      alert("Événement supprimé avec succès !");
      onDeleted(eventId); 
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    }
  };

  return (
   <Tooltip title="Supprimer">
      <IconButton
        color="error"
        size="small"
        onClick={handleDelete}
        aria-label="supprimer"
      >
        <DeleteIcon />
      </IconButton>
    </Tooltip>
  );
}
