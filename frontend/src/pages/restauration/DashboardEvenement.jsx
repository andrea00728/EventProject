import React, { useState } from "react";
import {
    Calendar,
    Users,
    UserCheck,
    Table as TableIcon,
    TrendingUp,
    Clock,
    MapPin,
    CheckCircle,
    AlertCircle,
    Activity,
    MoreVertical,
    Star,
    Eye,
    X,
    Phone,
    Mail,
    User,
    Settings,
    Badge
} from "lucide-react";

export default function DashboardEvenement() {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("invites");


    const [statsGenerales] = useState({
        totalEvenements: 24,
        evenementsActifs: 5,
        totalInvites: 2856,
        totalPersonnel: 148,
        totalTables: 286,
        tauxReussite: 96
    });

    const [evenementsRecents] = useState([
        {
            id: 1,
            nom: "Mariage Sophie & Marc",
            date: "2025-09-05",
            statut: "En cours",
            invites: 120,
            lieu: "Château de Malmaison",
            type: "Mariage",
            priorite: "Haute",
            description: "Célébration du mariage de Sophie et Marc dans un cadre élégant et romantique.",
            organisateur: "Marie Dubois",
            invitesList: [
                { id: 1, nom: "Jean Dupont", email: "jean.dupont@email.com", telephone: "+33 6 12 34 56 78", statut: "Confirmé", table: 1 },
                { id: 2, nom: "Marie Martin", email: "marie.martin@email.com", telephone: "+33 6 98 76 54 32", statut: "En attente", table: 2 },
                { id: 3, nom: "Pierre Durand", email: "pierre.durand@email.com", telephone: "+33 6 11 22 33 44", statut: "Confirmé", table: 1 },
                { id: 4, nom: "Sophie Moreau", email: "sophie.moreau@email.com", telephone: "+33 6 55 66 77 88", statut: "Décliné", table: null },
            ],
            personnelList: [
                { id: 1, nom: "Chef Antoine", role: "Chef Cuisinier", telephone: "+33 6 12 12 12 12", statut: "Assigné" },
                { id: 2, nom: "Julie Photographer", role: "Photographe", telephone: "+33 6 34 34 34 34", statut: "Assigné" },
                { id: 3, nom: "Marc DJ", role: "DJ", telephone: "+33 6 56 56 56 56", statut: "En attente" },
                { id: 4, nom: "Anna Fleuriste", role: "Fleuriste", telephone: "+33 6 78 78 78 78", statut: "Assigné" }
            ],
            tablesList: [
                { id: 1, numero: 1, capacite: 8, invites: 8, statut: "Complète" },
                { id: 2, numero: 2, capacite: 10, invites: 8, statut: "Disponible" },
                { id: 3, numero: 3, capacite: 6, invites: 6, statut: "Complète" },
                { id: 4, numero: 4, capacite: 8, invites: 4, statut: "Disponible" }
            ]
        },
        {
            id: 2,
            nom: "Conférence Tech Summit",
            date: "2025-09-08",
            statut: "Planifié",
            invites: 300,
            lieu: "Centre des Congrès",
            type: "Conférence",
            priorite: "Moyenne",
            description: "Conférence technologique rassemblant les leaders de l'industrie tech.",
            organisateur: "Tech Events Co.",
            invitesList: [
                { id: 1, nom: "Dr. Sarah Johnson", email: "sarah.johnson@tech.com", telephone: "+33 6 11 11 11 11", statut: "Confirmé", table: 5 },
                { id: 2, nom: "Mark Stevens", email: "mark.stevens@startup.com", telephone: "+33 6 22 22 22 22", statut: "Confirmé", table: 6 },
                { id: 3, nom: "Lisa Chen", email: "lisa.chen@innovation.com", telephone: "+33 6 33 33 33 33", statut: "En attente", table: 7 }
            ],
            personnelList: [
                { id: 1, nom: "Paul Technique", role: "Technicien Audio/Vidéo", telephone: "+33 6 44 44 44 44", statut: "Assigné" },
                { id: 2, nom: "Emma Accueil", role: "Responsable Accueil", telephone: "+33 6 55 55 55 55", statut: "Assigné" },
                { id: 3, nom: "Tom Sécurité", role: "Agent de Sécurité", telephone: "+33 6 66 66 66 66", statut: "Assigné" }
            ],
            tablesList: [
                { id: 5, numero: 5, capacite: 12, invites: 10, statut: "VIP" },
                { id: 6, numero: 6, capacite: 15, invites: 12, statut: "Standard" },
                { id: 7, numero: 7, capacite: 10, invites: 8, statut: "Standard" }
            ]
        },
        {
            id: 3,
            nom: "Gala de Charité",
            date: "2025-09-12",
            statut: "Planifié",
            invites: 200,
            lieu: "Hôtel Ritz",
            type: "Gala",
            priorite: "Haute",
            description: "Gala de bienfaisance pour soutenir les enfants défavorisés.",
            organisateur: "Association Espoir",
            invitesList: [
                { id: 1, nom: "Mme Aristocrate", email: "contact@aristocrate.fr", telephone: "+33 6 77 77 77 77", statut: "Confirmé", table: 8 },
                { id: 2, nom: "M. Philanthrope", email: "don@philanthrope.org", telephone: "+33 6 88 88 88 88", statut: "Confirmé", table: 9 }
            ],
            personnelList: [
                { id: 1, nom: "Claire Protocole", role: "Chef de Protocole", telephone: "+33 6 99 99 99 99", statut: "Assigné" },
                { id: 2, nom: "Vincent Service", role: "Maître d'Hôtel", telephone: "+33 6 00 00 00 00", statut: "Assigné" }
            ],
            tablesList: [
                { id: 8, numero: 8, capacite: 10, invites: 8, statut: "VIP" },
                { id: 9, numero: 9, capacite: 8, invites: 6, statut: "Premium" }
            ]
        },
        {
            id: 4,
            nom: "Séminaire Corporate",
            date: "2025-09-15",
            statut: "En préparation",
            invites: 80,
            lieu: "Business Center",
            type: "Séminaire",
            priorite: "Faible",
            description: "Séminaire de formation pour les équipes commerciales.",
            organisateur: "RH Solutions",
            invitesList: [
                { id: 1, nom: "Équipe Ventes Paris", email: "ventes.paris@corp.com", telephone: "+33 6 11 22 33 44", statut: "Confirmé", table: 10 }
            ],
            personnelList: [
                { id: 1, nom: "Formateur Expert", role: "Consultant Formation", telephone: "+33 6 55 44 33 22", statut: "En attente" }
            ],
            tablesList: [
                { id: 10, numero: 10, capacite: 20, invites: 18, statut: "Formation" }
            ]
        }
    ]);

    const [activitesRecentes] = useState([
        {
            id: 1,
            action: "Nouveau invité ajouté",
            evenement: "Mariage Sophie & Marc",
            temps: "Il y a 2 heures",
            type: "invite"
        },
        {
            id: 2,
            action: "Personnel assigné",
            evenement: "Conférence Tech Summit",
            temps: "Il y a 4 heures",
            type: "personnel"
        },
        {
            id: 3,
            action: "Tables réorganisées",
            evenement: "Gala de Charité",
            temps: "Il y a 6 heures",
            type: "table"
        },
        {
            id: 4,
            action: "Événement créé",
            evenement: "Séminaire Corporate",
            temps: "Hier",
            type: "evenement"
        }
    ]);

    const getStatutColor = (statut) => {
        switch (statut) {
            case "En cours": return "bg-green-100 text-green-800";
            case "Planifié": return "bg-blue-100 text-blue-800";
            case "En préparation": return "bg-orange-100 text-orange-800";
            case "Terminé": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getPrioriteColor = (priorite) => {
        switch (priorite) {
            case "Haute": return "bg-red-100 text-red-800 border-red-200";
            case "Moyenne": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Faible": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "invite": return <UserCheck className="w-4 h-4" />;
            case "personnel": return <Users className="w-4 h-4" />;
            case "table": return <TableIcon className="w-4 h-4" />;
            case "evenement": return <Calendar className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
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
            case "Indisponible": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTableStatutColor = (statut) => {
        switch (statut) {
            case "Complète": return "bg-green-100 text-green-800";
            case "Disponible": return "bg-blue-100 text-blue-800";
            case "VIP": return "bg-purple-100 text-purple-800";
            case "Premium": return "bg-indigo-100 text-indigo-800";
            case "Standard": return "bg-gray-100 text-gray-800";
            case "Formation": return "bg-teal-100 text-teal-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const openEventModal = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedEvent(null);
    };

    return (
        <div className="min-h-screen">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Événements</h1>
                <p className="text-gray-600">Vue d'ensemble de tous vos événements et activités</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Événements récents */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Événements Récents</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Événement
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invités
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Lieu
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priorité
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {evenementsRecents.map((evenement) => (
                                        <tr key={evenement.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-white">
                                                                {evenement.nom.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {evenement.nom}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {evenement.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(evenement.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(evenement.statut)}`}>
                                                    {evenement.statut}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 text-gray-400 mr-1" />
                                                    {evenement.invites}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="truncate max-w-32">{evenement.lieu}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPrioriteColor(evenement.priorite)}`}>
                                                    {evenement.priorite}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openEventModal(evenement)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center cursor-pointer"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Voir détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Activités récentes */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Activités Récentes</h2>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {activitesRecentes.map((activite, index) => (
                                    <div key={activite.id} className={`flex items-start space-x-3 ${index < activitesRecentes.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}>
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <div className="text-white">
                                                    {getTypeIcon(activite.type)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activite.action}
                                            </p>
                                            <p className="text-sm text-blue-600 font-medium">
                                                {activite.evenement}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {activite.temps}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal des détails de l'événement */}
            {modalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                        {/* En-tête du modal */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <h3 className="text-xl font-semibold">{selectedEvent.nom}</h3>
                                    <p className="text-blue-100">{selectedEvent.type} • {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">

                            {/* Onglets */}
                            <div className="px-6">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab("invites")}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "invites"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            Liste des Invités ({selectedEvent.invitesList.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("personnel")}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "personnel"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            Personnel ({selectedEvent.personnelList.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("tables")}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "tables"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                }`}
                                        >
                                            Tables ({selectedEvent.tablesList.length})
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Contenu des onglets */}
                            <div className="px-6 py-4">
                                {/* Liste des invités */}
                                {activeTab === "invites" && (
                                    <div className="mb-8">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <Users className="w-5 h-5 mr-2 text-blue-600" />
                                            Liste des Invités
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Nom
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Email
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Téléphone
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Table
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedEvent.invitesList.map((invite) => (
                                                        <tr key={invite.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                                                        <User className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {invite.nom}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center text-sm text-gray-900">
                                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {invite.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center text-sm text-gray-900">
                                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {invite.telephone}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getInviteStatutColor(
                                                                        invite.statut
                                                                    )}`}
                                                                >
                                                                    {invite.statut}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {invite.table ? `Table ${invite.table}` : "Non assigné"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Liste du personnel */}
                                {activeTab === "personnel" && (
                                    <div className="mb-8">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <UserCheck className="w-5 h-5 mr-2 text-purple-600" />
                                            Personnel Assigné
                                        </h4>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Nom
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Rôle
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Téléphone
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                            Statut
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedEvent.personnelList.map((personnel) => (
                                                        <tr key={personnel.id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                                                        <Badge className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {personnel.nom}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {personnel.role}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <div className="flex items-center text-sm text-gray-900">
                                                                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                                    {personnel.telephone}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPersonnelStatutColor(
                                                                        personnel.statut
                                                                    )}`}
                                                                >
                                                                    {personnel.statut}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Liste des tables */}
                                {activeTab === "tables" && (
                                    <div className="mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <TableIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                            Configuration des Tables
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {selectedEvent.tablesList.map((table) => (
                                                <div
                                                    key={table.id}
                                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-medium text-gray-900">
                                                            Table {table.numero}
                                                        </h5>
                                                        <span
                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTableStatutColor(
                                                                table.statut
                                                            )}`}
                                                        >
                                                            {table.statut}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <div className="flex items-center justify-between">
                                                            <span>Capacité:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {table.capacite} places
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span>Occupée:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {table.invites}/{table.capacite}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Dernière mise à jour: Il y a 2 heures</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            Exporter
                                        </button>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}