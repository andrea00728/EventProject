import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useStateContext } from '../../context/ContextProvider';
import { getEventIdByEmail } from '../../services/invitationService';

const StockPage = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });
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
        console.error("Erreur récupération événement assigné :", e);
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

  const sortRows = (field) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });

    const sortedRows = [...rows].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setRows(sortedRows);
  };

  const handleOpenEditModal = (item) => {
    setEditedItem(item);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => setEditModalOpen(false);

  const handleSaveEdit = async () => {
    try {
      if (editedItem.id) {
        await axios.patch(`http://localhost:3000/menus/items/${editedItem.id}`, editedItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Article modifié avec succès.', severity: 'success' });
      } else {
        await axios.post(`http://localhost:3000/menus/items`, {
          ...editedItem,
          eventId: selectedEvent || assignedEventId,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Article ajouté avec succès.', severity: 'success' });
      }
      handleCloseEditModal();
      fetchStockData();
    } catch {
      setSnackbar({ open: true, message: `Erreur lors de ${editedItem.id ? 'la modification' : "l'ajout"}.`, severity: 'error' });
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
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition"
            title="Modifier"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
            title="Supprimer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const filteredRows = rows.filter(r =>
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (categoryFilter ? r.category === categoryFilter : true) &&
    (statusFilter ? r.status === statusFilter : true)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'), linear-gradient(to bottom right, #1a202c, #2d3748)`,
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
            Gestion du Stock
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200"
          >
            ← Retour
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
            {!assignedEventId && (
              <div className="w-full sm:w-64">
                <label htmlFor="event-select" className="block text-sm font-medium text-gray-900 mb-1">
                  Événement
                </label>
                <select
                  id="event-select"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
                >
                  <option value="">Tous les événements</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="w-full sm:w-64">
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-900 mb-1">
                Catégorie
              </label>
              <select
                id="category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
              >
                <option value="">Toutes les catégories</option>
                {[...new Set(rows.map(row => row.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label htmlFor="status-select" className="block text-sm font-medium text-gray-900 mb-1">
                Statut
              </label>
              <select
                id="status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
              >
                <option value="">Tous les statuts</option>
                <option value="CRITIQUE">Critique</option>
                <option value="FAIBLE">Faible</option>
                <option value="OK">OK</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchStockData}
              className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition duration-200"
            >
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Liste des Articles</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditedItem({ name: '', price: 0, stock: 0, category: '' });
                setEditModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition duration-200"
            >
              + Ajouter un Article
            </motion.button>
          </div>

          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full bg-white">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.field}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 transition duration-200"
                      style={{ width: col.width, minWidth: col.minWidth }}
                      onClick={() => col.field !== 'actions' && sortRows(col.field)}
                    >
                      <div className="flex items-center gap-2">
                        {col.headerName}
                        {sortConfig.field === col.field && (
                          <svg className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition duration-150">
                    {columns.map(col => (
                      <td key={col.field} className="px-4 py-3 text-sm text-gray-900 border-t border-gray-100">
                        {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-indigo-600 text-white p-4 rounded-t-2xl">
                <h2 className="text-lg font-bold">{editedItem.id ? 'Modifier Article' : 'Ajouter Article'}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editedItem.name || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Prix</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedItem.price || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editedItem.stock || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Catégorie</label>
                  <input
                    type="text"
                    value={editedItem.category || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition duration-200"
                  />
                </div>
              </div>
              <div className="p-4 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-200"
                >
                  {editedItem.id ? 'Enregistrer' : 'Ajouter'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-sm w-full"
          >
            <div className={`p-4 rounded-lg shadow-lg text-white ${
              snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {snackbar.message}
              <button
                onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
                className="ml-4 text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StockPage;