import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Mail, Phone, MapPin } from 'lucide-react';

const GuestList = () => {
  const [guests, setGuests] = useState([
    { 
      id: 1, 
      name: "Jean Martin", 
      email: "jean.martin@email.com", 
      phone: "+33 6 12 34 56 78",
      status: "Confirmé", 
      table: 1,
      company: "Tech Corp",
      dietary: "Végétarien"
    },
    { 
      id: 2, 
      name: "Sophie Laurent", 
      email: "sophie.laurent@email.com", 
      phone: "+33 6 23 45 67 89",
      status: "En attente", 
      table: 2,
      company: "Innovation Ltd",
      dietary: "Aucune"
    },
    { 
      id: 3, 
      name: "Pierre Durand", 
      email: "pierre.durand@email.com", 
      phone: "+33 6 34 56 78 90",
      status: "Confirmé", 
      table: 1,
      company: "Start-up Hub",
      dietary: "Sans gluten"
    },
    { 
      id: 4, 
      name: "Emma Bernard", 
      email: "emma.bernard@email.com", 
      phone: "+33 6 45 67 89 01",
      status: "Confirmé", 
      table: 3,
      company: "Digital Agency",
      dietary: "Aucune"
    },
    { 
      id: 5, 
      name: "Lucas Garcia", 
      email: "lucas.garcia@email.com", 
      phone: "+33 6 56 78 90 12",
      status: "Annulé", 
      table: null,
      company: "Web Solutions",
      dietary: "Végétalien"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');

  // Filtrage des invités
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Tous' || guest.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Statistiques
  const stats = {
    total: guests.length,
    confirmed: guests.filter(g => g.status === 'Confirmé').length,
    pending: guests.filter(g => g.status === 'En attente').length,
    cancelled: guests.filter(g => g.status === 'Annulé').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmé': return 'bg-green-100 text-green-800';
      case 'En attente': return 'bg-yellow-100 text-yellow-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Ici vous pouvez faire un appel API pour récupérer la liste des invités
    // fetchGuests();
  }, []);

  return (
    <div className="p-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Invités</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          <div className="text-sm text-gray-600">Confirmés</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">En Attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          <div className="text-sm text-gray-600">Annulés</div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <UserCheck className="mr-3" />
              Liste des Invités ({filteredGuests.length})
            </h2>
            
            {/* Filtres et recherche */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un invité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Tous">Tous les statuts</option>
                  <option value="Confirmé">Confirmés</option>
                  <option value="En attente">En attente</option>
                  <option value="Annulé">Annulés</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tableau des invités */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Régime
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 flex items-center mb-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {guest.email}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {guest.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(guest.status)}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {guest.table ? (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Table {guest.table}
                      </span>
                    ) : (
                      <span className="text-gray-400">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {guest.dietary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun invité trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestList;