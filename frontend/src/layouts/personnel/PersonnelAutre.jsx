import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useStateContext } from '../../context/ContextProvider';
import { Users, Calendar, UserCheck, Utensils, LogOut } from 'lucide-react';
import LogoutModal from '../../pages/Admin/LogoutModal';
import { useDarkMode } from '../../context/DarkModeContext';

export const PersonnelAutre = () => {
  const { user, isAuthenticated, handleLogout, setUser, role } = useStateContext()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleShowLogout = () => {
    setShowLogoutModal(true);
  };


  const confirmLogout = async () => {
    await handleLogout();
    setUser(null)
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  console.log(user);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (!user) {
  //       return <Navigate to={"/"}/>

  //     }
  //   }
  // }, [isAuthenticated, user]);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  switch (role) {
    case "cuisinier":
      return <Navigate to="/personnelCuisine" replace />;
    case "organisateur":
      return <Navigate to="/accueil" replace />;
    case "accueil":
      return <Navigate to="/personnelAccueil" replace />;
    case "caissier":
      return <Navigate to="/personnelCaisse" replace />;
    default:
      break;
  }

  const navigationItems = [
    {
      id: 'info',
      label: 'Info Événement',
      icon: Calendar,
      path: 'infoEventForPersonnal'
    },
    {
      id: 'guests',
      label: 'Liste des Invités',
      icon: UserCheck,
      path: 'guests_list'
    },
    {
      id: 'personnel',
      label: 'Personnel',
      icon: Users,
      path: 'personnel_list'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="flex">
      {/* Navigation Sidebar */}
      <div className="w-64 bg-white shadow-lg min-h-screen">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Personnel</h1>
          {user && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">{user.name || 'Personnel'}</p>
              <p className="text-xs text-gray-500">{user.role || 'Utilisateur'}</p>
            </div>
          )}
        </div>

        <nav className="mt-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 hover:text-blue-600"
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6">
          <button
            onClick={handleShowLogout}
            className="flex items-center cursor-pointer text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="outlet flex-1 bg-gray-100 min-h-screen">
        <div className="">
          <header className="bg-white shadow-sm border-b p-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Gestion des Événements
            </h2>
          </header>
        </div>
        <Outlet />
      </main>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
        darkMode={darkMode}
      />
    </div>
  )
}