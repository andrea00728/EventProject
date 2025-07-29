import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getEventIdByEmail } from '../../services/invitationService';
import { motion } from 'framer-motion';

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
    if (!confirm('Confirmer la suppression de cet article ?')) return;
    try {
      await axios.delete(`http://localhost:3000/menus/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article supprimé.', severity: 'success' });
      fetchStockData();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Article', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Catégorie', width: 150 },
    { field: 'eventId', headerName: 'Événement', width: 150 },
    {
      field: 'price',
      headerName: 'Prix',
      width: 100,
      renderCell: ({ row }) => <span>{row.price.toFixed(2)} €</span>,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      renderCell: ({ row }) => (
        <span className={`font-semibold ${
          row.stock <= 5 ? 'text-red-600' :
          row.stock <= 10 ? 'text-orange-500' : 'text-green-600'
        }`}>{row.stock}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 120,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
          row.status === 'FAIBLE' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }`}>{row.status}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Modifier">
            <IconButton onClick={() => handleOpenEditModal(row)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton onClick={() => handleDelete(row.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const filteredRows = rows.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1588286840104-895915465d90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        backgroundColor: '#f3f4f6',
      }}
    >
      <div className="container mx-auto p-6 sm:p-8 max-w-7xl flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-md">
            Gestion du Stock
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            ← Retour
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
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
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#4f46e5' },
                      '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                    },
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
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                width: { xs: '100%', sm: 250 },
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#4f46e5' },
                  '&.Mui-focused fieldset': { borderColor: '#4f46e5' },
                },
              }}
            />

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <IconButton
                onClick={fetchStockData}
                color="primary"
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: '#e0e7ff' },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <RefreshIcon />
              </IconButton>
            </motion.div>
          </div>

          <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', maxHeight: '60vh', overflowY: 'auto' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[10, 20, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': { outline: 'none' },
                '& .MuiDataGrid-columnHeaders': { bgcolor: '#f3f4f6', fontWeight: 'bold' },
                '& .MuiDataGrid-row:hover': { bgcolor: '#f9fafb' },
              }}
            />
          </Box>
        </motion.div>

        {/* Modal édition */}
        <Dialog
          open={editModalOpen}
          onClose={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
          PaperComponent={motion.div}
          PaperProps={{
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.3 },
          }}
        >
          <DialogTitle sx={{ bgcolor: '#4f46e5', color: 'white', fontWeight: 'bold' }}>
            Modifier Article
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: '#f9fafb' }}>
            <TextField
              margin="normal"
              fullWidth
              label="Nom"
              value={editedItem.name || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Prix"
              type="number"
              inputProps={{ step: 0.01, min: 0 }}
              value={editedItem.price || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Stock"
              type="number"
              inputProps={{ min: 0 }}
              value={editedItem.stock || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
              sx={{ bgcolor: 'white' }}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Catégorie"
              value={editedItem.category || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
              sx={{ bgcolor: 'white' }}
            />
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#f9fafb' }}>
            <Button
              onClick={handleCloseEditModal}
              sx={{ color: '#6b7280', '&:hover': { bgcolor: '#f3f4f6' } }}
            >
              Annuler
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                sx={{
                  bgcolor: '#4f46e5',
                  '&:hover': { bgcolor: '#4338ca' },
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Enregistrer
              </Button>
            </motion.div>
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
            sx={{ width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </motion.div>
  );
};

export default StockPage;