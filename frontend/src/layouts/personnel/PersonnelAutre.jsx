import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useStateContext } from '../../context/ContextProvider';
import { Users, Calendar, UserCheck, Utensils, LogOut } from 'lucide-react';
import LogoutModal from '../../pages/Admin/LogoutModal';
import { useDarkMode } from '../../context/DarkModeContext';
import { RxCaretRight, RxCaretLeft } from 'react-icons/rx';

export const PersonnelAutre = () => {
  const { user, isAuthenticated, handleLogout, setUser, role } = useStateContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // État pour le menu mobile

  const handleShowLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    await handleLogout();
    setUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  console.log(user);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

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

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {/* Bouton pour ouvrir/fermer le menu mobile */}
      <div className={`
        absolute top-4 z-40 lg:hidden
        transform transition-transform duration-300
        ${isMenuOpen ? 'left-80' : 'left-2'}
      `}>
        <button
          onClick={toggleMenu}
          className="p-3 bg-white/30 backdrop-blur-sm shadow-xl border border-gray-200/60 transition-all hover:scale-105 transform hover:-rotate-12"
        >
          {isMenuOpen ? (
            <RxCaretLeft className="w-6 h-6 text-gray-700" />
          ) : (
            <RxCaretRight className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar - responsive */}
      <aside className={`
        fixed top-0 h-full w-72 bg-white shadow-lg flex flex-col justify-between overflow-hidden z-30
        transform transition-transform duration-300
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo et info utilisateur */}
        <div>
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            {user && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-800">{user.name || 'Personnel'}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role || 'Utilisateur'}</p>
              </div>
            )}
          </div>

          {/* Navigation items */}
          <nav className="mt-8 flex flex-col gap-2 px-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="group flex items-center gap-4 px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-gray-700 font-medium"
                >
                  <Icon className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleShowLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 font-semibold transition-colors duration-200"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 lg:ml-72 transition-all duration-300 max-w-[100%]">
        <header className="bg-white shadow-md rounded-2xl p-6 mb-6 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900">Gestion des Événements</h2>
          <p className="text-gray-500 mt-2">Bienvenue sur votre tableau de bord</p>
        </header>
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 min-h-[600px]">
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
  );
};