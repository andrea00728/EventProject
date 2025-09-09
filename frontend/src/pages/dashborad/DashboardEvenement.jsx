import React, { useEffect, useState, useMemo, useRef } from "react";
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
import axiosClient from "../../api/axios-client";

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
    const [filterColumn, setFilterColumn] = useState("tous");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [tableCapacities, setTableCapacities] = useState({});
    const [inviteCounts, setInviteCounts] = useState({});
    const [personnelCounts, setPersonnelCounts] = useState({});
    const [isTableCapacitiesLoading, setIsTableCapacitiesLoading] = useState(false);
    const filterButtonRef = useRef(null);
    const dropdownRef = useRef(null);

    // Move filteredEvents into useMemo to ensure inviteCounts is initialized
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const searchLower = searchTerm.toLowerCase();
            let matchesSearch = true;

            switch (filterColumn) {
                case "evenement":
                    matchesSearch = event.nom?.toLowerCase().includes(searchLower);
                    break;
                case "lieu":
                    matchesSearch = event.salle?.nom.toLowerCase().includes(searchLower);
                    break;
                case "date":
                    matchesSearch = new Date(event.date).toLocaleDateString('fr-FR').includes(searchLower);
                    break;
                case "invites":
                    matchesSearch = (inviteCounts[event.id] || 0).toString().includes(searchLower);
                    break;
                case "personnel":
                    matchesSearch = (personnelCounts[event.id]?.total || 0).toString().includes(searchLower);
                    break;
                case "capacite":
                    matchesSearch = (tableCapacities[event.id] || 0).toString().includes(searchLower);
                    break;
                case "statut":
                    matchesSearch = event.statut?.toLowerCase().includes(searchLower);
                    break;
                case "tous":
                default:
                    matchesSearch =
                        event.nom?.toLowerCase().includes(searchLower) ||
                        event.salle?.nom.toLowerCase().includes(searchLower);
                    break;
            }

            return matchesSearch;
        });
    }, [events, searchTerm, filterColumn, inviteCounts, personnelCounts, tableCapacities]);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                filterButtonRef.current &&
                dropdownRef.current &&
                !filterButtonRef.current.contains(event.target) &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowFilterDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        // 1. Vérification initiale pour éviter les requêtes inutiles.
        // La requête ne se lance que si un événement est sélectionné et si l'utilisateur est authentifié.
        if (!selectedEvent?.id || !isAuthenticated) {
            setTables([]);
            setGuests([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 2. Exécution des deux requêtes API en parallèle pour une meilleure performance.
                const [guestsData, tablesResponse] = await Promise.all([
                    getGuestsByEventId(selectedEvent.id),
                    axiosClient.get(`/tables/event/${selectedEvent.id}`)
                ]);

                // 3. Traitement des données des invités.
                setGuests(guestsData);

                // 4. Traitement des données des tables.
                if (Array.isArray(tablesResponse.data)) {
                    // Pour chaque table, on calcule le nombre d'invités et le statut en fonction des données d'invités récupérées.
                    const updatedTables = tablesResponse.data.map(table => {
                        const guestsAtThisTable = guestsData.filter(guest => guest.table_id === table.id);
                        const invitesCount = guestsAtThisTable.length;
                        const status = invitesCount === table.capacite ? "Complète" : "Disponible";

                        return {
                            ...table,
                            invites: invitesCount,
                            statut: status
                        };
                    });

                    setTables(updatedTables);
                } else {
                    // En cas de format de données incorrect, on gère l'erreur et vide les tables.
                    console.error("API response for tables is not an array:", tablesResponse.data);
                    setTables([]);
                    setError("Les données de tables reçues ne sont pas au format attendu.");
                }

            } catch (err) {
                // 5. Gestion centralisée des erreurs.
                console.error("Erreur lors du chargement des données:", err);
                if (err.response?.status === 401) {
                    setError("Non autorisé. Veuillez vérifier votre connexion.");
                } else {
                    setError("Impossible de charger les données. Veuillez réessayer.");
                }
                setTables([]);
                setGuests([]);
            } finally {
                // 6. Fin du chargement, quel que soit le résultat.
                setIsLoading(false);
            }
        };

        fetchData();
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

    // Récupération des capacités des tables pour chaque événement
    // useEffect(() => {
    //     const fetchTableCapacities = async () => {
    //         if (!isAuthenticated || events.length === 0) {
    //             console.log("fetchTableCapacities: Skipped due to isAuthenticated:", isAuthenticated, "or events.length:", events.length);
    //             return;
    //         }

    //         setIsTableCapacitiesLoading(true);
    //         const capacities = {};
    //         for (const event of events) {
    //             let retries = 3;
    //             while (retries > 0) {
    //                 try {
    //                     console.log(`Fetching tables for event ${event.id}, attempt ${4 - retries}`);
    //                     const response = await axiosClient.get(`/tables/event/${event.id}`);
    //                     console.log(`Response for event ${event.id}:`, response.data);

    //                     let totalCapacity = 0;
    //                     if (Array.isArray(response.data)) {
    //                         totalCapacity = response.data.reduce((sum, table) => sum + (table.capacite || 0), 0);
    //                     } else if (response.data && typeof response.data === 'object' && response.data.capacite) {
    //                         totalCapacity = response.data.capacite;
    //                     } else {
    //                         console.warn(`Unexpected response format for event ${event.id}:`, response.data);
    //                         totalCapacity = 0;
    //                     }
    //                     capacities[event.id] = totalCapacity;
    //                     break; // Success, exit retry loop
    //                 } catch (error) {
    //                     console.error(`Erreur récupération tables pour événement ${event.id}:`, error.message, error.response?.data);
    //                     retries--;
    //                     if (retries === 0) {
    //                         capacities[event.id] = 0;
    //                     }
    //                     await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    //                 }
    //             }
    //         }
    //         setTableCapacities(capacities);
    //         setIsTableCapacitiesLoading(false);
    //         console.log("Updated tableCapacities:", capacities);
    //     };

    //     fetchTableCapacities();
    // }, [events, isAuthenticated]);

    // Récupération des invités comptés par événement
    useEffect(() => {
        const fetchInviteCounts = async () => {
            if (!isAuthenticated || events.length === 0) return;

            const counts = {};
            for (const event of events) {
                try {
                    const guestsData = await getGuestsByEventId(event.id);
                    counts[event.id] = guestsData.length;
                } catch (error) {
                    console.error(`Erreur récupération invités pour événement ${event.id}:`, error);
                    counts[event.id] = 0;
                }
            }
            setInviteCounts(counts);
        };

        fetchInviteCounts();
    }, [events, isAuthenticated]);

    // Récupération du personnel compté par événement
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

    const getEventStatutColor = (isPublic, statut) => {
        switch (isPublic, statut) {
            case "Privée": return "bg-emerald-500 text-white";
            case "Public": return "bg-blue-500 text-white";
            case "Terminé": return "bg-gray-500 text-white";
            default: return "bg-gray-400 text-white";
        }
    };




    // Handle filter column selection
    const handleFilterChange = (value) => {
        setFilterColumn(value);
        setShowFilterDropdown(false);
    };

    if (isLoading && events.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm sm:text-base">Chargement des événements...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[86vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header avec design moderne */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="mb-4 sm:mb-0">
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Dashboard Événements
                            </h1>
                            <p className="text-gray-500 mt-2 text-sm sm:text-base">Gérez vos événements et suivez leur progression en temps réel</p>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium">
                                {events.length} Événements
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                {/* Barre de recherche et filtres */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="relative w-full sm:flex-1 sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
                            <input
                                type="text"
                                placeholder={`Rechercher par ${filterColumn === "tous" ? "nom ou lieu" : filterColumn === "evenement" ? "nom" : filterColumn === "lieu" ? "lieu" : filterColumn === "date" ? "date" : filterColumn === "invites" ? "nombre d'invités" : filterColumn === "personnel" ? "nombre de personnel" : filterColumn === "capacite" ? "capacité tables" : "statut"}...`}
                                className="w-full pl-8 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-auto" ref={filterButtonRef}>
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full sm:w-auto text-sm sm:text-base"
                            >
                                <Filter className="w-4 sm:w-5 h-4 sm:h-5" />
                                <span>Filtres</span>
                            </button>
                            {showFilterDropdown && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute left-0 sm:right-0 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                                >
                                    <ul className="py-1">
                                        {[
                                            { value: "tous", label: "Tous" },
                                            { value: "evenement", label: "Événement" },
                                            { value: "lieu", label: "Lieu" },
                                            { value: "date", label: "Date" },
                                            { value: "invites", label: "Invités" },
                                            { value: "personnel", label: "Personnel" },
                                            { value: "capacite", label: "Capacité Tables" },
                                            { value: "statut", label: "Statut" }
                                        ].map((option) => (
                                            <li
                                                key={option.value}
                                                onClick={() => handleFilterChange(option.value)}
                                                className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors"
                                            >
                                                {option.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"} flex-1 sm:flex-none`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"} flex-1 sm:flex-none`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Affichage des erreurs */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8 shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <X className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                            </div>
                            <p className="text-red-800 font-medium text-sm sm:text-lg">{error}</p>
                        </div>
                    </div>
                )}

                {/* Liste des événements */}
                {viewMode === "list" ? (
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
                                    <tr>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Événement</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Lieu</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Invités</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Personnel</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Statut</th>
                                        <th className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-center text-xs sm:text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {filteredEvents.map((event) => {
                                        const personnelData = personnelCounts[event.id] || { total: 0, assigned: 0 };

                                        return (
                                            <tr key={event.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group">
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <div className="flex items-center space-x-2 sm:space-x-4">
                                                        <div>
                                                            <div className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{event.nom}</div>
                                                            <div className="text-xs sm:text-sm text-gray-500 font-medium">#{event.id.toString().padStart(4, '0')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                            <Clock className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
                                                        </div>
                                                        <span className="text-gray-900 font-semibold text-sm sm:text-lg">
                                                            {new Date(event.date).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                            <House className="w-4 sm:w-5 h-4 sm:h-5 text-purple-600" />
                                                        </div>
                                                        <span className="text-gray-700 font-medium text-sm sm:text-base">{event.salle?.nom}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                                                        </div>
                                                        <span className="text-blue-700 font-bold text-sm sm:text-lg">{inviteCounts[event.id] || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                            <Briefcase className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600" />
                                                        </div>
                                                        <span className="text-emerald-700 font-bold text-sm sm:text-lg">{personnelData.total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                                                    <span
                                                        className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-lg ${event.isPublic
                                                            ? "bg-blue-200 text-blue-700 border border-blue-500"
                                                            : "bg-purple-200 text-purple-700 border border-purple-500"
                                                            }`}
                                                    >
                                                        {event.isPublic ? "Public" : "Privée"}
                                                    </span>
                                                </td>


                                                <td className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 text-center">
                                                    <button
                                                        onClick={() => openEventModal(event)}
                                                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white text-xs sm:text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-2xl"
                                                    >
                                                        <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {filteredEvents.map((event) => {
                            const personnelData = personnelCounts[event.id] || { total: 0, assigned: 0 };

                            return (
                                <div key={event.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1 group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative p-4 sm:p-6 md:p-8">
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <div className="flex-shrink-0 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                                                <Calendar className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
                                            </div>
                                            <span
                                                className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs sm:text-sm font-bold shadow-lg ${event.isPublic
                                                    ? "bg-blue-200 text-blue-700 border border-blue-500"
                                                    : "bg-purple-200 text-purple-700 border border-purple-500"
                                                    }`}
                                            >
                                                {event.isPublic ? "Public" : "Privée"}
                                            </span>
                                        </div>

                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-indigo-700 transition-colors">{event.nom}</h3>

                                        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-8">
                                            <div className="flex items-center text-gray-600 bg-gray-50 rounded-2xl p-2 sm:p-3">
                                                <Clock className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 text-indigo-500" />
                                                <span className="font-medium text-sm sm:text-base">{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                                            </div>

                                            <div className="flex items-center text-gray-600 bg-gray-50 rounded-2xl p-2 sm:p-3">
                                                <House className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 text-purple-500" />
                                                <span className="font-medium text-sm sm:text-base">{event.salle?.nom || "Non précisé"}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
                                            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-lg">
                                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{inviteCounts[event.id] || 0}</div>
                                                <div className="text-xs sm:text-sm font-semibold text-blue-500 uppercase tracking-wider">Invités</div>
                                            </div>
                                            <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 shadow-lg">
                                                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">{personnelData.total}</div>
                                                <div className="text-xs sm:text-sm font-semibold text-purple-500 uppercase tracking-wider">Personnel</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => openEventModal(event)}
                                            className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-sm sm:text-base"
                                        >
                                            <Eye className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                                            Voir les détails
                                            <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 ml-2 sm:ml-3" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {filteredEvents.length === 0 && !isLoading && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-12 text-center">
                        <Calendar className="w-12 sm:w-16 h-12 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
                        <p className="text-gray-500 text-sm sm:text-base">
                            {searchTerm ? "Aucun événement ne correspond à vos critères." : "Vous n'avez pas encore d'événements."}
                        </p>
                    </div>
                )}
            </div>

            {/* Modal détails événement */}
            {modalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in duration-300">
                    <div className="bg-white/95 backdrop-blur-2xl rounded-[1rem] sm:rounded-[2rem] shadow-2xl border border-white/20 w-full max-w-[95vw] sm:max-w-4xl md:max-w-5xl lg:max-w-7xl max-h-[90vh] sm:max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
                            <div className="absolute -top-10 -left-10 w-24 sm:w-32 h-24 sm:h-32 bg-blue-400/30 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 bg-purple-400/20 rounded-full blur-3xl"></div>

                            <div className="relative flex justify-between items-start text-white">
                                <div className="flex flex-col space-y-4">
                                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                        {selectedEvent.nom}
                                    </h3>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-8 text-blue-100/90">
                                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-xl border border-white/20">
                                            <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-blue-300" />
                                            <span className="font-medium text-sm sm:text-base">
                                                {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-xl border border-white/20">
                                            <MapPin className="w-3 sm:w-4 h-3 sm:h-4 text-purple-300" />
                                            <span className="font-medium text-sm sm:text-base">{selectedEvent.salle?.nom}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 sm:p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 border border-white/20 backdrop-blur-sm group mt-4 md:mt-0"
                                >
                                    <X className="w-4 sm:w-5 h-4 sm:h-5 group-hover:rotate-90 transition-transform duration-200" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(90vh-140px)]">
                            <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100">
                                <nav className="flex flex-wrap gap-2 bg-gray-100/60 p-1.5 rounded-2xl backdrop-blur-sm">
                                    {[
                                        { id: "invites", label: "Invités", icon: Users, count: guests.length, color: "blue" },
                                        { id: "personnel", label: "Personnel", icon: User, count: personnel.length, color: "purple" },
                                        { id: "tables", label: "Tables", icon: Grid3X3, count: tables.length, color: "emerald" }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative group ${activeTab === tab.id
                                                ? `bg-white shadow-lg shadow-${tab.color}-500/10 text-${tab.color}-600 border border-${tab.color}-100`
                                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                                                }`}
                                        >
                                            <tab.icon className={`w-3 sm:w-4 h-3 sm:h-4 ${activeTab === tab.id ? `text-${tab.color}-500` : 'text-gray-400'} transition-colors`} />
                                            <span>{tab.label}</span>
                                            <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-bold transition-all ${activeTab === tab.id
                                                ? `bg-${tab.color}-100 text-${tab.color}-700`
                                                : "bg-gray-200 text-gray-600"
                                                }`}>
                                                {tab.count}
                                            </span>
                                            {activeTab === tab.id && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-gray-50/30">
                                {isLoading && (
                                    <div className="flex items-center justify-center py-8 sm:py-16">
                                        <div className="relative">
                                            <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-4 border-blue-200"></div>
                                            <div className="animate-spin rounded-full h-8 sm:h-12 w-8 sm:w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                                        </div>
                                        <span className="text-gray-600 ml-2 sm:ml-4 font-medium text-sm sm:text-base">Chargement des données...</span>
                                    </div>
                                )}

                                {/* Onglet Invités */}
                                {activeTab === "invites" && !isLoading && (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100">Nom</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100">Email</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100">Téléphone</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {guests.map((guest, index) => (
                                                        <tr key={guest.id} className={`hover:bg-blue-50/50 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'}`}>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 font-semibold text-gray-900 group-hover:text-blue-900 transition-colors text-sm sm:text-base">
                                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                                    <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                                                                    <span>{guest.nom}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-gray-600 group-hover:text-gray-700 transition-colors text-sm sm:text-base">{guest.email}</td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-gray-600 group-hover:text-gray-700 transition-colors text-sm sm:text-base">{guest.telephone}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Onglet Personnel */}
                                {activeTab === "personnel" && !isLoading && (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100">Nom</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100">Rôle</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100">Téléphone</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-purple-600 uppercase tracking-widest border-b border-purple-100">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {personnel.map((p, index) => (
                                                        <tr key={p.id} className={`hover:bg-purple-50/50 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'}`}>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 font-semibold text-gray-900 group-hover:text-purple-900 transition-colors text-sm sm:text-base">
                                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                                    <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:bg-purple-600 transition-colors"></div>
                                                                    <span>{p.nom}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">
                                                                <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm">
                                                                    {p.role}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-gray-600 group-hover:text-gray-700 transition-colors text-sm sm:text-base">{p.telephone}</td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">
                                                                <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs font-bold border shadow-sm ${getPersonnelStatutColor(p.statut)}`}>
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
                                {activeTab === "tables" && !isLoading && tables.length > 0 && (
                                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gradient-to-r from-emerald-50 to-green-50">
                                                    <tr>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100">Nom de Table</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100">Capacité</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100">Invités</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100">Places</th>
                                                        <th className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-left text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100">Statut</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tables.map((t, index) => (
                                                        <tr key={t.id} className={`hover:bg-emerald-50/50 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'}`}>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors text-sm sm:text-base">
                                                                <div className="flex items-center space-x-2 sm:space-x-3">
                                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:bg-emerald-600 transition-colors"></div>
                                                                    <span>{t.nom}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-gray-600 group-hover:text-gray-700 transition-colors font-medium text-sm sm:text-base">{t.capacite}</td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5 text-gray-600 group-hover:text-gray-700 transition-colors font-medium text-sm sm:text-base">{t.placeReserve}</td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">
                                                                <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                                                                    {t.capacite - t.placeReserve} place{t.capacite - t.placeReserve > 1 ? "s" : ""} disponible{t.capacite - t.placeReserve > 1 ? "s" : ""}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 sm:px-6 md:px-8 py-3 sm:py-5">
                                                                <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-2xl text-xs font-bold shadow-sm ${t.capacite - t.placeReserve === 0 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
                                                                    {t.capacite - t.placeReserve === 0 ? 'Non disponible' : 'Disponible'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Gestion des états de chargement, d'erreur et de données vides */}
                                {activeTab === "tables" && isLoading && (
                                    <div className="text-center py-6 sm:py-10 text-gray-500 text-sm sm:text-base">
                                        Chargement des tables...
                                    </div>
                                )}

                                {activeTab === "tables" && !isLoading && tables.length === 0 && (
                                    <div className="text-center py-6 sm:py-10 text-gray-500 text-sm sm:text-base">
                                        Aucune table disponible pour cet événement.
                                    </div>
                                )}

                                {activeTab === "tables" && error && (
                                    <div className="text-center py-6 sm:py-10 text-red-500 font-medium text-sm sm:text-base">
                                        {error}
                                    </div>
                                )}

                                {/* États vides avec design moderne */}
                                {activeTab === "invites" && guests.length === 0 && !isLoading && (
                                    <div className="text-center py-12 sm:py-24">
                                        <div className="relative w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-4 sm:mb-8">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full blur-xl opacity-20"></div>
                                            <div className="relative w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <Users className="w-12 sm:w-16 h-12 sm:h-16 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 tracking-tight">Aucun invité inscrit</h3>
                                        <p className="text-gray-600 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">Commencez par ajouter des invités à cet événement pour voir la magie opérer.</p>
                                    </div>
                                )}

                                {activeTab === "personnel" && personnel.length === 0 && !isLoading && (
                                    <div className="text-center py-12 sm:py-24">
                                        <div className="relative w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-4 sm:mb-8">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-full blur-xl opacity-20"></div>
                                            <div className="relative w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <User className="w-12 sm:w-16 h-12 sm:h-16 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 tracking-tight">Équipe en attente</h3>
                                        <p className="text-gray-600 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">Assignez du personnel qualifié pour garantir le succès de votre événement.</p>
                                    </div>
                                )}

                                {activeTab === "tables" && tables.length === 0 && !isLoading && (
                                    <div className="text-center py-12 sm:py-24">
                                        <div className="relative w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-4 sm:mb-8">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-full blur-xl opacity-20"></div>
                                            <div className="relative w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <Grid3X3 className="w-12 sm:w-16 h-12 sm:h-16 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 tracking-tight">Plan de tables vide</h3>
                                        <p className="text-gray-600 text-sm sm:text-lg max-w-md mx-auto leading-relaxed">Les tables seront générées intelligemment selon le nombre d'invités confirmés.</p>
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