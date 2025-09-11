import React, { useState, useEffect } from 'react';
import { getAllForfait, addForfait, editForfait, deleteForfait } from '../../services/forfaitService';

// Fonctions de service pour l'API des forfaits (simulées pour l'exemple)
// const API_URL = `${import.meta.env.VITE_API_BASE_URL}/forfait`;

// const getAllForfait = async () => {
//   // Remplacer par un véritable appel API
//   console.log('Fetching all forfaits...');
//   const response = await fetch(`${API_URL}/forfait/all`);
//   if (!response.ok) {
//     throw new Error('Erreur lors de la récupération des forfaits');
//   }
//   return await response.json();
// };

// const addForfait = async (forfaitData) => {
//   // Remplacer par un véritable appel API
//   console.log('Adding new forfait:', forfaitData);
//   const response = await fetch(`${API_URL}/forfait`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(forfaitData),
//   });
//   if (!response.ok) {
//     throw new Error("Erreur lors de l'ajout du forfait");
//   }
//   return await response.json();
// };

// const editForfait = async (id, forfaitData) => {
//   // Remplacer par un véritable appel API
//   console.log(`Editing forfait with ID ${id}:`, forfaitData);
//   const response = await fetch(`${API_URL}/forfait/${id}`, {
//     method: 'PATCH',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(forfaitData),
//   });
//   if (!response.ok) {
//     throw new Error('Erreur lors de la modification du forfait');
//   }
//   return await response.json();
// };

// const deleteForfait = async (id) => {
//   // Remplacer par un véritable appel API
//   console.log(`Deleting forfait with ID ${id}`);
//   const response = await fetch(`${API_URL}/forfait/${id}`, {
//     method: 'DELETE',
//   });
//   if (!response.ok) {
//     throw new Error('Erreur lors de la suppression du forfait');
//   }
// };

// Composant de modal pour l'ajout/modification de forfaits
const PackageModal = ({ isOpen, onClose, packageData, onSave }) => {
  const [formData, setFormData] = useState(
    packageData || { nom: '', price: '', maxevents: '', maxinvites: '', description: '' }
  );

  useEffect(() => {
    setFormData(packageData || { nom: '', price: '', maxevents: '', maxinvites: '', description: '' });
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold text-center mb-4">
          {packageData ? 'Modifier le forfait' : 'Ajouter un nouveau forfait'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nom du forfait</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Max. événements</label>
            <input
              type="number"
              name="maxevents"
              value={formData.maxevents}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Max. invités</label>
            <input
              type="number"
              name="maxinvites"
              value={formData.maxinvites}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant de modal de confirmation
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center">
                <p className="mb-4">{message}</p>
                <div className="flex justify-around">
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                        Confirmer
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

// Composant principal de la page de gestion
const PackageManagementPage = () => {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packageToDeleteId, setPackageToDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllForfait(); // Utilisez la fonction importée !
      setPackages(data);
    } catch (err) {
      console.error("Erreur lors du chargement des forfaits:", err);
      setError("Impossible de charger les forfaits. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAddPackage = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (pkgId) => {
    setPackageToDeleteId(pkgId);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    try {
      await deleteForfait(packageToDeleteId); // Importée !
      await fetchPackages();
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Impossible de supprimer le forfait.");
    } finally {
      setIsLoading(false);
      setPackageToDeleteId(null);
    }
  };

  const handleSavePackage = async (newPackage) => {
    setIsLoading(true);
    try {
      if (selectedPackage) {
        await editForfait(selectedPackage.id, newPackage); // Importée !
      } else {
        await addForfait(newPackage); // Importée !
      }
      await fetchPackages();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      setError("Impossible de sauvegarder le forfait.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des forfaits</h1>
          <button
            onClick={handleAddPackage}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            + Ajouter un forfait
          </button>
        </div>

        {isLoading && <p className="text-center text-gray-600">Chargement des forfaits...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Prix (€)
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fonctionnalités
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{pkg.nom}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{pkg.price} €</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        Max. événements: {pkg.maxevents}, Max. invités: {pkg.maxinvites}
                        <br />
                        Description: {pkg.description}
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-full text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pkg.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageData={selectedPackage}
        onSave={handleSavePackage}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Êtes-vous sûr de vouloir supprimer ce forfait ?"
      />
    </div>
  );
};

export default PackageManagementPage;