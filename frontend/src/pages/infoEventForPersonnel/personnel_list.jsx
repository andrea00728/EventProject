import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Clock, UserCheck, UserX } from 'lucide-react';

const PersonnelList = () => {
  const [personnel, setPersonnel] = useState([
    { 
      id: 1, 
      name: "Alice Moreau", 
      role: "Coordinateur Général", 
      email: "alice.moreau@staff.com", 
      phone: "+33 6 11 22 33 44",
      status: "Actif",
      speciality: "Coordination événementielle"
    },
    { 
      id: 2, 
      name: "Thomas Leroy", 
      role: "Technicien Audio/Vidéo", 
      email: "thomas.leroy@staff.com", 
      phone: "+33 6 22 33 44 55",
      status: "Actif",
      speciality: "Équipements techniques"
    },
    { 
      id: 3, 
      name: "Camille Petit", 
      role: "Responsable Accueil", 
      email: "camille.petit@staff.com", 
      phone: "+33 6 33 44 55 66",
      status: "inactif",
      speciality: "Relations publiques"
    },
    { 
      id: 4, 
      name: "Lucas Garcia", 
      role: "Agent de Sécurité", 
      email: "lucas.garcia@staff.com", 
      phone: "+33 6 44 55 66 77",
      status: "Actif",
      speciality: "Sécurité événementielle"
    },
    { 
      id: 5, 
      name: "Marie Dupuis", 
      role: "Responsable Restauration", 
      email: "marie.dupuis@staff.com", 
      phone: "+33 6 55 66 77 88",
      status: "Actif",
      speciality: "Gestion traiteur"
    },
    { 
      id: 6, 
      name: "Paul Martin", 
      role: "Assistant Logistique", 
      email: "paul.martin@staff.com", 
      phone: "+33 6 66 77 88 99",
      status: "inactif",
      speciality: "Transport et manutention"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [roleFilter, setRoleFilter] = useState('Tous');

  // Filtrage du personnel
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Tous' || person.status === statusFilter;
    const matchesRole = roleFilter === 'Tous' || person.role.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Statistiques
  const stats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'Actif').length,
    onBreak: personnel.filter(p => p.status === 'En pause').length,
    unavailable: personnel.filter(p => p.status === 'Indisponible').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Actif': return 'bg-green-100 text-green-800';
      case 'En pause': return 'bg-yellow-100 text-yellow-800';
      case 'Indisponible': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Actif': return <UserCheck className="h-4 w-4" />;
      case 'En pause': return <Clock className="h-4 w-4" />;
      case 'Indisponible': return <UserX className="h-4 w-4" />;
      default: return null;
    }
  };

  const getShiftColor = (shift) => {
    switch(shift) {
      case 'Matin': return 'bg-blue-100 text-blue-800';
      case 'Après-midi': return 'bg-orange-100 text-orange-800';
      case 'Soirée': return 'bg-purple-100 text-purple-800';
      case 'Journée complète': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Ici vous pouvez faire un appel API pour récupérer la liste du personnel
    // fetchPersonnel();
  }, []);

  return (
    <div className="p-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Personnel</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">Actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.onBreak}</div>
          <div className="text-sm text-gray-600">En Pause</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
          <div className="text-sm text-gray-600">Indisponibles</div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="mr-3" />
              Personnel ({filteredPersonnel.length})
            </h2>
            
            {/* Filtres et recherche */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
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
                  <option value="Actif">Actifs</option>
                  <option value="En pause">En pause</option>
                  <option value="Indisponible">Indisponibles</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="Tous">Tous les rôles</option>
                  <option value="Coordinateur">Coordinateur</option>
                  <option value="Technicien">Technicien</option>
                  <option value="Responsable">Responsable</option>
                  <option value="Agent">Agent</option>
                  <option value="Assistant">Assistant</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tableau du personnel */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 flex items-center mb-1">
                      <Mail className="h-3 w-3 mr-1" />
                      {person.email}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {person.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {person.speciality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(person.status)}`}>
                      {getStatusIcon(person.status)}
                      <span className="ml-1">{person.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPersonnel.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun personnel trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonnelList;