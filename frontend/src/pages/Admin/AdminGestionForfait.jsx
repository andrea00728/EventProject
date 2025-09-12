import React, { useState, useEffect } from 'react';
import { getAllForfait, addForfait, editForfait, deleteForfait } from '../../services/forfaitService';
import { useDarkMode } from "../../context/DarkModeContext";

// Composant de modal pour l'ajout/modification de forfaits
const PackageModal = ({ isOpen, onClose, packageData, onSave }) => {
  const [formData, setFormData] = useState(
    packageData || { nom: '', price: '', maxevents: '', maxinvites: '', validationduration: '', fonctionnalite: '', ideal: '' }
  );

  const { darkMode } = useDarkMode();

  useEffect(() => {
    setFormData(packageData || { nom: '', price: '', maxevents: '', maxinvites: '', validationduration: '', fonctionnalite: '', ideal: '' });
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
    <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
      <div className={`relative p-6 sm:p-8 border w-full max-w-lg mx-auto shadow-2xl rounded-lg transform transition-all duration-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
        <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">
          {packageData ? 'Modifier le forfait' : 'Ajouter un nouveau forfait'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Nom du forfait</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Max. événements</label>
            <input
              type="text"
              name="maxevents"
              value={formData.maxevents}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Max. invités</label>
            <input
              type="text"
              name="maxinvites"
              value={formData.maxinvites}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Durée</label>
            <input
              type="text"
              name="validationduration"
              value={formData.validationduration}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Fonctionnalités</label>
            <textarea
              name="fonctionnalite"
              value={formData.fonctionnalite}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">l'Idéal</label>
            <textarea
              name="ideal"
              value={formData.ideal}
              onChange={handleChange}
              className={`shadow-sm appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'text-gray-700 border-gray-300'}`}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300 transform hover:scale-105"
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
  const { darkMode } = useDarkMode();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center p-4">
      <div className={`relative p-6 sm:p-8 border w-full max-w-sm mx-auto shadow-2xl rounded-lg text-center transform transition-all duration-500 ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
        <p className="mb-6 text-lg font-semibold">{message}</p>
        <div className="flex justify-around space-x-4">
          <button
            onClick={onConfirm}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 transform hover:scale-105"
          >
            Confirmer
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300 transform hover:scale-105"
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
  const { darkMode } = useDarkMode();

  const fetchPackages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllForfait();
      const sortedData = data.sort((a, b) => a.id - b.id);
      setPackages(sortedData);
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
      await deleteForfait(packageToDeleteId);
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
        await editForfait(selectedPackage.id, newPackage);
      } else {
        await addForfait(newPackage);
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
    <div className={`min-h-full p-4 sm:p-8 transition-colors duration-500 ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Gestion des forfaits</h1>
          <button
            onClick={handleAddPackage}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-2 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            + Ajouter un forfait
          </button>
        </div>

        {isLoading && <p className="text-center">Chargement des forfaits...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!isLoading && !error && (
          <div className={`shadow-lg rounded-lg overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Version pour les écrans larges (>= md) */}
            <div className="hidden md:block">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                    <th className={`px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'}`}>
                      Nom
                    </th>
                    <th className={`px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'}`}>
                      Prix (€)
                    </th>
                    <th className={`px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'}`}>
                      Fonctionnalités
                    </th>
                    <th className={`px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id}>
                      <td className={`px-5 py-5 border-b border-gray-200 text-sm transition-colors duration-500 ${darkMode ? 'border-gray-700' : 'bg-white'}`}>
                        <p className={`whitespace-no-wrap transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{pkg.nom}</p>
                      </td>
                      <td className={`px-5 py-5 border-b border-gray-200 text-sm transition-colors duration-500 ${darkMode ? 'border-gray-700' : 'bg-white'}`}>
                        <p className={`whitespace-no-wrap transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{pkg.price} €</p>
                      </td>
                      <td className={`px-5 py-5 border-b border-gray-200 text-sm transition-colors duration-500 ${darkMode ? 'border-gray-700' : 'bg-white'}`}>
                        <p className={`whitespace-pre-wrap transition-colors duration-500 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          <span className="font-semibold">Max. événements:</span> {pkg.maxevents}, <span className="font-semibold">Max. invités:</span> {pkg.maxinvites}, <span className="font-semibold">Durée:</span> {pkg.validationduration}
                          <br />
                          <span className="font-semibold">Fonctionnalités:</span> {pkg.fonctionnalite}
                          <br />
                          <span className="font-semibold">l'Idéal:</span> {pkg.ideal}
                        </p>
                      </td>
                      <td className={`px-5 py-5 border-b border-gray-200 text-sm transition-colors duration-500 ${darkMode ? 'border-gray-700' : 'bg-white'}`}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-all duration-300 transform hover:scale-105"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pkg.id)}
                            className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-300 transform hover:scale-105"
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

            {/* Version pour les écrans plus petits (< md) */}
            <div className="md:hidden p-4 space-y-4">
              {packages.map(pkg => (
                <div key={pkg.id} className={`p-4 rounded-lg shadow-md transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`text-lg font-bold mb-2 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.nom}</h4>
                  <p className={`text-sm mb-1 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Prix:</span> {pkg.price} €
                  </p>
                  <p className={`text-sm mb-1 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Max. événements:</span> {pkg.maxevents}
                  </p>
                  <p className={`text-sm mb-1 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Max. invités:</span> {pkg.maxinvites}
                  </p>
                  <p className={`text-sm mb-1 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Durée:</span> {pkg.validationduration}
                  </p>
                  <p className={`text-sm mb-1 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">Fonctionnalités:</span> {pkg.fonctionnalite}
                  </p>
                  <p className={`text-sm mb-4 transition-colors duration-500 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-semibold">l'Idéal:</span> {pkg.ideal}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditPackage(pkg)}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-1 px-3 rounded-full text-xs transition-all duration-300 transform hover:scale-105"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(pkg.id)}
                      className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold py-1 px-3 rounded-full text-xs transition-colors duration-300 transform hover:scale-105"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
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