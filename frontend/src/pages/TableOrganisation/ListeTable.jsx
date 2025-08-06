import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
<<<<<<< HEAD
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { FiPrinter, FiTrash2, FiPlus, FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
=======
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)

export default function ListeTable() {
  const { token } = useStateContext();
  const [tables, setTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
<<<<<<< HEAD
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noSelectionModalOpen, setNoSelectionModalOpen] = useState(false);
  const [noSelectionMessage, setNoSelectionMessage] = useState("");

  // Configure Axios base URL
  axios.defaults.baseURL = `${import.meta.env.VITE_API_BASE_URL}`;
=======
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Configure Axios base URL
  axios.defaults.baseURL = "http://localhost:3000"; // Adjust to your backend URL
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)

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
<<<<<<< HEAD
=======
        console.log("Events Response:", data);
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
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
<<<<<<< HEAD
        setError(null);
=======
        setError("Veuillez sélectionner un événement valide.");
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
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

<<<<<<< HEAD
=======
        console.log("Tables Response:", response.data);
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
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

<<<<<<< HEAD

  const handlePrintSelected = () => {
    if (selectedTableIds.length === 0) {
      setNoSelectionMessage("Veuillez sélectionner au moins une table à imprimer.");
      setNoSelectionModalOpen(true);
      return;
    }

=======
  const handlePrintSelected = () => {
    if (selectedTableIds.length === 0) {
      alert("Veuillez sélectionner au moins une table.");
      return;
    }
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
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
<<<<<<< HEAD
          <strong>Table ${table.nom}</strong><br/>
          <img src="${table.qrCode}" alt="QR Code Table ${table.nom}" />
=======
          <strong>Table ${table.numero}</strong><br/>
          <img src="${table.qrCode}" alt="QR Code Table ${table.numero}" />
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
        </div>
      `);
    });
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
<<<<<<< HEAD
  
=======
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)

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

<<<<<<< HEAD
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
=======
  const handleDeleteSelected = async () => {
    if (selectedTableIds.length === 0) {
      alert("Veuillez sélectionner au moins une table à supprimer.");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer les tables sélectionnées ?")) {
      return;
    }

>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

<<<<<<< HEAD
=======
      // Send DELETE requests for each selected table
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
      await Promise.all(
        selectedTableIds.map((tableId) =>
          axios.delete(`/tables/${tableId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

<<<<<<< HEAD
=======
      // Refresh the table list after deletion
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
      const response = await axios.get(`/tables/event/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setTables(response.data);
<<<<<<< HEAD
        setSelectedTableIds([]);
=======
        setSelectedTableIds([]); // Clear selected tables
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
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
<<<<<<< HEAD
      setDeleteConfirmOpen(false);
    }
  };

=======
    }
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(false);
    setSelectedTableIds([]);
  };

>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
  const closeSuccess = () => {
    setSuccessMessage(null);
  };

<<<<<<< HEAD
=======
  // DataGrid columns configuration
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
  const columns = [
    {
      field: "select",
      headerName: "Imprimer",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={selectedTableIds.includes(params.row.id)}
          onChange={() => handleCheckboxChange(params.row.id)}
<<<<<<< HEAD
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
=======
          aria-label={`Sélectionner la table ${params.row.numero}`}
        />
      ),
    },
    { field: "numero", headerName: "Numéro", width: 150 },
    { field: "capacite", headerName: "Capacité", width: 150 },
    { field: "type", headerName: "Type", width: 150 },
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
    {
      field: "qrCode",
      headerName: "QR Code",
      width: 150,
      renderCell: (params) =>
        params.row.qrCode ? (
<<<<<<< HEAD
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
=======
          <img
            src={params.row.qrCode}
            alt={`QR Code pour la table ${params.row.numero}`}
            width="60"
            onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
          />
        ) : (
          "Pas de QR"
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
        ),
    },
  ];

  return (
<<<<<<< HEAD
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
                  <div className="flex flex-col items-start px-4 py-2 transition-all duration-300 ease-in-out  hover:bg-white rounded-lg hover:shadow-md hover:scale-[1.1] hover:border-red-500 hover:pl-3 group">
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

      <Dialog open={noSelectionModalOpen} onClose={handleCloseNoSelectionModal} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>Attention</DialogTitle>
        <DialogContent>
          <Typography>{noSelectionMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoSelectionModal} sx={{ backgroundColor: '#6b48ff', color: 'white', '&:hover': { backgroundColor: '#5a38dd' } }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deletion Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer {selectedTableIds.length} table{selectedTableIds.length > 1 ? "s" : ""} sélectionnée{selectedTableIds.length > 1 ? "s" : ""} ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} sx={{ color: '#34495e' }}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmDelete} sx={{ backgroundColor: '#e74c3c', color: 'white', '&:hover': { backgroundColor: '#c0392b' } }}>Supprimer</Button>
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
=======
    <div style={{ padding: "20px" }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Liste des Tables</h2>

      {/* Event Selection */}
      <div className="flex flex-col mb-6">
        <label className="text-gray-700 font-medium mb-2 text-sm">Événement Associé</label>
        <div
          className="flex items-center border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-600 cursor-pointer transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
        >
          <input
            type="text"
            value={
              selectedEvent
                ? `${selectedEvent.nom} (${new Date(selectedEvent.date).toLocaleDateString("fr-FR")})`
                : "Sélectionner un événement"
            }
            readOnly
            placeholder="Cliquez pour sélectionner un événement"
            className="flex-grow bg-transparent outline-none cursor-pointer text-gray-900 placeholder-gray-400"
          />
          <button
            type="button"
            className="ml-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto transform transition-all duration-300 ease-out scale-100 animate-fadeIn">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-full p-2 transition-colors duration-200 cursor-pointer"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-sans">
              Sélectionner un événement
            </h3>
            <div className="w-[100%] h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {isLoadingEvents ? (
                <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                  Chargement des événements...
                </p>
              ) : eventError ? (
                <p className="p-6 text-center text-red-500 bg-red-50 rounded-xl">
                  {eventError}
                </p>
              ) : events.length === 0 ? (
                <p className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl">
                  Aucun événement disponible.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => selectEvent(event)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && selectEvent(event)}
                    >
                      <p className="font-semibold text-lg mb-2">{event.nom}</p>
                      <p className="text-sm text-gray-200">
                        Date: {new Date(event.date).toLocaleDateString("fr-FR")}
                      </p>
                      {event.description && (
                        <p className="text-xs text-gray-300 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Display with DataGrid */}
      {loading && <p className="text-center text-gray-500">Chargement des tables...</p>}
      {error && <p className="text-red-500 text-center bg-red-50 py-3 rounded-xl">{error}</p>}
      {!loading && !error && !selectedEvent && (
        <p className="text-center text-gray-500 bg-gray-50 py-3 rounded-xl">
          Veuillez sélectionner un événement pour voir les tables.
        </p>
      )}
      {!loading && !error && selectedEvent && tables.length === 0 && (
        <p className="text-center text-gray-500 bg-gray-50 py-3 rounded-xl">
          Aucune table disponible pour cet événement.
        </p>
      )}
      {!loading && tables.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
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
                borderBottom: "1px solid #e5e7eb",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f3f4f6",
                borderBottom: "2px solid #e5e7eb",
                color: "#1f2937",
                fontWeight: "600",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9fafb",
              },
            }}
          />
          <div className="flex justify-end p-4 gap-4">
            <button
              onClick={handlePrintSelected}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
              aria-label="Imprimer les tables sélectionnées"
            >
              🖨️ Imprimer les tables cochées
            </button>
            <button
              onClick={handlePrintAll}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
              aria-label="Imprimer toutes les tables"
            >
              🖨️ Imprimer toutes les tables
            </button>
            <button
              onClick={handleDeleteSelected}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200"
              aria-label="Supprimer les tables sélectionnées"
            >
              🗑️ Supprimer les tables cochées
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700">Succès</h3>
              <button
                onClick={closeSuccess}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-900 mb-4">{successMessage}</p>
            <button
              onClick={closeSuccess}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200"
>>>>>>> 25b71f1 (code nafindra tam pass syvlvano)
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}