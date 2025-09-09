import React, { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Mail, Phone, MapPin, TrendingUp, Clock, X, Users } from 'lucide-react';
import { useStateContext } from '../../context/ContextProvider';

const GuestList = () => {
  const { user } = useStateContext();
  const personnelEmail = user?.email;
  console.log("===============email: ", personnelEmail);
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
    switch (status) {
      case 'Confirmé': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'En attente': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Annulé': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    // Ici vous pouvez faire un appel API pour récupérer la liste des invités
    // fetchGuests();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Liste des Invités</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        {/* Statistiques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-200" />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Invités</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-8 w-8 text-emerald-200" />
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.confirmed}</div>
            <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Confirmés</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-amber-200" />
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.pending}</div>
            <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">En Attente</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <X className="h-8 w-8 text-red-200" />
              <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.cancelled}</div>
            <div className="text-red-100 text-sm font-medium uppercase tracking-wide">Annulés</div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gestion des Invités
                  </h2>
                  <p className="text-gray-600">{filteredGuests.length} invités affichés</p>
                </div>
              </div>

              {/* Filtres et recherche améliorés */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher un invité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
                  />
                </div>

                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white appearance-none cursor-pointer transition-all duration-200"
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

          {/* Tableau des invités avec design moderne */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Invité
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Régime
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGuests.map((guest, index) => (
                    <tr key={guest.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(guest.name)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {guest.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <Mail className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="truncate max-w-48">{guest.email}</span>
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <Phone className="h-4 w-4 text-gray-500" />
                            </div>
                            {guest.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                          {guest.company}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-2 text-xs rounded-full font-semibold border ${getStatusColor(guest.status)}`}>
                          {guest.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {guest.table ? (
                          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg text-blue-700 font-medium text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            Table {guest.table}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg inline-block">
                          {guest.dietary}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun invité trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Essayez de modifier vos critères de recherche ou vos filtres pour voir plus d'invités.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestList;