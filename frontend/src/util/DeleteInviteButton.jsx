import React, { useState } from "react";
import { deleteGuest } from "../services/inviteService";
import { useStateContext } from "../context/ContextProvider";
import { IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DeleteGuestButton({ guestId, onDeleted }) {
  const { isAuthenticated } = useStateContext();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    if (!isAuthenticated) {
      alert("Utilisateur non authentifié");
      return;
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteGuest(guestId);
      alert("Invité supprimé avec succès !");
      onDeleted(guestId);
    } catch (error) {
      alert("Erreur lors de la suppression");
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      <Tooltip title="Supprimer">
        <IconButton
          color="error"
          size="small"
          onClick={handleOpen}
          aria-label="supprimer"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmer la suppression"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Voulez-vous vraiment supprimer cet invité ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}