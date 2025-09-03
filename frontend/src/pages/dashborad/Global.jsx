// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useStateContext } from "../../context/ContextProvider";
import { FaHandshake } from 'react-icons/fa';
import { getAllManagerEvents } from '../../services/evenementServ';

const DashboardGlobal = () => {
  const { user, isLoading } = useStateContext();
  const [dashboardData, setDashboardData] = useState({
    plan: 'Basic',
    eventPoints: 0,
    eventsCreated: 0,
    upcomingEvents: 0,
  });

  // On utilise useEffect pour mettre à jour l'état du dashboard
  // lorsque les données de l'utilisateur changent
  useEffect(() => {
    if (user) {
      setDashboardData({
        // Supposons que ces données se trouvent dans l'objet 'user' de votre contexte
        // Remplacez 'user.plan', 'user.eventPoints', etc. par les vraies clés de votre objet utilisateur
        plan: user.plan || 'Basic',
        eventPoints: user.eventPoints || 0,
        eventsCreated: user.eventsCreated || 0,
        upcomingEvents: user.upcomingEvents || 0,
      });
    }
  }, [user]);

  useEffect(() => {

    const fetchData = async () => {
      const data = await getAllManagerEvents(user.id || user.sub);
      console.log("Données récupérés : ", data);
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <p className="text-center text-gray-600">Chargement des données du tableau de bord...</p>;
  }

  // Si l'utilisateur n'est pas disponible, on affiche un message
  if (!user) {
    return <p className="text-center text-gray-600">Veuillez vous connecter pour voir le tableau de bord.</p>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-4">
            <FaHandshake className="text-blue-500" /> Bienvenue sur votre Tableau de Bord, <span className="text-indigo-600">{user.name || 'Organisateur'}</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Un aperçu rapide de vos activités d'organisation d'événements.
          </p>
        </header>

        {/* --- */}

        {/* Key Metrics Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Plan Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Forfait Actuel
            </h2>
            <div className="flex items-center mt-2">
              <span className="text-4xl font-bold text-gray-900">{dashboardData.plan}</span>
              <span className="ml-2 text-sm text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
                <i className="fas fa-crown"></i>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Votre plan détermine vos fonctionnalités.
            </p>
          </div>

          {/* Event Points Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Points d'Événement
            </h2>
            <div className="flex items-center mt-2">
              <span className="text-4xl font-bold text-gray-900">{dashboardData.eventPoints}</span>
              <span className="ml-2 text-sm text-yellow-500">
                <i className="fas fa-star"></i>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Utilisez-les pour créer de nouveaux événements.
            </p>
          </div>

          {/* Events Created Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Événements Créés
            </h2>
            <div className="flex items-center mt-2">
              <span className="text-4xl font-bold text-gray-900">{dashboardData.eventsCreated}</span>
              <span className="ml-2 text-sm text-green-500">
                <i className="fas fa-calendar-check"></i>
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Nombre total d'événements que vous avez lancés.
            </p>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Événements à Venir
            </h2>
            <div className="flex items-center mt-2">
              <span className="text-4xl font-bold text-gray-900">{dashboardData.upcomingEvents}</span>
              <span className="ml-2 text-sm text-purple-500">
                <i className="fas fa-calendar-alt"></i>
              </span>
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
          <div className="flex flex-wrap gap-4">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-colors duration-300 transform hover:scale-105 flex items-center">
              <i className="fas fa-plus-circle mr-2"></i> Créer un Nouvel Événement
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl shadow-md hover:bg-gray-300 transition-colors duration-300 transform hover:scale-105 flex items-center">
              <i className="fas fa-chart-line mr-2"></i> Voir les Statistiques
            </button>
            <button className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl shadow-md hover:bg-gray-300 transition-colors duration-300 transform hover:scale-105 flex items-center">
              <i className="fas fa-users mr-2"></i> Gérer les Invités
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardGlobal;