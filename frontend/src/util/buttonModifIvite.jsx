import React, { useState } from "react";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { updateGuest } from "../services/inviteService";
import { useStateContext } from "../context/ContextProvider";

export default function EditGuestButton({ guest, onUpdated }) {
  const { token } = useStateContext();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...guest });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateGuest(guest.id, formData, token);
      onUpdated(updated); 
      setOpen(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  return (
    <>
      <Tooltip title="Modifier">
        <IconButton size="small" color="primary" onClick={() => setOpen(true)}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Modifier l'invité</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nom"
            name="nom"
            fullWidth
            value={formData.nom}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Prénom"
            name="prenom"
            fullWidth
            value={formData.prenom}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpdate} color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
