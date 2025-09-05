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

  const handleShowLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    await handleLogout();
    setUser(null);
    setShowLogoutModal(false);
    navigate("/pagepublic");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  if (!isAuthenticated) return <Navigate to="/pagepublic" replace />;

  switch (role) {
    case "cuisinier": return <Navigate to="/personnelCuisine" replace />;
    case "organisateur": return <Navigate to="/accueil" replace />;
    case "accueil": return <Navigate to="/personnelAccueil" replace />;
    case "caissier": return <Navigate to="/personnelCaisse" replace />;
    default: break;
  }

  const navigationItems = [
    { id: 'info', label: 'Info Événement', icon: Calendar, path: 'infoEventForPersonnal' },
    { id: 'guests', label: 'Liste des Invités', icon: UserCheck, path: 'guests_list' },
    { id: 'personnel', label: 'Personnel', icon: Users, path: 'personnel_list' }
  ];

  const handleNavigation = (path) => navigate(path);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Sidebar */}
      <aside className="w-72 bg-white shadow-2xl rounded-r-3xl relative">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Personnel</h1>
          {user && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">{user.name || 'Personnel'}</p>
              <p className="text-xs text-gray-400">{user.role || 'Utilisateur'}</p>
            </div>
          )}
        </div>

        <nav className="mt-8 flex flex-col gap-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="group flex items-center px-6 py-3 text-left rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 text-gray-700 hover:text-blue-600 shadow-sm"
              >
                <Icon className="mr-3 h-5 w-5 group-hover:text-blue-500 transition-colors" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute top-[95vh] left-6">
          <button
            onClick={handleShowLogout}
            className="flex items-center cursor-pointer text-red-600 hover:text-red-800 font-semibold text-sm transition-all duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900">Gestion des Événements</h2>
          <p className="text-gray-500 mt-1">Bienvenue sur votre tableau de bord</p>
        </header>

        <div className="bg-white rounded-3xl shadow-2xl border border-white/30 p-6 min-h-[500px]">
          <Outlet />
        </div>
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
