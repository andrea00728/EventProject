import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '../../context/ContextProvider';
import { getEventIdByEmail } from '../../services/invitationService';
import {
  AlertTriangle,
  Package,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Trash,
  Edit,
  Search,
  ArrowLeft,
  X,
  Zap,
} from 'lucide-react';

// Composant pour les indicateurs (utilisant Lucide-React pour les icônes)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className="bg-white rounded-3xl shadow-xl p-6 flex items-center gap-4 border border-gray-100"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className={`p-3 rounded-full bg-${color}-100`}>
      <Icon className={`w-7 h-7 text-${color}-600`} />
    </div>
    <div>
      <p className="text-gray-500 font-medium text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
    </div>
  </motion.div>
);

// Composant Modale de confirmation
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-red-500 text-white p-6 flex items-center gap-4">
              <Zap className="h-8 w-8" />
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-base">{message}</p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors duration-200"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Confirmer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// Composant Modale de confirmation (pour la suppression)
const DeletionConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-red-500 text-white p-6 flex items-center gap-4">
              <Trash className="h-8 w-8" />
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-base">{message}</p>
            </div>
            <div className="p-6 bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors duration-200"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Supprimer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
);

// Composant pour l'interface d'édition
const EditModal = ({ isOpen, item, onSave, onCancel }) => {
  const [editedItem, setEditedItem] = useState(item);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedItem(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(editedItem);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 font-sans"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-2xl font-bold">Modifier l'Article</h2>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={editedItem.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                <input
                  type="text"
                  name="category"
                  value={editedItem.category || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (€)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  value={editedItem.price || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={editedItem.stock || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
                />
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors duration-200"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Enregistrer
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// Composant de notification temporaire (Snackbar)
const Snackbar = ({ open, message, severity, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  const bgClass = severity === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full z-50 font-sans"
        >
          <div className={`p-5 rounded-xl shadow-xl text-white flex justify-between items-center gap-4 ${bgClass}`}>
            <span className="text-base">{message}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-200"
              aria-label="Fermer la notification"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { token } = useStateContext();
  const navigate = useNavigate();

  // Calcul des indicateurs de stock
  const totalItems = rows.length;
  const criticalItems = rows.filter(item => item.status === 'CRITIQUE').length;
  const lowItems = rows.filter(item => item.status === 'FAIBLE').length;
  const okItems = totalItems - criticalItems - lowItems;

  const fetchAssignedEvent = useCallback(async () => {
    try {
      const resp = await getEventIdByEmail(token);
      if (resp?.eventId) {
        setAssignedEventId(resp.eventId);
        setSelectedEvent(resp.eventId);
      }
    } catch (e) {
      console.error("Erreur récupération événement assigné :", e);
    }
  }, [token]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Erreur de chargement des événements :', error);
    }
  }, [token]);

  const fetchStockData = useCallback(async () => {
    try {
      setIsLoading(true);
      const eventToUse = assignedEventId || selectedEvent;
      const url = eventToUse
        ? `${import.meta.env.VITE_API_BASE_URL}/menus/event/${eventToUse}`
        : `${import.meta.env.VITE_API_BASE_URL}/menus`;
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
  }, [token, assignedEventId, selectedEvent]);

  useEffect(() => {
    fetchEvents();
    if (token) fetchAssignedEvent();
  }, [fetchEvents, fetchAssignedEvent, token]);

  useEffect(() => {
    fetchStockData();
  }, [assignedEventId, selectedEvent, fetchStockData]);

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

  // Sauvegarde des modifications
  const handleSaveEdit = async (updatedItem) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/menus/items/${updatedItem.id}`, updatedItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article modifié avec succès.', severity: 'success' });
      handleCloseEditModal();
      fetchStockData();
    } catch {
      setSnackbar({ open: true, message: `Erreur lors de la modification.`, severity: 'error' });
    }
  };

  // Gestion de l'ouverture de la modale de suppression
  const handleOpenDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Suppression d'un article
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/menus/items/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Article supprimé.', severity: 'success' });
      fetchStockData();
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression.', severity: 'error' });
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
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
      renderCell: ({ row }) => <span className="text-base text-gray-700">{row.price.toFixed(2)} €</span>,
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
            whileHover={{ scale: 1.1, backgroundColor: '#e0e7ff' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleOpenEditModal(row)}
            className="p-2 bg-indigo-100 text-indigo-600 rounded-full transition-all duration-200"
            aria-label="Modifier l'article"
          >
            <Edit className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleOpenDeleteModal(row)}
            className="p-2 bg-red-100 text-red-600 rounded-full transition-all duration-200"
            aria-label="Supprimer l'article"
          >
            <Trash className="h-5 w-5" />
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-100 flex flex-col p-6 sm:p-8 font-sans antialiased"
    >
      <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col space-y-8 w-full">
        <div className="flex justify-between items-center pb-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Gestion du Stock
          </h1>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg flex items-center gap-2 text-base font-semibold"
            aria-label="Retour à la page précédente"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </motion.button>
        </div>

        {/* Cartes d'indicateurs de stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Articles OK" value={okItems} icon={CheckCircle} color="green" />
          <StatCard title="Stock Faible" value={lowItems} icon={Package} color="orange" />
          <StatCard title="Articles Critiques" value={criticalItems} icon={AlertTriangle} color="red" />
        </div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 flex flex-col sm:flex-row gap-4 items-center border border-gray-100"
        >
          {!assignedEventId && (
            <div className="w-full sm:w-1/4">
              <label htmlFor="event-select" className="block text-base font-medium text-gray-900 mb-2">
                Événement
              </label>
              <select
                id="event-select"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base transition-colors duration-200"
            >
              <option value="">Tous les statuts</option>
              <option value="CRITIQUE">Critique</option>
              <option value="FAIBLE">Faible</option>
              <option value="OK">OK</option>
            </select>
          </div>
          <div className="relative w-full sm:w-1/4">
            <label htmlFor="search-input" className="block text-base font-medium text-gray-900 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="Nom ou catégorie..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-base placeholder-gray-400 transition-colors duration-200"
              />
              <Search className="w-6 h-6 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>
        </motion.div>

        {/* Tableau des articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900">Liste des Articles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
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
                          sortConfig.direction === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
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
                      <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRows.length > 0 ? filteredRows.map(row => (
                  <motion.tr
                    key={row.id}
                    className="hover:bg-indigo-50 transition duration-150 border-t border-gray-100"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {columns.map(col => (
                      <td key={col.field} className="px-6 py-4 text-base text-gray-900">
                        {col.renderCell ? col.renderCell({ row }) : row[col.field]}
                      </td>
                    ))}
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                      Aucun article ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <EditModal
          isOpen={editModalOpen}
          item={editedItem}
          onSave={handleSaveEdit}
          onCancel={handleCloseEditModal}
        />

        <DeletionConfirmationModal
          isOpen={deleteModalOpen}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer l'article "${itemToDelete?.name}" ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
        />

        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        />
      </div>
    </motion.div>
  );
};

export default StockPage;