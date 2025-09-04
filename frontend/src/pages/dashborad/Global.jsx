// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useStateContext } from "../../context/ContextProvider";
import { FaBullseye } from 'react-icons/fa'; // Import de l'icône pour les objectifs
import { useNavigate } from 'react-router-dom';
import { getAllManagerEvents } from '../../services/evenementServ';
import { getUserForfait } from '../../services/forfaitService'; // Import de la fonction
import { Crown, Gem, Handshake, PlusCircle, Rocket, Star, Target, Users } from 'lucide-react';

const DashboardGlobal = () => {
    const navigate = useNavigate();
    const { user, isLoading } = useStateContext();
    const [dashboardData, setDashboardData] = useState({
        plan: 'Aucun forfait',
        eventPoints: 0,
        eventsCreated: 0,
        upcomingEvents: 0,
    });

    // Ajout d'un état pour les objectifs personnalisés
    const [goals, setGoals] = useState({
        monthlyEvents: 3, // Exemple d'objectif
        attendeesTarget: 50,
    });

    // On utilise useEffect pour mettre à jour l'état du dashboard
    // lorsque les données de l'utilisateur changent
    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                let userForfait = {};
                try {
                    // Récupérer le forfait de l'utilisateur
                    const forfaitData = await getUserForfait();
                    if (forfaitData?.forfait) {
                        userForfait = forfaitData.forfait;
                    }
                } catch (err) {
                    console.error("Erreur lors de la récupération du forfait de l'utilisateur :", err);
                }

                setDashboardData(prevData => ({
                    ...prevData,
                    plan: userForfait.nom || 'Aucun forfait',
                    // Supposons que ces données se trouvent dans l'objet 'user'
                    eventPoints: user.eventPoints || 0,
                    eventsCreated: user.eventsCreated || 0,
                    upcomingEvents: user.upcomingEvents || 0,
                }));

                // Mettre à jour les objectifs si l'utilisateur en a
                // if (user.goals) {
                //   setGoals(user.goals);
                // }
            }
        };

        fetchUserData();
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllManagerEvents(user.id || user.sub);
            console.log("Données récupérés : ", data);
            setDashboardData(prevData => ({
                ...prevData,
                eventsCreated: data.length, // Exemple de mise à jour dynamique
                upcomingEvents: data.filter(event => new Date(event.date) > new Date()).length,
            }));
        };
        if (user && (user.id || user.sub)) {
            fetchData();
        }
    }, [user]);

    if (isLoading) {
        return <p className="text-center text-gray-600">Chargement des données du tableau de bord...</p>;
    }

    // Si l'utilisateur n'est pas disponible, on affiche un message
    if (!user) {
        return <p className="text-center text-gray-600">Veuillez vous connecter pour voir le tableau de bord.</p>;
    }

    const handleCreateEvent = () => {
        navigate('/evenement');
    };

    const handleManageGuests = () => {
        navigate('/evenement/invites');
    };

    const handleGoalChange = (key, increment) => {
        setGoals(prevGoals => {
            const newValue = prevGoals[key] + increment;
            return {
                ...prevGoals,
                [key]: newValue > 0 ? newValue : prevGoals[key]
            };
        });
    };

    const getPlanIcon = (planName) => {
        const plan = planName.toLowerCase();
        switch (plan) {
            case 'starter':
                return <Rocket className="w-12 h-12 text-blue-500" strokeWidth={2.5} />;
            case 'pro':
                return <Star className="w-12 h-12 text-purple-500" strokeWidth={2.5} />;
            case 'premium':
                return <Gem className="w-12 h-12 text-pink-500" strokeWidth={2.5} />;
            case 'gold':
                return <Crown className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-[86vh] bg-gray-100 p-8 font-sans overflow-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-8 text-gray-900">
                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                        <div className="flex items-center gap-4">
                            <Handshake className="w-10 h-10 text-[#4c7ff7] flex-shrink-0" strokeWidth={2.5} />
                            <h1 className="text-4xl font-extrabold">
                                Bienvenue sur votre Tableau de Bord,
                            </h1>
                        </div>
                        <span className="bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent text-4xl font-extrabold mt-2 md:mt-0">
                        {user.name || 'Organisateur'}
                        </span>
                    </div>
                    <p className="mt-2 text-lg text-gray-600">
                        Un aperçu rapide de vos activités d'organisation d'événements.
                    </p>
                </header>
                {/* --- */}
                {/* Key Metrics Section */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Plan Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-2xl transition-shadow duration-300">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Forfait Actuel
                        </h2>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-3xl font-bold text-gray-900">{dashboardData.plan}</span>
                            {getPlanIcon(dashboardData.plan)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Votre plan détermine vos fonctionnalités.
                        </p>
                    </div>

                    {/* Event Points Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow duration-300">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Points d'Événement
                        </h2>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-3xl font-bold text-gray-900">{dashboardData.eventPoints}</span>
                            <Star className="w-12 h-12 text-yellow-400" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Utilisez-les pour créer de nouveaux événements.
                        </p>
                    </div>

                    {/* Events Created Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-300">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Événements Créés
                        </h2>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-3xl font-bold text-gray-900">{dashboardData.eventsCreated}</span>
                            <PlusCircle className="w-12 h-12 text-green-400" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Nombre total d'événements que vous avez lancés.
                        </p>
                    </div>

                    {/* Upcoming Events Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-2xl transition-shadow duration-300">
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Événements à Venir
                        </h2>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-3xl font-bold text-gray-900">{dashboardData.upcomingEvents}</span>
                            <Users className="w-12 h-12 text-pink-400" strokeWidth={2.5} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Événements planifiés dans le futur.
                        </p>
                    </div>
                </section>

                {/* --- */}

                {/* Quick Actions Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                        Actions Rapides
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
                        <button onClick={handleCreateEvent} className="bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] text-white px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105 flex-1 sm:flex-initial flex items-center justify-center sm:justify-start">
                            <PlusCircle className="sm:mr-2 h-5 w-5" />
                            <span className="ml-2 sm:ml-0">Créer un Nouvel Événement</span>
                        </button>
                        <button onClick={handleManageGuests} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl shadow-md hover:bg-gray-300 transition-colors duration-300 transform hover:scale-105 flex-1 sm:flex-initial flex items-center justify-center sm:justify-start">
                            <Users className="sm:mr-2 h-5 w-5" />
                            <span className="ml-2 sm:ml-0">Gérer les Invités</span>
                        </button>
                    </div>
                </section>

                {/* --- */}

                {/* New: Personalized Goals Section */}
                <section className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="text-indigo-500" />
                        Objectifs Personnalisés
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Définissez et suivez vos objectifs pour rester motivé et organisé.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal Card 1: Monthly Events */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-lg text-gray-700">Événements mensuels</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Objectif : <span className="font-bold bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent">{goals.monthlyEvents}</span> événements
                                </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="h-2.5 rounded-full min-w-0 max-w-[100%] bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3]" style={{ width: `${(dashboardData.eventsCreated / goals.monthlyEvents) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                    Actuellement : {dashboardData.eventsCreated}
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleGoalChange('monthlyEvents', -1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                        disabled={goals.monthlyEvents <= 1}
                                    >-</button>
                                    <button
                                        onClick={() => handleGoalChange('monthlyEvents', 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        {/* Goal Card 2: Attendees Target */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium text-lg text-gray-700">Cible de participants</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Objectif : <span className="font-bold bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent">{goals.attendeesTarget}+</span> participants (total)
                                </p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="h-2.5 rounded-full bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3]" style={{ width: `${(15 / goals.attendeesTarget) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-500">
                                    Actuellement : 15 (exemple)
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleGoalChange('attendeesTarget', -10)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                        disabled={goals.attendeesTarget <= 10}
                                    >-</button>
                                    <button
                                        onClick={() => handleGoalChange('attendeesTarget', 10)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardGlobal;