import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdLocationCity, MdRoom, MdAdd, MdEdit, MdDelete, MdSave, MdClose, MdCheck } from "react-icons/md";

export default function LocationSalle() {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [newSalleName, setNewSalleName] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [editLocationId, setEditLocationId] = useState(null);
  const [editLocationName, setEditLocationName] = useState("");
  const [editSalleId, setEditSalleId] = useState(null);
  const [editSalleName, setEditSalleName] = useState("");
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Base URL for API (adjust to your backend URL)
  const API_URL = "http://localhost:3000/locations";

  // Fetch all locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(API_URL);
      setLocations(response.data);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des lieux");
    }
  };

  // Create a new location
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) {
      setError("Le nom du lieu est requis");
      return;
    }
    try {
      await axios.post(API_URL, { nom: newLocationName });
      setNewLocationName("");
      fetchLocations();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la création du lieu");
    }
  };

  // Update a location
  const handleUpdateLocation = async (id) => {
    if (!editLocationName.trim()) {
      setError("Le nom du lieu est requis");
      return;
    }
    try {
      await axios.put(`${API_URL}/${id}`, { nom: editLocationName });
      setEditLocationId(null);
      setEditLocationName("");
      fetchLocations();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour du lieu");
    }
  };

  // Open delete confirmation modal for location
  const openDeleteLocationModal = (id, nom) => {
    setDeleteItem({ type: 'location', id, nom });
    setShowDeleteModal(true);
  };

  // Open delete confirmation modal for salle
  const openDeleteSalleModal = (id, nom) => {
    setDeleteItem({ type: 'salle', id, nom });
    setShowDeleteModal(true);
  };

  // Handle deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    const { type, id } = deleteItem;
    try {
      if (type === 'location') {
        await axios.delete(`${API_URL}/${id}`);
        setLocations(locations.filter((loc) => loc.id !== id));
        setError(null);
      } else if (type === 'salle') {
        await axios.delete(`${API_URL}/salles/${id}`);
        fetchLocations();
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Erreur lors de la suppression de la ${type}`);
    } finally {
      setShowDeleteModal(false);
      setDeleteItem(null);
    }
  };

  // Create a new salle
  const handleCreateSalle = async (locationId) => {
    if (!newSalleName.trim()) {
      setError("Le nom de la salle est requis");
      return;
    }
    try {
      await axios.post(`${API_URL}/${locationId}/salles`, { nom: newSalleName });
      setNewSalleName("");
      setSelectedLocationId(null);
      fetchLocations();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la création de la salle");
    }
  };

  // Update a salle
  const handleUpdateSalle = async (id) => {
    if (!editSalleName.trim()) {
      setError("Le nom de la salle est requis");
      return;
    }
    try {
      await axios.put(`${API_URL}/salles/${id}`, { nom: editSalleName });
      setEditSalleId(null);
      setEditSalleName("");
      fetchLocations();
      setError(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la salle");
    }
  };

  return (
    <div className="p-8 bg-white my-2 rounded-2xl shadow-2xl border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-4 flex items-center">
        <MdLocationCity className="mr-3" /> Paramètres - Gestion des Lieux et Salles
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Create Location Form */}
      <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MdLocationCity className="mr-2" /> Ajouter un lieu
        </h3>
        <form onSubmit={handleCreateLocation} className="flex gap-4 items-center">
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="Nom du lieu (ex: Ivato)"
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-800 transition duration-200"
            title="Ajouter un lieu"
          >
            <MdAdd className="text-xl" />
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la suppression
            </h3>
            <p className="mb-6">
              Êtes-vous sûr de vouloir supprimer {deleteItem.type === 'location' ? 'le lieu' : 'la salle'} "{deleteItem.nom}" ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                }}
                className="p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="p-3 bg-red-600 text-white rounded-md hover:bg-red-800 transition duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locations List */}
      <div className="space-y-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200"
          >
            {/* Location Header */}
            <div className="flex justify-between items-center mb-4">
              {editLocationId === location.id ? (
                <div className="flex gap-4 items-center w-full">
                  <input
                    type="text"
                    value={editLocationName}
                    onChange={(e) => setEditLocationName(e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleUpdateLocation(location.id)}
                    className="p-3 bg-green-600 text-white rounded-md hover:bg-green-800 transition duration-200"
                    title="Sauvegarder"
                  >
                    <MdSave className="text-xl" />
                  </button>
                  <button
                    onClick={() => setEditLocationId(null)}
                    className="p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                    title="Annuler"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between w-full items-center">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MdRoom className="mr-2" /> {location.nom}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditLocationId(location.id);
                        setEditLocationName(location.nom);
                      }}
                      className="p-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-800 transition duration-200"
                      title="Modifier le lieu"
                    >
                      <MdEdit className="text-xl" />
                    </button>
                    <button
                      onClick={() => openDeleteLocationModal(location.id, location.nom)}
                      className="p-3 bg-red-600 text-white rounded-md hover:bg-red-800 transition duration-200"
                      title="Supprimer le lieu"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Salle Form */}
            {selectedLocationId === location.id ? (
              <div className="mb-4 flex gap-4 items-center">
                <input
                  type="text"
                  value={newSalleName}
                  onChange={(e) => setNewSalleName(e.target.value)}
                  placeholder="Nom de la salle"
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleCreateSalle(location.id)}
                  className="p-3 bg-gray-600 text-white rounded-md hover:bg-gray-800 transition duration-200"
                  title="Ajouter une salle"
                >
                  <MdCheck className="text-xl" />
                </button>
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                  title="Annuler"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedLocationId(location.id)}
                className="mb-4 p-3 bg-gray-600 text-white rounded-md hover:bg-gray-800 transition duration-200"
                title="Ajouter une salle"
              >
                <MdAdd className="text-xl inline mr-2" />ajouer une salle
              </button>
            )}

            {/* Salles List */}
            {location.salles && location.salles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold mb-2 flex items-center">
                  <MdLocationCity className="mr-2" /> Salles
                </h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-3 text-start font-semibold">Nom</th>
                      <th className="p-3 text-start font-semibold flex justify-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {location.salles.map((salle) => (
                      <tr key={salle.id} className="bg-gray-50">
                        {editSalleId === salle.id ? (
                          <td className="p-3 flex gap-4 items-center">
                            <input
                              type="text"
                              value={editSalleName}
                              onChange={(e) => setEditSalleName(e.target.value)}
                              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleUpdateSalle(salle.id)}
                              className="p-3 bg-green-600 text-white rounded-md hover:bg-green-800 transition duration-200"
                              title="Sauvegarder"
                            >
                              <MdSave className="text-xl" />
                            </button>
                            <button
                              onClick={() => setEditSalleId(null)}
                              className="p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                              title="Annuler"
                            >
                              <MdClose className="text-xl" />
                            </button>
                          </td>
                        ) : (
                          <>
                            <td className="p-3 text-start">{salle.nom}</td>
                            <td className="p-3 text-start flex justify-end">
                              <button
                                onClick={() => {
                                  setEditSalleId(salle.id);
                                  setEditSalleName(salle.nom);
                                }}
                                className="p-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-800 transition duration-200 mr-2"
                                title="Modifier la salle"
                              >
                                <MdEdit className="text-xl" />
                              </button>
                              <button
                                onClick={() => openDeleteSalleModal(salle.id, salle.nom)}
                                className="p-3 bg-red-600 text-white rounded-md hover:bg-red-800 transition duration-200"
                                title="Supprimer la salle"
                              >
                                <MdDelete className="text-xl" />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}