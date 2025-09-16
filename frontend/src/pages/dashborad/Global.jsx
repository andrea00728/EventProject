// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";
import { getAllManagerEvents } from "../../services/evenementServ";
import { getUserForfait } from "../../services/forfaitService";
import {
  Calendar,
  Crown,
  Gem,
  Handshake,
  PlusCircle,
  Rocket,
  Star,
  Target,
  Users,
} from "lucide-react";
import { getUserGoal, updateUserGoal } from "../../services/goalService";
import { getInformationUser } from "../../services/userService";
import { format } from "date-fns";

const DashboardGlobal = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useStateContext();

  const [dashboardData, setDashboardData] = useState({
    plan: "Aucun forfait",
    eventPoints: 0,
    eventsCreated: 0,
    upcomingEvents: 0,
    limitForfait: "N/A",
  });

  // Objectifs personnalisés persistants via localStorage
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem("userGoals");
    return savedGoals
      ? JSON.parse(savedGoals)
      : { monthlyEvents: 3, attendeesTarget: 50 };
  });

  useEffect(() => {
    const fetchGoal = async () => {
      if (user && (user.id || user.sub)) {
        const data = await getUserGoal(user.id || user.sub);
        if (data) setGoals(data);
      }
    };
    fetchGoal();
  }, [user]);

  const handleGoalChange = (key, increment) => {
    setGoals((prevGoals) => {
      let newValue = prevGoals[key] + increment;
      let updatedGoals = { ...prevGoals };

      // Logique modifiée : Limiter l'objectif mensuel au nombre de points d'événement
      if (key === "monthlyEvents" && dashboardData.eventPoints !== "Illimité") {
        newValue = Math.min(newValue, dashboardData.eventPoints);
      }

      updatedGoals = {
        ...prevGoals,
        [key]: newValue > 0 ? newValue : prevGoals[key],
      };
      updateUserGoal(user.id || user.sub, updatedGoals); // persiste dans DB
      return updatedGoals;
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      let userForfait = {};
      let managerEvents = [];

      try {
        const forfaitData = await getUserForfait();
        userForfait = forfaitData?.forfait || {};
        

        managerEvents = await getAllManagerEvents(user.id || user.sub);
      } catch (err) {
        console.error("Erreur récupération des données utilisateur :", err);
        return;
      }

      const totalEventsAllowed = userForfait.maxevents ?? 0;
      const isUnlimited = totalEventsAllowed === "Illimité";
      const eventsCreated = managerEvents.length;
      const remainingEvents = isUnlimited
        ? "Illimité"
        : Math.max(Number(totalEventsAllowed) - eventsCreated, 0);
      const forfaitExpiration = user.forfaitexpirationdate;
      
      // const formattedDate = forfaitExpiration
      //   ? new Date(forfaitExpiration).toLocaleDateString("fr-FR")
      //   : "N/A";

        const informationUser = await getInformationUser();

      setDashboardData((prevData) => ({
        ...prevData,
        plan: userForfait.nom || "Aucun forfait",
        eventPoints: totalEventsAllowed,
        eventsCreated,
        remainingEvents,
        upcomingEvents: isUnlimited
          ? "Illimité"
          : Math.max(Number(totalEventsAllowed) - eventsCreated, 0),
        limitForfait: format(informationUser.forfaitexpirationdate, 'dd/MM/yyyy HH:mm'),
      }));
    };

    fetchUserData();
  }, [user]); // Ajout de 'user' comme dépendance si son chargement est asynchrone

  if (isLoading) {
    return (
      <p className="text-center text-gray-600">
        Chargement des données du tableau de bord...
      </p>
    );
  }

  if (!user) {
    return (
      <p className="text-center text-gray-600">
        Veuillez vous connecter pour voir le tableau de bord.
      </p>
    );
  }

  const handleCreateEvent = () => navigate("/evenement");
  const handleManageGuests = () => navigate("/evenement/invites");

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case "starter":
        return <Rocket className="w-12 h-12 text-blue-500" strokeWidth={2.5} />;
      case "pro":
        return <Star className="w-12 h-12 text-purple-500" strokeWidth={2.5} />;
      case "premium":
        return <Gem className="w-12 h-12 text-pink-500" strokeWidth={2.5} />;
      case "gold":
        return (
          <Crown className="w-12 h-12 text-yellow-600" strokeWidth={2.5} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[86vh] bg-gray-100 p-8 font-sans overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-gray-900">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-4">
              <Handshake
                className="w-10 h-10 text-[#4c7ff7] flex-shrink-0"
                strokeWidth={2.5}
              />
              <h1 className="text-4xl font-extrabold">
                Bienvenue sur votre Tableau de Bord,
              </h1>
            </div>
            <span className="bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent text-4xl font-extrabold mt-2 md:mt-0">
              {user.name || "Organisateur"}
            </span>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            Un aperçu rapide de vos activités d'organisation d'événements.
          </p>
        </header>

        {/* Key Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Plan */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Forfait Actuel
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.plan}
              </span>
              {getPlanIcon(dashboardData.plan)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Votre plan détermine vos fonctionnalités.
            </p>
          </div>

          {/* Event Points */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Points d'Événement
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.eventPoints}
              </span>
              <Star className="w-12 h-12 text-yellow-400" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Utilisez-les pour créer de nouveaux événements.
            </p>
          </div>

          {/* Events Created */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Événements Créés
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.eventsCreated}
              </span>
              <PlusCircle
                className="w-12 h-12 text-green-400"
                strokeWidth={2.5}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Nombre total d'événements que vous avez lancés.
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Événements restants
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.upcomingEvents}
              </span>
              <Users className="w-12 h-12 text-pink-400" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Événements restants disponibles avec votre forfait actuel.
            </p>
          </div>

          {/* Date d'expiration du forfait */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Date d'expiration Forfait
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-3xl font-bold text-gray-900">
                {dashboardData.limitForfait}
              </span>
              <Calendar className="w-12 h-12 text-red-400" strokeWidth={2.5} />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Événements restants disponibles avec votre forfait actuel.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Actions Rapides
          </h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
            <button
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] text-white px-6 py-3 rounded-xl shadow-md hover:opacity-90 transition-opacity duration-300 transform hover:scale-105 flex-1 sm:flex-initial flex items-center justify-center sm:justify-start"
            >
              <PlusCircle className="sm:mr-2 h-5 w-5" />
              <span className="ml-2 sm:ml-0">Créer un Nouvel Événement</span>
            </button>
            <button
              onClick={handleManageGuests}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl shadow-md hover:bg-gray-300 transition-colors duration-300 transform hover:scale-105 flex-1 sm:flex-initial flex items-center justify-center sm:justify-start"
            >
              <Users className="sm:mr-2 h-5 w-5" />
              <span className="ml-2 sm:ml-0">Gérer les Invités</span>
            </button>
          </div>
        </section>

        {/* Personalized Goals */}
        <section className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="text-indigo-500" />
            Objectifs Personnalisés
          </h2>
          <p className="text-gray-600 mb-4">
            Définissez et suivez vos objectifs pour rester motivé et organisé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Events */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-lg text-gray-700">
                  Événements mensuels
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Objectif :{" "}
                  <span className="font-bold bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent">
                    {goals.monthlyEvents}
                  </span>{" "}
                  événements
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="h-2.5 rounded-full min-w-0 max-w-[100%] bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3]"
                  style={{
                    width: `${(dashboardData.eventsCreated / goals.monthlyEvents) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Actuellement : {dashboardData.eventsCreated}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGoalChange("monthlyEvents", -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                    disabled={goals.monthlyEvents <= 1}
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleGoalChange("monthlyEvents", 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Attendees Target */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-lg text-gray-700">
                  Cible de participants
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Objectif :{" "}
                  <span className="font-bold bg-gradient-to-r from-[#4c7ff7] to-[#7b49f3] bg-clip-text text-transparent">
                    {goals.attendeesTarget}+
                  </span>{" "}
                  participants (total)
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r min-w-0 max-w-[100%] from-[#4c7ff7] to-[#7b49f3]"
                  style={{ width: `${(15 / goals.attendeesTarget) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Actuellement : 15 (exemple)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGoalChange("attendeesTarget", -10)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                    disabled={goals.attendeesTarget <= 10}
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleGoalChange("attendeesTarget", 10)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                  >
                    +
                  </button>
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