import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Filter, Mail, Phone, Clock, UserCheck, UserX } from 'lucide-react';
import { useStateContext } from '../../context/ContextProvider';

const PersonnelList = () => {
  const { user } = useStateContext();
  const personnelEmail = user?.email;

  const [dataPers, setDataPers] = useState([]);
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [roleFilter, setRoleFilter] = useState('Tous les rôles');

  const predefinedRoles = ['Accueil', 'Cuisinier', 'Caisse'];

  // --- Récupération des données depuis l'API ---
  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!personnelEmail) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const personnelResponse = await fetch(`http://localhost:3000/personnel/by-email/${personnelEmail}`);
        if (!personnelResponse.ok) throw new Error("Personnel non trouvé.");
        const personnelData = await personnelResponse.json();
        const evenementId = personnelData.evenement?.id;
        if (!evenementId) throw new Error("ID d'événement manquant.");

        const eventResponse = await fetch(`http://localhost:3000/evenements/${evenementId}`);
        const event = await eventResponse.json();
        setEventData(event);

        const personnelListResponse = await fetch(`http://localhost:3000/personnel/event/${evenementId}/personnel`);
        if (!personnelListResponse.ok) throw new Error("Erreur lors de la récupération de la liste.");
        const data = await personnelListResponse.json();
        setDataPers(data);

      } catch (err) {
        console.error("Erreur lors de la récupération des données :", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPersonnel();
  }, [personnelEmail]);

  // --- Logique de Filtrage et de Statistiques ---
  const filteredPersonnel = useMemo(() => {
    return dataPers.filter(person => {
      const matchesSearch = 
        person.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.speciality?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Tous' || person.status?.toLowerCase() === statusFilter.toLowerCase();
      
      let matchesRole;
      if (roleFilter === 'Tous les rôles') {
        matchesRole = true;
      } else if (roleFilter === 'Autre') {
        matchesRole = !predefinedRoles.some(predefinedRole => 
          predefinedRole.toLowerCase() === person.role?.toLowerCase()
        );
      } else {
        matchesRole = person.role?.toLowerCase() === roleFilter.toLowerCase();
      }
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [dataPers, searchTerm, statusFilter, roleFilter, predefinedRoles]);

  const stats = useMemo(() => {
    const total = filteredPersonnel.length;
    const active = filteredPersonnel.filter(p => p.status?.toLowerCase() === 'accepter').length;
    const awaiting = filteredPersonnel.filter(p => p.status?.toLowerCase() === 'attent').length;
    const refused = filteredPersonnel.filter(p => p.status?.toLowerCase() === 'refused').length;

    return { total, active, awaiting, refused };
  }, [filteredPersonnel]);

  // --- Fonctions Utilitaires ---
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'attent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'refused':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return <UserCheck className="h-4 w-4" />;
      case 'attent':
        return <Clock className="h-4 w-4" />;
      case 'refused':
        return <UserX className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0])?.join('').toUpperCase() || '';
  };

  // --- Rendu du composant (JSX) ---
  return (
    <>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {eventData ? `Personnel de l'événement : ${eventData.nom}` : 'Liste du Personnel'}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-200" />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.total}</div>
            <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Personnel</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-8 w-8 text-emerald-200" />
              <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.active}</div>
            <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Accepté</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-amber-200" />
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.awaiting}</div>
            <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">En Attente</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <UserX className="h-8 w-8 text-red-200" />
              <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.refused}</div>
            <div className="text-red-100 text-sm font-medium uppercase tracking-wide">Refusé</div>
          </div>
        </div>

        {/* Tableau de la liste */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gestion du Personnel
                  </h2>
                  <p className="text-gray-600">{filteredPersonnel.length} membres affichés</p>
                </div>
              </div>

              {/* Barre de recherche et filtres */}
              <div class="flex flex-col sm:flex-row gap-4 w-full">
                <div class="relative group w-full sm:w-auto">
                  <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors"></Search>
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onchange={(e) => setSearchTerm(e.target.value)}
                    class="pl-12 pr-4 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 placeholder-gray-400"
                  />
                </div>
                <div class="relative group w-full sm:w-auto">
                  <Filter class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors"></Filter>
                  <select
                    value={statusFilter}
                    onchange={(e) => setStatusFilter(e.target.value)}
                    class="pl-12 pr-10 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="attent">En Attente</option>
                    <option value="accepter">Accepté</option>
                  </select>
                </div>
                <div class="relative group w-full sm:w-auto">
                  <Filter class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors"></Filter>
                  <select
                    value={roleFilter}
                    onchange={(e) => setRoleFilter(e.target.value)}
                    class="pl-12 pr-10 py-3 w-full bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="Tous les rôles">Tous les rôles</option>
                    <option value="Accueil">Accueil</option>
                    <option value="Cuisinier">Cuisinier(e)</option>
                    <option value="Caisse">Caisse</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Chargement des données...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
              <p className="text-lg font-semibold">Erreur: {error}</p>
            </div>
          ) : filteredPersonnel.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-24 h-24 mx-auto text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mt-4">Aucun personnel trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-2">Essayez de modifier vos critères de recherche ou vos filtres pour voir plus de membres.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personnel</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPersonnel.map(person => (
                      <tr key={person.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(person.nom)}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {person.nom}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm text-gray-500">{person.role}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {person.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-bold shadow-lg border ${getStatusColor(person.status)}`}>
                            {getStatusIcon(person.status)}
                            <span className="ml-1">{person.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </>
  );
};

export default PersonnelList;