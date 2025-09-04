import React, { useEffect, useState } from "react";
import {
    Calendar,
    Users,
    UserCheck,
    Grid3X3,
    MapPin,
    Eye,
    X,
    Phone,
    Mail,
    User,
    List,
    LayoutGrid,
    Clock,
    Search,
    Filter,
    ChevronRight,
    Briefcase,
    House
} from "lucide-react";
import { getGuestsByEventId } from "../../services/inviteService";
import { getPersonnelByEventId } from "../../services/personnel_service";
import { getMyEvents } from "../../services/evenementServ";
import { useStateContext } from "../../context/ContextProvider";

export default function DashboardEvenement() {
    const { isAuthenticated } = useStateContext();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [guests, setGuests] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [tables, setTables] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("list");
    const [activeTab, setActiveTab] = useState("invites");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Récupération des événements
    useEffect(() => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        getMyEvents()
            .then((data) => {
                setEvents(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement événements:", err);
                setError("Erreur lors du chargement des événements.");
                setIsLoading(false);
            });
    }, [isAuthenticated]);

    // Récupération des invités et génération dynamique des tables
    useEffect(() => {
        if (!selectedEvent?.id || !isAuthenticated) return;

        setIsLoading(true);

        // Récupérer les invités
        getGuestsByEventId(selectedEvent.id)
            .then((guestsData) => {
                setGuests(guestsData);

                // Générer dynamiquement les tables selon le nombre d'invités
                const tablesDyn = [];
                const tableCapacity = 8;
                const numTables = Math.ceil(guestsData.length / tableCapacity);

                for (let i = 0; i < numTables; i++) {
                    const start = i * tableCapacity;
                    const end = start + tableCapacity;
                    const invitesAtTable = guestsData.slice(start, end);
                    tablesDyn.push({
                        id: i + 1,
                        numero: i + 1,
                        capacite: tableCapacity,
                        invites: invitesAtTable.length,
                        statut: invitesAtTable.length === tableCapacity ? "Complète" : "Disponible"
                    });
                }

                setTables(tablesDyn);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement invités:", err);
                setError("Erreur lors du chargement des invités.");
                setIsLoading(false);
            });
    }, [selectedEvent, isAuthenticated]);

    // Récupération du personnel dynamique
    useEffect(() => {
        if (!selectedEvent?.id || !isAuthenticated) return;

        setIsLoading(true);

        getPersonnelByEventId(selectedEvent.id)
            .then((personnelData) => {
                setPersonnel(personnelData);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Erreur chargement personnel:", err);
                setError("Erreur lors du chargement du personnel.");
                setIsLoading(false);
            });
    }, [selectedEvent, isAuthenticated]);

    const openEventModal = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
        setActiveTab("invites");
        setGuests([]);
        setPersonnel([]);
        setTables([]);
        setError(null);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
        setGuests([]);
        setPersonnel([]);
        setTables([]);
        setError(null);
    };

    const getInviteStatutColor = (statut) => {
        switch (statut) {
            case "Confirmé": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "En attente": return "bg-amber-100 text-amber-800 border-amber-200";
            case "Décliné": return "bg-red-100 text-red-800 border-red-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPersonnelStatutColor = (statut) => {
        switch (statut) {
            case "Assigné": return "bg-blue-100 text-blue-800 border-blue-200";
            case "En attente": return "bg-orange-100 text-orange-800 border-orange-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTableStatutColor = (statut) => {
        switch (statut) {
            case "Complète": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "Disponible": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getEventStatutColor = (statut) => {
        switch (statut) {
            case "Confirmé": return "bg-emerald-500 text-white";
            case "En préparation": return "bg-blue-500 text-white";
            case "Terminé": return "bg-gray-500 text-white";
            default: return "bg-gray-400 text-white";
        }
    };

    const filteredEvents = events.filter(event =>
        event.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.salle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- state pour stocker les invités comptés par événement ---
    const [inviteCounts, setInviteCounts] = useState({});

    useEffect(() => {
        const fetchInviteCounts = async () => {
            if (!isAuthenticated || events.length === 0) return;

            const counts = {};
            for (const event of events) {
                try {
                    const guestsData = await getGuestsByEventId(event.id);
                    counts[event.id] = guestsData.length; // total des invités
                } catch (error) {
                    console.error(`Erreur récupération invités pour événement ${event.id}:`, error);
                    counts[event.id] = 0;
                }
            }
            setInviteCounts(counts);
        };

        fetchInviteCounts();
    }, [events, isAuthenticated]);


    // Fonction pour compter le personnel par événement
    const [personnelCounts, setPersonnelCounts] = useState({});

    useEffect(() => {
        const fetchPersonnelCounts = async () => {
            if (!isAuthenticated || events.length === 0) return;

            const counts = {};
            for (const event of events) {
                try {
                    const personnelData = await getPersonnelByEventId(event.id);
                    const total = personnelData.length;
                    const assigned = personnelData.filter(p => p.statut === "Assigné").length;
                    counts[event.id] = { total, assigned };
                } catch (error) {
                    console.error(`Erreur récupération personnel pour événement ${event.id}:`, error);
                    counts[event.id] = { total: 0, assigned: 0 };
                }
            }
            setPersonnelCounts(counts);
        };

        fetchPersonnelCounts();
    }, [events, isAuthenticated]);



    if (isLoading && events.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des événements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header avec design moderne */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Dashboard Événements
                            </h1>
                            <p className="text-gray-500 mt-2">Gérez vos événements et suivez leur progression en temps réel</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                                {events.length} Événements
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6">
                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un événement..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            <Filter className="w-5 h-5" />
                            <span>Filtres</span>
                        </button>
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Affichage des erreurs */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Liste des événements */}
                {viewMode === "list" ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Événement</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">salle</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invités</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Personnel Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredEvents.map((event) => {
                                        const personnelData = personnelCounts[event.id] || { total: 0, assigned: 0 };

                                        return (
                                            <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                            <Calendar className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-semibold text-gray-900">{event.nom}</div>
                                                            <div className="text-sm text-gray-500">#{event.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-900 font-medium">
                                                            {new Date(event.date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <House className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">{event.salle?.nom}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-blue-500" />
                                                        <span className="text-blue-600 font-semibold">{inviteCounts[event.id] || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Briefcase className="w-4 h-4 text-purple-500" />
                                                        <span className="text-purple-600 font-semibold">{personnelData.total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEventStatutColor(event.statut)}`}>
                                                        {event.statut}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => openEventModal(event)}
                                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Détails
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // Vue grille
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((event) => {
                            const personnelData = personnelCounts[event.id] || { total: 0, assigned: 0 };

                            return (
                                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-white" />
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEventStatutColor(event.statut)}`}>
                                                {event.statut}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.nom}</h3>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {new Date(event.date).toLocaleDateString('fr-FR')}
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-gray-600">
                                                <House className="w-4 h-4 mr-2" />
                                                {event.salle?.nom || "Non précisé"}
                                            </div>

                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="text-center p-3 bg-blue-50 rounded-xl">
                                                <div className="text-2xl font-bold text-blue-600">{inviteCounts[event.id] || 0}</div>
                                                <div className="text-sm text-blue-500">Invités</div>
                                            </div>
                                            <div className="text-center p-3 bg-blue-50 rounded-xl">
                                                <div className="text-2xl font-bold text-purple-600">{personnelData.total}</div>
                                                <div className="text-sm text-purple-500">Personnel</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openEventModal(event)}
                                            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                        >
                                            <Eye className="w-5 h-5 mr-2" />
                                            Voir les détails
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredEvents.length === 0 && !isLoading && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
                        <p className="text-gray-500">
                            {searchTerm ? "Aucun événement ne correspond à votre recherche." : "Vous n'avez pas encore d'événements."}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal détails événement */}
            {modalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* En-tête du modal */}
                        <div className="px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="relative flex justify-between items-center text-white">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{selectedEvent.nom}</h3>
                                    <div className="flex items-center space-x-6 text-blue-100">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {selectedEvent.salle?.nom}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Navigation des onglets */}
                            <div className="px-8 py-4 border-b border-gray-100">
                                <nav className="flex space-x-8">
                                    {[
                                        { id: "invites", label: "Invités", icon: Users, count: guests.length },
                                        { id: "personnel", label: "Personnel", icon: User, count: personnel.length },
                                        { id: "tables", label: "Tables", icon: Grid3X3, count: tables.length }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center space-x-2 pb-3 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                                                ? "border-b-2 border-blue-500 text-blue-600"
                                                : "text-gray-500 hover:text-gray-700"
                                                }`} 
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            <span>{tab.label}</span>
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                {tab.count}
                                            </span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-8">
                                {isLoading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                                        <span className="text-gray-600">Chargement...</span>
                                    </div>
                                )}

                                {/* Onglet Invités */}
                                {activeTab === "invites" && !isLoading && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Téléphone</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {guests.map((guest) => (
                                                        <tr key={guest.id} className="hover:bg-white transition-colors rounded-lg">
                                                            <td className="px-6 py-4 font-medium text-gray-900">{guest.nom}</td>
                                                            <td className="px-6 py-4 text-gray-600">{guest.email}</td>
                                                            <td className="px-6 py-4 text-gray-600">{guest.telephone}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Onglet Personnel */}
                                {activeTab === "personnel" && !isLoading && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Téléphone</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {personnel.map((p) => (
                                                        <tr key={p.id} className="hover:bg-white transition-colors rounded-lg">
                                                            <td className="px-6 py-4 font-medium text-gray-900">{p.nom}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                    {p.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">{p.telephone}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPersonnelStatutColor(p.statut)}`}>
                                                                    {p.statut}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Onglet Tables */}
                                {activeTab === "tables" && !isLoading && (
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">N° Table</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacité</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invités</th>
                                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {tables.map((t) => (
                                                        <tr key={t.id} className="hover:bg-white transition-colors rounded-lg">
                                                            <td className="px-6 py-4 font-medium text-gray-900">Table {t.numero}</td>
                                                            <td className="px-6 py-4 text-gray-600">{t.capacite}</td>
                                                            <td className="px-6 py-4 text-gray-600">{t.invites}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTableStatutColor(t.statut)}`}>
                                                                    {t.statut}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Message si pas de données */}
                                {activeTab === "invites" && guests.length === 0 && !isLoading && (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun invité</h3>
                                        <p className="text-gray-500">Aucun invité n'a été ajouté à cet événement.</p>
                                    </div>
                                )}

                                {activeTab === "personnel" && personnel.length === 0 && !isLoading && (
                                    <div className="text-center py-12">
                                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun personnel</h3>
                                        <p className="text-gray-500">Aucun membre du personnel n'a été assigné à cet événement.</p>
                                    </div>
                                )}

                                {activeTab === "tables" && tables.length === 0 && !isLoading && (
                                    <div className="text-center py-12">
                                        <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune table</h3>
                                        <p className="text-gray-500">Les tables seront générées automatiquement selon le nombre d'invités.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}