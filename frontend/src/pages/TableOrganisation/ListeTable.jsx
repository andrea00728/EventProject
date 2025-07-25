import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";
import { Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

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

  // Configure Axios base URL
  axios.defaults.baseURL = "http://localhost:3000"; // Adjust to your backend URL

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
        console.log("Events Response:", data);
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

        console.log("Tables Response:", response.data);
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
      alert("Veuillez sélectionner au moins une table.");
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
          <strong>Table ${table.numero}</strong><br/>
          <img src="${table.qrCode}" alt="QR Code Table ${table.numero}" />
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

      // Send DELETE requests for each selected table
      await Promise.all(
        selectedTableIds.map((tableId) =>
          axios.delete(`/tables/${tableId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        )
      );

      // Refresh the table list after deletion
      const response = await axios.get(`/tables/event/${selectedEvent.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(response.data)) {
        setTables(response.data);
        setSelectedTableIds([]); // Clear selected tables
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

  // DataGrid columns configuration
  const columns = [
    {
      field: "select",
      headerName: "Imprimer",
      width: 100,
      renderCell: (params) => (
        <Checkbox
          checked={selectedTableIds.includes(params.row.id)}
          onChange={() => handleCheckboxChange(params.row.id)}
          aria-label={`Sélectionner la table ${params.row.numero}`}
          sx={{
            color: '#6b48ff',
            '&.Mui-checked': {
              color: '#6b48ff',
            },
          }}
        />
      ),
    },
    { field: "numero", headerName: "Numéro", width: 150 },
    { field: "capacite", headerName: "Capacité", width: 150 },
    { field: "type", headerName: "Type", width: 150 },
    {
      field: "qrCode",
      headerName: "QR Code",
      width: 150,
      renderCell: (params) =>
        params.row.qrCode ? (
          <img
            src={params.row.qrCode}
            alt={`QR Code pour la table ${params.row.numero}`}
            className="w-16 h-16 object-contain rounded-md"
            onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
          />
        ) : (
          <span className="text-gray-500">Pas de QR</span>
        ),
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">Liste des Tables</h2>

      {/* Event Selection */}
      <div className="flex flex-col mb-6">
        <h2 className="text-sm font-medium text-gray-600 mb-2">Sélectionner un événement</h2>
        {isLoadingEvents ? (
          <p className="text-gray-600">Chargement des événements...</p>
        ) : eventError ? (
          <p className="text-red-500">{eventError}</p>
        ) : events.length === 0 ? (
          <p className="text-gray-600">Aucun événement trouvé. Créez un événement d’abord.</p>
        ) : (
          <Tabs
            value={selectedEvent ? events.findIndex(event => event.id === selectedEvent.id) : false}
            onChange={(e, newValue) => setSelectedEvent(events[newValue])}
            variant="scrollable"
            className="mb-6 border-b border-gray-200"
            TabIndicatorProps={{ style: { backgroundColor: '#6b48ff' } }}
          >
            {events.map((event) => (
              <Tab
                key={event.id}
                label={event.nom}
                className={`text-sm font-medium ${selectedEvent?.id === event.id ? 'text-purple-600' : 'text-gray-600 hover:text-gray-800'}`}
                sx={{
                  minWidth: 'auto',
                  padding: '8px 16px',
                  '&.Mui-selected': { backgroundColor: '#f0f0ff', borderRadius: '4px 4px 0 0' },
                  '&:hover': { backgroundColor: '#e0e0ff' },
                }}
              />
            ))}
          </Tabs>
        )}
      </div>

      {/* Table Display with DataGrid */}
      {loading && <p className="text-center text-gray-600 bg-gray-50 py-3 rounded-xl">Chargement des tables...</p>}
      {error && <p className="text-red-500 text-center bg-red-50 py-3 rounded-xl">{error}</p>}
      {!loading && !error && !selectedEvent && (
        <p className="text-center text-gray-600 bg-gray-50 py-3 rounded-xl">
          Veuillez sélectionner un événement pour voir les tables.
        </p>
      )}
      {!loading && !error && selectedEvent && tables.length === 0 && (
        <p className="text-center text-gray-600 bg-gray-50 py-3 rounded-xl">
          Aucune table disponible pour cet événement.
        </p>
      )}
      {!loading && tables.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          {/* Checkbox Tout Sélectionner */}
          <div className="flex items-center mb-4">
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
            <span className="text-sm text-gray-700">Tout sélectionner</span>
          </div>
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
                borderRadius: '8px',
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e5e7eb",
                padding: '12px',
                color: '#1f2937',
                fontSize: '0.875rem',
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: '#f0f0ff',
                borderBottom: "2px solid #6b48ff",
                color: '#6b48ff',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderRadius: '8px 8px 0 0',
              },
              "& .MuiDataGrid-row": {
                backgroundColor: '#fff',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                  transition: 'background-color 0.2s ease-in-out',
                },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: '600',
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: '#f0f0ff',
                borderTop: '1px solid #e5e7eb',
                borderRadius: '0 0 8px 8px',
              },
            }}
          />
          <div className="flex justify-end gap-4 mt-4">
            <Link
              to="/evenement/tables/creationTable"
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200"
              aria-label="Ajouter une nouvelle table"
            >
              ➕ Nouveau
            </Link>
            <button
              onClick={handlePrintSelected}
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer"
              aria-label="Imprimer toutes les tables"
            >
              🖨️ Imprimer
            </button>
            <button
              onClick={handleOpenDeleteConfirm}
              className="py-2 px-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 cursor-pointer"
              aria-label="Supprimer les tables sélectionnées"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}

      {/* No Selection Modal */}
      <Dialog open={noSelectionModalOpen} onClose={handleCloseNoSelectionModal} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle>Attention</DialogTitle>
        <DialogContent>
          <Typography>Veuillez sélectionner au moins une table à supprimer.</Typography>
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
            <p className="m-4 text-gray-900">{successMessage}</p>
            <button
              onClick={closeSuccess}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}