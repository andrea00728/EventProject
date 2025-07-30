import React, { useState, useEffect, useRef } from 'react';
import {
  MdCalendarToday,
  MdEvent,
  MdPerson,
  MdPayments, 
  MdAccountCircle, 
  MdDescription, 
  MdOutlineLibraryBooks, 
  MdSearch,
  MdFilterList,
  MdFileDownload,
  MdBarChart, 
  MdHistory
} from 'react-icons/md';
import { useDarkMode } from "../../context/DarkModeContext";


const StatsCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const { darkMode } = useDarkMode();

  const colors = {
    blue: { bg: "from-blue-500 to-cyan-500", text: "text-blue-500" },
    green: { bg: "from-green-500 to-emerald-500", text: "text-green-500" },
    purple: { bg: "from-purple-500 to-pink-500", text: "text-purple-500" },
    orange: { bg: "from-orange-500 to-yellow-500", text: "text-orange-500" }
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm border ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    } relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${
        colors[color].bg
      } opacity-10 rounded-full -mr-4 -mt-4`} />

      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            darkMode ? "text-blue-300" : "text-blue-600"
          } mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <MdBarChart className={`mr-1 ${ 
                trend > 0 ? "text-green-500" : "text-red-500"
              }`} />
              <span className={`text-sm ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${
          colors[color].bg
        } text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};


