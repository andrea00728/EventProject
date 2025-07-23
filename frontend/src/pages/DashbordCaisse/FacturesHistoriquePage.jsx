import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  LucideArrowLeft,
  LucidePrinter,
  LucideDownload,
  LucideSearch,
  LucideHome
} from 'lucide-react';

const FactureItem = ({ facture }) => {
  const handlePrint = () => {
    console.log('Impression de la facture:', facture);
  };

  const handleDownload = () => {
    console.log('Téléchargement de la facture:', facture);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-800">Facture #{facture.numero || 'N/A'}</h3>
          <p className="text-sm text-gray-500">
            {facture.date ? new Date(facture.date).toLocaleDateString() : 'Date non spécifiée'}
          </p>
          <p className="text-sm mt-1">{facture.client || 'Client non spécifié'}</p>
          <p className="text-sm text-gray-600 mt-1">
            Total: {facture.total ? facture.total.toFixed(2) : '0.00'} €
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
            title="Imprimer"
          >
            <LucidePrinter className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full"
            title="Télécharger"
          >
            <LucideDownload className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FacturesHistoriquePage = () => {
  const [factures, setFactures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFactures = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFactures(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des factures:', err);
        setError("Impossible de charger les factures. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFactures();
  }, []);

  const filteredFactures = factures.filter(facture => {
    const searchTerm = searchQuery.toLowerCase();
    const numero = facture.numero ? facture.numero.toString().toLowerCase() : '';
    const client = facture.client ? facture.client.toString().toLowerCase() : '';
    
    return numero.includes(searchTerm) || client.includes(searchTerm);
  });

  const paginatedFactures = filteredFactures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <LucideArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Historique des Factures</h1>
          <Link to="/" className="p-2 hover:bg-gray-200 rounded-full">
            <LucideHome className="w-5 h-5" />
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
          <LucideSearch className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            className="bg-transparent border-none w-full focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              {paginatedFactures.length > 0 ? (
                <>
                  {paginatedFactures.map((facture) => (
                    <FactureItem key={facture._id || Math.random()} facture={facture} />
                  ))}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery ? "Aucune facture ne correspond à votre recherche" : "Aucune facture disponible"}
                </p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Affichage de {paginatedFactures.length} factures sur {filteredFactures.length}
                </p>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Précédent
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FacturesHistoriquePage;