import React from "react";
import { deleteGuest } from "../services/inviteService";
import { useStateContext } from "../context/ContextProvider";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";


export default function DeleteGuestButton({ guestId, onDeleted }) {
  const { token } = useStateContext();

  const handleDelete = async () => {
    if (!token) {
      alert("Utilisateur non authentifié");
      return;
    }

    const confirm = window.confirm("Voulez-vous vraiment supprimer cet invité ?");
    if (!confirm) return;

    try {
      await deleteGuest(guestId, token);
      alert("Invité supprimé avec succès !");
      onDeleted(guestId);
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
