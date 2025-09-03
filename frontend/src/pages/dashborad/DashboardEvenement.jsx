import React, { useEffect, useState } from "react";
import {
    Calendar,
    Users,
    UserCheck,
    Table as TableIcon,
    MapPin,
    Eye,
    X,
    Phone,
    Mail,
    User,
    List,
    LayoutGrid
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
            case "Confirmé": return "bg-green-100 text-green-800";
            case "En attente": return "bg-yellow-100 text-yellow-800";
            case "Décliné": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getPersonnelStatutColor = (statut) => {
        switch (statut) {
            case "Assigné": return "bg-blue-100 text-blue-800";
            case "En attente": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTableStatutColor = (statut) => {
        switch (statut) {
            case "Complète": return "bg-green-100 text-green-800";
            case "Disponible": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-[86vh] p-6 bg-gray-50">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Événements</h1>
                    <p className="text-gray-600">Vue d'ensemble de tous vos événements</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg border ${viewMode === "list"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300"
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("card")}
                        className={`p-2 rounded-lg border ${viewMode === "card"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-300"
                            }`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">{error}</div>}

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Événements Récents</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 text-gray-600">Chargement...</div>
                    ) : (
                        <div className="p-6">
                            {viewMode === "list" ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {events.map((event) => (
                                                <tr key={event.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">{event.nom}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(event.date).toLocaleDateString('fr-FR')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => openEventModal(event)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center cursor-pointer"
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" /> Voir détails
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {events.map((event) => (
                                        <div key={event.id} className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 p-6">
                                            <h3 className="text-lg font-semibold text-gray-900">{event.nom}</h3>
                                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                                            <button
                                                onClick={() => openEventModal(event)}
                                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md flex items-center justify-center"
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> Voir les détails
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal détails événement */}
            {modalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 flex justify-between items-center">
                            <div className="text-white">
                                <h3 className="text-xl font-semibold">{selectedEvent.nom}</h3>
                                <p className="text-blue-100">{new Date(selectedEvent.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <button onClick={closeModal} className="text-white hover:text-gray-200">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                            <nav className="mb-4 flex space-x-8 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("invites")}
                                    className={`pb-2 text-sm font-medium ${activeTab === "invites" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Invités
                                </button>
                                <button
                                    onClick={() => setActiveTab("personnel")}
                                    className={`pb-2 text-sm font-medium ${activeTab === "personnel" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Personnel
                                </button>
                                <button
                                    onClick={() => setActiveTab("tables")}
                                    className={`pb-2 text-sm font-medium ${activeTab === "tables" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                                >
                                    Tables
                                </button>
                            </nav>

                            {/* Onglet Invités */}
                            {activeTab === "invites" && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {guests.map((guest) => (
                                                <tr key={guest.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">{guest.nom}</td>
                                                    <td className="px-4 py-4">{guest.email}</td>
                                                    <td className="px-4 py-4">{guest.telephone}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Onglet Personnel Dynamique */}
                            {activeTab === "personnel" && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {personnel.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">{p.nom}</td>
                                                    <td className="px-4 py-4">{p.role}</td>
                                                    <td className="px-4 py-4">{p.telephone}</td>
                                                    <td className={`px-4 py-4 ${getPersonnelStatutColor(p.statut)} rounded-full text-center`}>{p.statut}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Onglet Tables */}
                            {activeTab === "tables" && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Table</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invités</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tables.map((t) => (
                                                <tr key={t.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">{t.numero}</td>
                                                    <td className="px-4 py-4">{t.capacite}</td>
                                                    <td className="px-4 py-4">{t.invites}</td>
                                                    <td className={`px-4 py-4 ${getTableStatutColor(t.statut)} rounded-full text-center`}>{t.statut}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
