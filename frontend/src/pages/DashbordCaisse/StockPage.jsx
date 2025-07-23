import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField, Button, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Box, Snackbar, Alert, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useStateContext } from '../../context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const StockPage = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedItem, setEditedItem] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { token } = useStateContext();
  const navigate = useNavigate();  

  const fetchStockData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:3000/menus', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stockData = res.data.flatMap(menu =>
        menu.items.map(item => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          stock: item.stock,
          category: item.category || menu.name,
          status: item.stock <= 5 ? 'CRITIQUE' : item.stock <= 10 ? 'FAIBLE' : 'OK'
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
    fetchStockData();
  }, []);

  const handleOpenEditModal = (item) => {
    setEditedItem(item);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.patch(`http://localhost:3000/menus/items/${editedItem.id}`, editedItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article modifié avec succès.', severity: 'success' });
      handleCloseEditModal();
      fetchStockData();
    } catch (err) {
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
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  const columns = [
    { field: 'name', headerName: 'Article', width: 200 },
    { field: 'category', headerName: 'Catégorie', width: 150 },
    {
      field: 'price', headerName: 'Prix', width: 100,
      renderCell: (params) => <span>{params.row.price.toFixed(2)} €</span>
    },
    {
      field: 'stock', headerName: 'Stock', width: 100,
      renderCell: (params) => (
        <span className={`font-medium ${
          params.row.stock <= 5 ? 'text-red-600' :
          params.row.stock <= 10 ? 'text-orange-500' : 'text-green-600'
        }`}>
          {params.row.stock}
        </span>
      )
    },
    {
      field: 'status', headerName: 'Statut', width: 120,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          params.row.status === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
          params.row.status === 'FAIBLE' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }`}>
          {params.row.status}
        </span>
      )
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
    }
  ];

  const filteredRows = rows.filter(row =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outlined" onClick={() => navigate(-1)}>
              ← Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion du Stock</h1>
              <p className="text-gray-600">{filteredRows.length} articles trouvés</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
            />
            <IconButton onClick={fetchStockData} color="primary">
              <RefreshIcon />
            </IconButton>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={isLoading}
            autoHeight
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
            className="border-none"
          />
        </div>
      </div>

      {/* MODAL DE MODIFICATION */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold', color: '#333' }}>Modifier l'article</DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            sx={{
              display: 'grid',
              gap: 2,
              mt: 1,
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            }}
          >
            <TextField
              label="Nom"
              value={editedItem.name || ''}
              onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Catégorie"
              value={editedItem.category || ''}
              onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Prix (€)"
              type="number"
              value={editedItem.price || ''}
              onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Stock"
              type="number"
              value={editedItem.stock || ''}
              onChange={(e) => setEditedItem({ ...editedItem, stock: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditModal} color="inherit" variant="outlined">Annuler</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default StockPage;
