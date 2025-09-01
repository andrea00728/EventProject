import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DeleteEvent } from "../services/evenementServ";
import { toast } from "react-toastify";

export default function DeleteEventButton({ eventId, onDeleted }) {
  const { isAuthenticated } = useStateContext();
  const [open, setOpen] = useState(false);

  const handleDeleteClick = () => {
    if (!isAuthenticated) {
      toast.warning("Utilisateur non authentifié !");
      return;
    }
    if (!eventId) {
      toast.error("Aucun événement sélectionné !");
      return;
    }
    setOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await DeleteEvent(eventId);
      toast.success("Événement supprimé avec succès ");
      onDeleted(eventId);
    } catch (error) {
      toast.error("Erreur lors de la suppression ");
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleCancel = () => setOpen(false);

  return (
    <>
      <Tooltip title="Supprimer">
        <IconButton
          color="error"
          size="small"
          onClick={handleDeleteClick}
          aria-label="supprimer"
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer cet événement ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
