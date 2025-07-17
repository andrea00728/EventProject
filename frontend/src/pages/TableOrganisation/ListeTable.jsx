import React, { useEffect, useState } from "react";
import axios from "axios";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";
import { DataGrid } from "@mui/x-data-grid";
import Checkbox from "@mui/material/Checkbox";

export default function ListeTable() {
  const { token } = useStateContext();
  const [tables, setTables] = useState([]);
  const [selectedTableIds, setSelectedTableIds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
        setError("Veuillez sélectionner un événement valide.");
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

  const handleDeleteSelected = async () => {
    if (selectedTableIds.length === 0) {
      alert("Veuillez sélectionner au moins une table à supprimer.");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer les tables sélectionnées ?")) {
      return;
    }

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
    }
  };

  const selectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(false);
    setSelectedTableIds([]);
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
            width="60"
            onError={(e) => (e.target.src = "/path/to/fallback-image.png")}
          />
        ) : (
          "Pas de QR"
        ),
    },
  ];

  return (
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
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}