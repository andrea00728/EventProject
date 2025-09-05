import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Clock, UserCheck, UserX } from 'lucide-react';

const PersonnelList = () => {
  const [personnel, setPersonnel] = useState([
    { id: 1, name: "Alice Moreau", role: "Coordinateur Général", email: "alice.moreau@staff.com", phone: "+33 6 11 22 33 44", status: "Actif", speciality: "Coordination événementielle" },
    { id: 2, name: "Thomas Leroy", role: "Technicien Audio/Vidéo", email: "thomas.leroy@staff.com", phone: "+33 6 22 33 44 55", status: "Actif", speciality: "Équipements techniques" },
    { id: 3, name: "Camille Petit", role: "Responsable Accueil", email: "camille.petit@staff.com", phone: "+33 6 33 44 55 66", status: "inactif", speciality: "Relations publiques" },
    { id: 4, name: "Lucas Garcia", role: "Agent de Sécurité", email: "lucas.garcia@staff.com", phone: "+33 6 44 55 66 77", status: "Actif", speciality: "Sécurité événementielle" },
    { id: 5, name: "Marie Dupuis", role: "Responsable Restauration", email: "marie.dupuis@staff.com", phone: "+33 6 55 66 77 88", status: "Actif", speciality: "Gestion traiteur" },
    { id: 6, name: "Paul Martin", role: "Assistant Logistique", email: "paul.martin@staff.com", phone: "+33 6 66 77 88 99", status: "inactif", speciality: "Transport et manutention" }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [roleFilter, setRoleFilter] = useState('Tous');

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Tous' || person.status === statusFilter;
    const matchesRole = roleFilter === 'Tous' || person.role.includes(roleFilter);
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: personnel.length,
    active: personnel.filter(p => p.status === 'Actif').length,
    onBreak: personnel.filter(p => p.status === 'En pause').length,
    unavailable: personnel.filter(p => p.status === 'Indisponible').length
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Actif': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'En pause': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Indisponible': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  useEffect(() => {
    // fetchPersonnel();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Liste du Personnel</h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
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
            <div className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Actifs</div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-amber-200" />
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.onBreak}</div>
            <div className="text-amber-100 text-sm font-medium uppercase tracking-wide">En Pause</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform">
            <div className="flex items-center justify-between mb-4">
              <UserX className="h-8 w-8 text-red-200" />
              <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.unavailable}</div>
            <div className="text-red-100 text-sm font-medium uppercase tracking-wide">Indisponibles</div>
          </div>
        </div>

        {/* Tableau */}
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

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
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
                    className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="Actif">Actifs</option>
                    <option value="En pause">En pause</option>
                    <option value="Indisponible">Indisponibles</option>
                  </select>
                </div>

                <div className="relative group">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200"
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

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personnel</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Spécialité</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPersonnel.map(person => (
                    <tr key={person.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(person.name)}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {person.name}
                            <div className="text-xs text-gray-500">{person.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            {person.email}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {person.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg inline-block">{person.speciality}</div>
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

            {filteredPersonnel.length === 0 && (
              <div className="text-center py-16">
                <Users className="w-24 h-24 mx-auto text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mt-4">Aucun personnel trouvé</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">Essayez de modifier vos critères de recherche ou vos filtres pour voir plus de membres.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelList;
