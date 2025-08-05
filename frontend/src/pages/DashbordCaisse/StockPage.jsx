{/* Importation des dépendances nécessaires */}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useStateContext } from '../../context/ContextProvider';
import { getEventIdByEmail } from '../../services/invitationService';

// Composant principal pour la gestion du stock
const StockPage = () => {
  // Déclaration des états
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

  // Récupération de l'événement assigné pour l'utilisateur
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

  // Récupération des événements disponibles
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://api.mastertable.site/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Erreur de chargement des événements :', error);
    }
  };

  // Récupération des données de stock
  const fetchStockData = async () => {
    try {
      setIsLoading(true);
      const eventToUse = assignedEventId || selectedEvent;
      const url = eventToUse
        ? `http://api.mastertable.site/menus/event/${eventToUse}`
        : 'http://api.mastertable.site/menus';
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

  // Chargement initial des événements
  useEffect(() => {
    fetchEvents();
  }, []);

  // Chargement des données de stock lorsque l'événement change
  useEffect(() => {
    fetchStockData();
  }, [assignedEventId, selectedEvent]);

  // Tri des lignes du tableau
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

  // Gestion de l'ouverture de la modale d'édition
  const handleOpenEditModal = (item) => {
    setEditedItem(item);
    setEditModalOpen(true);
  };

  // Fermeture de la modale d'édition
  const handleCloseEditModal = () => setEditModalOpen(false);

  // Sauvegarde des modifications ou ajout d'un nouvel article
  const handleSaveEdit = async () => {
    try {
      if (editedItem.id) {
        await axios.patch(`http://api.mastertable.site/menus/items/${editedItem.id}`, editedItem, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbar({ open: true, message: 'Article modifié avec succès.', severity: 'success' });
      } else {
        await axios.post(`http://api.mastertable.site/menus/items`, {
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

  // Suppression d'un article
  const handleDelete = async (id) => {
    if (!confirm('Confirmer la suppression de cet article ?')) return;
    try {
      await axios.delete(`http://api.mastertable.site/menus/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article supprimé.', severity: 'success' });
      fetchStockData();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression.', severity: 'error' });
    }
  };

  // Définition des colonnes pour le tableau
  const columns = [
    { field: 'name', headerName: 'Article', flex: 1, minWidth: 250 },
    { field: 'category', headerName: 'Catégorie', width: 180 },
    { field: 'eventId', headerName: 'Événement', width: 180 },
    {
      field: 'price',
      headerName: 'Prix',
      width: 120,
      renderCell: ({ row }) => <span className="text-base">{row.price.toFixed(2)} €</span>,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 120,
      renderCell: ({ row }) => (
        <span className={`text-base font-semibold ${
          row.stock <= 5 ? 'text-red-600' :
          row.stock <= 10 ? 'text-orange-500' : 'text-green-600'
        }`}>{row.stock}</span>
      ),
    },
    {
      field: 'status',
      headerName: 'Statut',
      width: 140,
      renderCell: ({ row }) => (
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
          row.status === 'CRITIQUE' ? 'bg-red-100 text-red-800' :
          row.status === 'FAIBLE' ? 'bg-orange-100 text-orange-800' :
          'bg-green-100 text-green-800'
        }`}>{row.status}</span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      renderCell: ({ row }) => (
        <div className="flex gap-3 items-center">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenEditModal(row)}
            className="p-2.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-all duration-200 shadow-sm"
            aria-label="Modifier l'article"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(row.id)}
            className="p-2.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-200 shadow-sm"
            aria-label="Supprimer l'article"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </motion.button>
        </div>
      ),
    },
  ];

  // Filtrage des lignes selon la recherche et les filtres
  const filteredRows = rows.filter(r =>
    (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (categoryFilter ? r.category === categoryFilter : true) &&
    (statusFilter ? r.status === statusFilter : true)
  );

  // Rendu de l'interface utilisateur
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col p-6 sm:p-8"
    >
      {/* Conteneur principal */}
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-8">
        {/* En-tête avec titre et bouton de retour */}
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Gestion du Stock
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-all duration-200 shadow-sm flex items-center gap-2 text-base font-semibold"
            aria-label="Retour à la page précédente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </motion.button>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-3xl shadow-xl p-6 flex flex-col sm:flex-row gap-4 items-center">
          {!assignedEventId && (
            <div className="w-full sm:w-1/4">
              <label htmlFor="event-select" className="block text-base font-medium text-gray-900 mb-2">
                Événement
              </label>
              <select
                id="event-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
              >
                <option value="">Tous les événements</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="w-full sm:w-1/4">
            <label htmlFor="category-select" className="block text-base font-medium text-gray-900 mb-2">
              Catégorie
            </label>
            <select
              id="category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
            >
              <option value="">Toutes les catégories</option>
              {[...new Set(rows.map(row => row.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-1/4">
            <label htmlFor="status-select" className="block text-base font-medium text-gray-900 mb-2">
              Statut
            </label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
            >
              <option value="">Tous les statuts</option>
              <option value="CRITIQUE">Critique</option>
              <option value="FAIBLE">Faible</option>
              <option value="OK">OK</option>
            </select>
          </div>
          <div className="relative w-full sm:w-1/4">
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base placeholder-gray-400 transition-colors duration-200"
            />
            <svg className="w-6 h-6 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStockData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm text-base font-semibold flex items-center gap-2"
            aria-label="Actualiser les données"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H4m4 11H3v-5h.582m15.356-2A8.001 8.001 0 013.582 15H3" />
            </svg>
            Actualiser
          </motion.button>
        </div>

        {/* Tableau des articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Liste des Articles</h2>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditedItem({ name: '', price: 0, stock: 0, category: '' });
                setEditModalOpen(true);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-sm text-base font-semibold flex items-center gap-2"
              aria-label="Ajouter un nouvel article"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un Article
            </motion.button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.field}
                      className="px-6 py-4 text-left text-base font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 transition duration-200"
                      style={{ width: col.width, minWidth: col.minWidth }}
                      onClick={() => col.field !== 'actions' && sortRows(col.field)}
                    >
                      <div className="flex items-center gap-2">
                        {col.headerName}
                        {sortConfig.field === col.field && (
                          <svg className={`w-5 h-5 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <td colSpan={columns.length} className="text-center py-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition duration-150">
                    {columns.map(col => (
                      <td key={col.field} className="px-6 py-4 text-base text-gray-900 border-t border-gray-100">
                        {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modale d'édition ou d'ajout */}
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
              <div className="bg-indigo-600 text-white p-6 rounded-t-3xl">
                <h2 className="text-xl font-bold">{editedItem.id ? 'Modifier Article' : 'Ajouter Article'}</h2>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Nom</label>
                  <input
                    type="text"
                    value={editedItem.name || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedItem.price || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editedItem.stock || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-900 mb-2">Catégorie</label>
                  <input
                    type="text"
                    value={editedItem.category || ''}
                    onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                  />
                </div>
              </div>
              <div className="p-6 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseEditModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-sm text-base font-semibold flex items-center gap-2"
                  aria-label="Annuler l'édition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEdit}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-sm text-base font-semibold flex items-center gap-2"
                  aria-label={editedItem.id ? "Enregistrer les modifications" : "Ajouter l'article"}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {editedItem.id ? 'Enregistrer' : 'Ajouter'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Snackbar */}
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full"
          >
            <div className={`p-5 rounded-xl shadow-xl text-white flex justify-between items-center ${
              snackbar.severity === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}>
              <span className="text-base">{snackbar.message}</span>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSnackbar(prev => ({ ...prev, open: false }))}
                className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200 shadow-sm"
                aria-label="Fermer la notification"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default StockPage;