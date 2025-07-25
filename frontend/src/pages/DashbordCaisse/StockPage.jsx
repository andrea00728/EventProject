import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Box, Snackbar, Alert, Tooltip, Select, MenuItem,
  FormControl, InputLabel
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStateContext } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import { getEventIdByEmail } from '../../services/invitationService';

const StockPage = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [assignedEventId, setAssignedEventId] = useState(null);

  const { token } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignedEvent = async () => {
      try {
        const resp = await getEventIdByEmail(token);
        if (resp?.eventId) {
          setAssignedEventId(resp.eventId);
          setSelectedEvent(resp.eventId);
        }
      } catch (e) {
        console.error("Erreur récupération event assigné :", e);
      }
    };
    if (token) fetchAssignedEvent();
  }, [token]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Erreur de chargement des événements :', error);
    }
  };

  const fetchStockData = async () => {
    try {
      setIsLoading(true);
      const eventToUse = assignedEventId || selectedEvent;
      const url = eventToUse
        ? `http://localhost:3000/menus/event/${eventToUse}`
        : 'http://localhost:3000/menus';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stockData = res.data.flatMap(menu =>
        menu.items.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          stock: item.stock,
          category: item.category || menu.name,
          status: item.stock <= 5 ? 'CRITIQUE' : item.stock <= 10 ? 'FAIBLE' : 'OK',
          eventId: menu.eventId,
        }))
      );

      setRows(stockData);
    } catch (error) {
      console.error('Erreur de chargement :', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [assignedEventId, selectedEvent]);

  const handleOpenEditModal = (item) => {
    setEditedItem(item);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleSaveEdit = async () => {
    try {
      await axios.patch(`http://localhost:3000/menus/items/${editedItem.id}`, editedItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article modifié avec succès.', severity: 'success' });
      handleCloseEditModal();
      fetchStockData();
    } catch {
      setSnackbar({ open: true, message: 'Erreur lors de la modification.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de cet article ?')) return;
    try {
      await axios.delete(`http://localhost:3000/menus/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article supprimé.', severity: 'info' });
      fetchStockData();
    } catch {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Article', width: 200 },
    { field: 'category', headerName: 'Catégorie', width: 150 },
    { field: 'eventId', headerName: 'Événement', width: 150 },
    {
      field: 'price', headerName: 'Prix', width: 100,
      renderCell: (params) => <span>{params.row.price.toFixed(2)} €</span>,
    },
    {
      field: 'stock', headerName: 'Stock', width: 100,
      renderCell: (params) => (
        <span className={`font-medium ${
          params.row.stock <= 5 ? 'text-red-600' :
          params.row.stock <= 10 ? 'text-orange-500' : 'text-green-600'
        }`}>{params.row.stock}</span>
      ),
    },
    {
      field: 'status', headerName: 'Statut', width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          params.row.status === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
          params.row.status === 'FAIBLE' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }`}>{params.row.status}</span>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier">
            <IconButton onClick={() => handleOpenEditModal(params.row)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => handleDelete(params.row.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  const filteredRows = rows.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 sm:p-10"
      style={{
        backgroundImage: "url('/a8316371-067b-4c45-8350-8ccb83fff8de.jpg')",
      }}
    >
      <div className="bg-white/30 backdrop-blur-xl rounded-xl shadow-lg max-w-7xl mx-auto p-6 sm:p-10 relative">
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            borderColor: '#2563eb',
            color: '#2563eb',
            mb: 3,
            '&:hover': {
              bgcolor: '#2563eb',
              color: '#fff',
              borderColor: '#2563eb',
            },
          }}
        >
          ← Retour
        </Button>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Gestion du Stock</h1>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4, alignItems: 'center' }}>
          {!assignedEventId && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="event-select-label">Événement</InputLabel>
              <Select
                labelId="event-select-label"
                value={selectedEvent}
                label="Événement"
                onChange={(e) => setSelectedEvent(e.target.value)}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  boxShadow: '0 0 5px rgb(0 0 0 / 0.1)',
                }}
              >
                <MenuItem value="">Tous les événements</MenuItem>
                {events.map(ev => (
                  <MenuItem key={ev.id} value={ev.id}>{ev.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            variant="outlined"
            size="small"
            placeholder="Rechercher un article..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon color="action" /> }}
            sx={{ bgcolor: 'white', borderRadius: 1, width: 250 }}
          />

          <IconButton
            onClick={fetchStockData}
            color="primary"
            sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e0e7ff' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={isLoading}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{ border: 'none', '& .MuiDataGrid-cell': { outline: 'none' } }}
          />
        </Box>


        {/* Modal édition */}
        <Dialog open={editModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
          <DialogTitle>Modifier Article</DialogTitle>
          <DialogContent dividers>
            <TextField
              margin="normal"
              fullWidth
              label="Nom"
              value={editedItem.name || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Prix"
              type="number"
              inputProps={{ step: 0.01, min: 0 }}
              value={editedItem.price || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Stock"
              type="number"
              inputProps={{ min: 0 }}
              value={editedItem.stock || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Catégorie"
              value={editedItem.category || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Annuler</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">Enregistrer</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default StockPage;
