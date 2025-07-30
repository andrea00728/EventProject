import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { FiPrinter, FiTrash2, FiPlus, FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";

export default function ListeTable() {
  const { token } = useStateContext();
  const [tables, setTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noSelectionModalOpen, setNoSelectionModalOpen] = useState(false);
  const [noSelectionMessage, setNoSelectionMessage] = useState("");

  // Configure Axios base URL
  axios.defaults.baseURL = "http://localhost:3000";

  // Fetch events when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) {
        setEventError("Veuillez vous connecter pour voir vos événements.");
        setIsLoadingEvents(false);
        return;
      }
      setIsLoadingEvents(true);
      try {
        const data = await getMyEvents(token);
        if (Array.isArray(data)) {
          setEvents(data);
          setEventError(null);
        } else {
          setEvents([]);
          setEventError("Les événements reçus ne sont pas au format attendu.");
        }
      } catch (err) {
        setEventError(
          err.response?.data?.message || "Impossible de charger les événements."
        );
        console.error("Erreur chargement événements:", err);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [token]);

  // Fetch tables when an event is selected
  useEffect(() => {
    const fetchTables = async () => {
      if (!selectedEvent || !selectedEvent.id) {
        setTables([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/tables/event/${selectedEvent.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setTables(response.data);
          setError(null);
        } else {
          console.error("API response is not an array:", response.data);
          setTables([]);
          setError("Les données reçues ne sont pas au format attendu.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tables:", error.response?.data || error);
        if (error.response?.status === 401) {
          setError("Non autorisé. Veuillez vérifier votre connexion.");
        } else if (error.response?.status === 404) {
          setError("Événement non trouvé ou aucune table disponible.");
        } else {
          setError("Impossible de charger les tables. Veuillez réessayer.");
        }
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectedEvent, token]);

  const handleCheckboxChange = (id) => {
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedTableIds.length === 0) {
      setNoSelectionMessage("Veuillez sélectionner au moins une table à imprimer.");
      setNoSelectionModalOpen(true);
      return;
    }
  
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; }
        .table-container { margin-bottom: 20px; text-align: center; }
        img { max-width: 200px; }
      </style>
    `);
    const selected = tables.filter((table) => selectedTableIds.includes(table.id));
    selected.forEach((table) => {
      printWindow.document.write(`
        <div class="table-container">
          <strong>Table ${table.nom}</strong><br/>
          <img src="${table.qrCode}" alt="QR Code Table ${table.nom}" />
        </div>
      `);
    });
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handlePrintAll = () => {
    if (tables.length === 0) {
      alert("Aucune table à imprimer.");
      return;
    }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <style>
        body { font-family: Arial, sans-serif; }
        .table-container { margin-bottom: 20px; text-align: center; }
        img { max-width: 200px; }
      </style>
    `);
    tables.forEach((table) => {
      printWindow.document.write(`
        <div class="table-container">
          <strong>Table ${table.numero}</strong><br/>
          <img src="${table.qrCode}" alt="QR Code Table ${table.numero}" />
        </div>
      `);
    });
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleOpenDeleteConfirm = () => {
    if (selectedTableIds.length === 0) {
      setNoSelectionMessage("Veuillez sélectionner au moins une table à supprimer.");
      setNoSelectionModalOpen(true);
      return;
    }
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
  };

  const handleCloseNoSelectionModal = () => {
    setNoSelectionModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      await Promise.all(
        selectedTableIds.map((tableId) =>
          axios.delete(`/tables/${tableId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      const response = await axios.get(`/tables/event/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setTables(response.data);
        setSelectedTableIds([]);
        setSuccessMessage("Tables supprimées avec succès.");
      } else {
        console.error("API response is not an array:", response.data);
        setTables([]);
        setError("Les données reçues ne sont pas au format attendu.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des tables:", error.response?.data || error);
      if (error.response?.status === 401) {
        setError("Non autorisé. Veuillez vérifier votre connexion.");
      } else if (error.response?.status === 404) {
        setError("Une ou plusieurs tables n'ont pas été trouvées.");
      } else {
        setError("Erreur lors de la suppression des tables. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const closeSuccess = () => {
    setSuccessMessage(null);
  };

  const columns = [
    {
      field: "select",
      headerName: "Imprimer",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={selectedTableIds.includes(params.row.id)}
          onChange={() => handleCheckboxChange(params.row.id)}
          aria-label={`Sélectionner la table ${params.row.nom}`}
          sx={{
            color: '#6b48ff',
            '&.Mui-checked': {
              color: '#6b48ff',
            },
          }}
        />
      ),
    },
    { 
      field: "nom", 
      headerName: "Nom", 
      width: 150,
      cellClassName: 'font-medium text-gray-800'
    },
    { 
      field: "capacite", 
      headerName: "Capacité", 
      width: 150,
      renderCell: (params) => (
        <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-xs font-medium">
          {params.row.capacite} personnes
        </span>
      )
    },
    { 
      field: "type", 
      headerName: "Type", 
      width: 150,
      renderCell: (params) => (
        <span className="capitalize">{params.row.type}</span>
      )
    },
    {
      field: "qrCode",
      headerName: "QR Code",
      width: 150,
      renderCell: (params) =>
        params.row.qrCode ? (
          <div className="relative group flex items-center justify-center">
            <img
              src={params.row.qrCode}
              alt={`QR Code pour la table ${params.row.nom}`}
              className="w-16 h-16 object-contain rounded-md border border-gray-200 group-hover:border-indigo-300 transition-colors"
              onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
            />
          </div>
        ) : (
          <span className="text-gray-400 italic">Pas de QR</span>
        ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Gestion des Tables</h2>
        <p className="text-indigo-100">Visualisez et gérez les tables de vos événements</p>
      </div> */}

      {/* Event Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-6 bg-indigo-600 rounded-full mr-3"></span>
          Sélectionnez un événement
        </h3>
        
        {isLoadingEvents ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : eventError ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <FiAlertTriangle className="text-red-500 mr-2" />
              <p className="text-red-700">{eventError}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-700">Aucun événement trouvé. Créez un événement d'abord.</p>
          </div>
        ) : (
          <Tabs
            value={selectedEvent ? events.findIndex(event => event.id === selectedEvent.id) : false}
            onChange={(e, newValue) => setSelectedEvent(events[newValue])}
            variant="scrollable"
            scrollButtons="auto"
            className="mb-6"
            TabIndicatorProps={{ style: { backgroundColor: '#6b48ff', height: '3px' } }}
          >
            {events.map((event) => (
              <Tab
                key={event.id}
                label={
                  <div className="flex flex-col items-start px-4 py-2">
                    <span className={`text-sm font-medium ${selectedEvent?.id === event.id ? 'text-indigo-600' : 'text-gray-600'}`}>
                      {event.nom}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  </div>
                }
                sx={{
                  minWidth: 'auto',
                  padding: 0,
                  textTransform: 'none',
                  '&.Mui-selected': { backgroundColor: 'transparent' },
                }}
              />
            ))}
          </Tabs>
        )}
      </div>

      {/* Table Display */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 rounded">
            <div className="flex items-center">
              <FiAlertTriangle className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && !selectedEvent && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun événement sélectionné</h3>
            <p className="text-gray-500">Veuillez sélectionner un événement pour voir les tables associées</p>
          </div>
        )}
        
        {!loading && !error && selectedEvent && tables.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune table disponible</h3>
            <p className="text-gray-500 mb-4">Cet événement ne contient aucune table pour le moment</p>
            <Link
              to="/evenement/tables/creationTable"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Créer une table
            </Link>
          </div>
        )}
        
        {!loading && tables.length > 0 && (
          <>
            {/* Table Actions */}
            <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center mb-2 sm:mb-0">
                <Checkbox
                  checked={selectedTableIds.length === tables.length}
                  indeterminate={selectedTableIds.length > 0 && selectedTableIds.length < tables.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTableIds(tables.map((table) => table.id));
                    } else {
                      setSelectedTableIds([]);
                    }
                  }}
                  sx={{
                    color: '#6b48ff',
                    '&.Mui-checked': {
                      color: '#6b48ff',
                    },
                  }}
                />
                <span className="text-sm text-gray-700">
                  {selectedTableIds.length > 0 
                    ? `${selectedTableIds.length} table${selectedTableIds.length > 1 ? 's' : ''} sélectionnée${selectedTableIds.length > 1 ? 's' : ''}`
                    : 'Tout sélectionner'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/evenement/tables/creationTable"
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Nouvelle table
                </Link>
                
                <button
                  onClick={handlePrintSelected}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={selectedTableIds.length === 0}
                >
                  <FiPrinter className="mr-2" />
                  Imprimer sélection
                </button>
                
                <button
                  onClick={handleOpenDeleteConfirm}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={selectedTableIds.length === 0}
                >
                  <FiTrash2 className="mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
            
            {/* DataGrid */}
            <div className="p-4">
              <DataGrid
                rows={tables}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                checkboxSelection={false}
                disableSelectionOnClick
                getRowId={(row) => row.id}
                autoHeight
                sx={{
                  "& .MuiDataGrid-root": {
                    border: "none",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid #f0f0f0",
                    // padding: '12px',
                    // margin: '1vw .2vw',
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: '#f8f9fa',
                    borderBottom: "2px solid #e0e0e0",
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                  },
                  "& .MuiDataGrid-row": {
                    backgroundColor: '#fff',
                    '&:hover': {
                      backgroundColor: '#f9fafb',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#f0f4ff',
                      '&:hover': {
                        backgroundColor: '#e6edff',
                      },
                    },
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #e0e0e0',
                  },
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* No Selection Modal */}
      <Dialog 
        open={noSelectionModalOpen} 
        onClose={handleCloseNoSelectionModal} 
        PaperProps={{ 
          sx: { 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          } 
        }}
      >
        <DialogTitle className="flex items-center">
          <FiAlertTriangle className="text-yellow-500 mr-2" />
          <span>Action requise</span>
        </DialogTitle>
        <DialogContent>
          <Typography className="text-gray-700">{noSelectionMessage}</Typography>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button 
            onClick={handleCloseNoSelectionModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            startIcon={<FiCheck />}
          >
            Compris
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deletion Confirmation Modal */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={handleCloseDeleteConfirm} 
        PaperProps={{ 
          sx: { 
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%'
          } 
        }}
      >
        <DialogTitle className="flex items-center">
          <FiAlertTriangle className="text-red-500 mr-2" />
          <span>Confirmation de suppression</span>
        </DialogTitle>
        <DialogContent>
          <Typography className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer {selectedTableIds.length} table{selectedTableIds.length > 1 ? "s" : ""} sélectionnée{selectedTableIds.length > 1 ? "s" : ""} ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions className="px-6 py-4 border-t border-gray-200">
          <Button 
            onClick={handleCloseDeleteConfirm}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors mr-2"
            startIcon={<FiX />}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            startIcon={<FiTrash2 />}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full animate-fadeInUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Succès</h3>
              </div>
              <button
                onClick={closeSuccess}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6 pl-13">{successMessage}</p>
            <button
              onClick={closeSuccess}
              className="w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}