const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const { darkMode } = useDarkMode();

  
  const mockActivities = [
    {
      id: 1,
      time: '13:45',
      date: 'Aujourd\'hui',
      type: 'event',
      icon: <MdEvent />,
      title: 'Nouvel événement créé',
      description: 'Gala de Charité 2024 - 300 participants',
      user: 'Marie Dubois',
      color: 'blue',
    },
    {
      id: 2,
      time: '12:30',
      date: 'Aujourd\'hui',
      type: 'table',
      icon: <MdOutlineLibraryBooks />,
      title: 'Réservation confirmée',
      description: 'Table VIP #7 réservée pour le 15 Mars',
      user: 'Jean Martin',
      color: 'teal',
    },
    {
      id: 3,
      time: '11:15',
      date: 'Aujourd\'hui',
      type: 'payment',
      icon: <MdPayments />,
      title: 'Paiement reçu',
      description: '2,500€ - Événement "Concert Jazz"',
      user: 'Système',
      color: 'green',
    },
    {
      id: 4,
      time: '10:20',
      date: 'Aujourd\'hui',
      type: 'user',
      icon: <MdAccountCircle />,
      title: 'Nouveaux participants',
      description: '45 inscriptions pour "Soirée Networking"',
      user: 'Plateforme',
      color: 'purple',
    },
    {
      id: 5,
      time: '09:45',
      date: 'Aujourd\'hui',
      type: 'event',
      icon: <MdEvent />,
      title: 'Événement modifié',
      description: 'Changement d\'horaire - Concert Jazz',
      user: 'Sophie Laurent',
      color: 'indigo',
    },
    {
      id: 6,
      time: '16:30',
      date: 'Hier',
      type: 'report',
      icon: <MdDescription />,
      title: 'Rapport généré',
      description: 'Rapport mensuel des performances',
      user: 'Admin',
      color: 'yellow',
    },
    {
      id: 7,
      time: '15:15',
      date: 'Hier',
      type: 'event',
      icon: <MdEvent />,
      title: 'Événement terminé',
      description: 'Mariage Smith - 150 participants',
      user: 'Système',
      color: 'blue',
    },
    {
      id: 8,
      time: '14:00',
      date: 'Hier',
      type: 'table',
      icon: <MdOutlineLibraryBooks />,
      title: 'Table libérée',
      description: 'Table Standard #12 maintenant disponible',
      user: 'Personnel',
      color: 'red',
    },
    {
      id: 9,
      time: '11:00',
      date: 'Hier',
      type: 'payment',
      icon: <MdPayments />,
      title: 'Remboursement effectué',
      description: '50€ - Annulation Réservation',
      user: 'Système',
      color: 'orange',
    },
    {
      id: 10,
      time: '09:00',
      date: 'Avant-hier',
      type: 'user',
      icon: <MdAccountCircle />,
      title: 'Nouvel utilisateur enregistré',
      description: 'Compte créé par Thomas Dupont',
      user: 'Plateforme',
      color: 'teal',
    },
    {
      id: 11,
      time: '17:00',
      date: 'Avant-hier',
      type: 'event',
      icon: <MdEvent />,
      title: 'Événement annulé',
      description: 'Conférence Tech Summit 2024',
      user: 'Admin',
      color: 'red',
    },
  ];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
      setHasMore(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const moreActivities = [
        {
          id: 12,
          time: '10:00',
          date: 'Il y a 3 jours',
          type: 'report',
          icon: <MdDescription />,
          title: 'Rapport quotidien',
          description: 'Résumé des activités du 25 Juillet',
          user: 'Admin',
          color: 'green',
        },
        {
          id: 13,
          time: '09:00',
          date: 'Il y a 3 jours',
          type: 'table',
          icon: <MdOutlineLibraryBooks />,
          title: 'Modification de réservation',
          description: 'Heure modifiée pour Table Standard #5',
          user: 'Laura Blanc',
          color: 'indigo',
        },
      ];
      setActivities((prev) => [...prev, ...moreActivities]);
      setLoading(false);
      setHasMore(false);
    }, 500);
  };

  const filteredActivities = activities.filter((activity) => {
    if (filterType !== 'all' && activity.type !== filterType) return false;
    if (filterDate === 'today' && activity.date !== "Aujourd'hui") return false;
    if (filterDate === 'yesterday' && activity.date !== 'Hier') return false;

    if (
      searchQuery &&
      !(
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) {
      return false;
    }
    return true;
  });

  const renderActivities = () => {
    let currentDate = '';
    return filteredActivities.map((activity, index) => {
      const isNewDate = activity.date !== currentDate;
      currentDate = activity.date;

      return (
        <React.Fragment key={activity.id}>
          {isNewDate && (
            <div className="flex items-center space-x-4 my-6"> {/* Espacement plus subtil */}
              <div className={`h-px flex-1 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
              <div className={`font-semibold px-4 py-1.5 rounded-full text-sm ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
              }`}>
                {activity.date}
              </div>
              <div className={`h-px flex-1 ${darkMode ? "bg-gray-700" : "bg-gray-300"}`}></div>
            </div>
          )}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl shadow-sm border ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            } transition-all duration-300 hover:shadow-md hover:-translate-y-1 my-2`}
            style={{ animationDelay: `${index * 0.05}s` }} // Animation plus rapide
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                darkMode ? `bg-${activity.color}-700 text-${activity.color}-200` : `bg-${activity.color}-100 text-${activity.color}-600`
              }`}
            >
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className={`text-base font-semibold truncate ${
                  darkMode ? "text-blue-300" : "text-blue-600"
                }`}>
                  {activity.title}
                </h4>
                <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} whitespace-nowrap ml-4`}>
                  {activity.time}
                </span>
              </div>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"} line-clamp-2`}>
                {activity.description}
              </p>
              <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Par {activity.user}
              </p>
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  
  const gradientTitle =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-300 bg-clip-text text-transparent";
  const gradientButton =
    "bg-gradient-to-r from-blue-500 via-violet-500 to-purple-400 text-white";

  const bgClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";


  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 w-full transition duration-500 ${bgClass}`}>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Activités du jour"
          value={filteredActivities.filter(a => a.date === "Aujourd'hui").length}
          icon={MdCalendarToday}
          color="blue"
          trend={15} 
        />
        <StatsCard
          title="Nouvelles inscriptions"
          value={filteredActivities.filter(a => a.type === "user" && a.date === "Aujourd'hui").length}
          icon={MdPerson}
          color="green"
          trend={8}
        />
        <StatsCard
          title="Événements créés"
          value={filteredActivities.filter(a => a.type === "event" && a.date === "Aujourd'hui").length}
          icon={MdEvent}
          color="purple"
          trend={-3}
        />
        <StatsCard
          title="Paiements récents"
          value={filteredActivities.filter(a => a.type === "payment" && a.date === "Aujourd'hui").length}
          icon={MdPayments}
          color="orange"
          trend={20}
        />
      </div>

      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          
          <div className={`flex items-center gap-2 px-5 py-0.5 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <MdFilterList className="text-gray-500" />
            <select
              className={`p-2 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tous les types</option>
              <option value="event">Événements</option>
              <option value="table">Réservations</option>
              <option value="payment">Paiements</option>
              <option value="user">Utilisateurs</option>
              <option value="report">Rapports</option>
            </select>
          </div>

          
          <div className={`flex items-center gap-2 px-5 py-0.5 rounded-lg ${
            darkMode ? "bg-gray-800" : "bg-gray-100"
          }`}>
            <MdCalendarToday className="text-gray-500" />
            <select
              className={`p-2 bg-transparent focus:outline-none ${
                darkMode ? "text-blue-300" : "text-blue-600"
              }`}
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="yesterday">Hier</option>
            </select>
          </div>

          
          <div className="relative w-full sm:w-64 flex items-center">
            <MdSearch className={`absolute left-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
            <input
              type="text"
              placeholder="Rechercher une activité..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg shadow-sm border ${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-200 text-gray-800 placeholder-gray-400"
              } focus:outline-none focus:ring-2 ${darkMode ? "focus:ring-blue-600/30" : "focus:ring-blue-200"} focus:border-blue-500 transition-all duration-200`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto">
          <button
            onClick={() => alert("Fonctionnalité d'exportation à implémenter")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl w-full ${gradientButton} transition-colors duration-200 shadow-md hover:shadow-lg`}
          >
            <MdFileDownload className="text-lg" />
            <span>Exporter Rapport</span>
          </button>
        </div>
      </div>

      
      <div className="p-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? "border-purple-300" : "border-blue-500"}`}></div>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="space-y-4"> 
            {renderActivities()}
          </div>
        ) : (
          <div className="text-center py-12">
            <MdDescription className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? "text-gray-600" : "text-gray-300"
            }`} />
            <p className={`text-lg ${
              darkMode ? "text-purple-300" : "text-purple-600"
            }`}>
              Aucune activité trouvée
            </p>
          </div>
        )}
      </div>

      
      {!loading && hasMore && filteredActivities.length > 0 && (
        <div className="text-center mt-10">
          <button
            onClick={handleLoadMore}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-colors duration-300 shadow-md hover:shadow-lg
                       ${darkMode ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"} `}
          >
            <MdBarChart className="text-xl" /> 
            <span>Charger plus d'activités</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;