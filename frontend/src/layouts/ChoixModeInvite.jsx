import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";

export default function ChoixModeInvite() {
  const choixItems = [
    { path: "creationInv", name: "Créer manuellement" },
    { path: "", name: "Importer / CSV" },
    { path: "affichageInv", name: "Liste des Invités" },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative flex h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Bouton de menu pour les petits écrans (visible uniquement sur mobile) */}
      <div
        className={`
                    absolute top-4 z-40 lg:hidden
                    transform transition-transform duration-300
                    ${isMenuOpen ? "left-72" : "left-2"}
                `}
      >
        <button
          onClick={toggleMenu}
          className="p-3 bg-white/70 backdrop-blur-sm shadow-lg border border-gray-200 transition-all hover:scale-105 transform hover:rotate-12"
        >
          {isMenuOpen ? (
            <RxCaretLeft className="w-6 h-6 text-gray-700" />
          ) : (
            <RxCaretRight className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar : cachée par défaut, s'anime pour apparaître, visible sur les grands écrans */}
      <aside
        className={`
                    fixed w-72 h-full bg-white flex flex-col shadow-xl border-r border-gray-200 z-30
                    transform transition-transform duration-300
                    ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Gérer les invités
          </h2>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {choixItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-xl
                                        text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
                                        hover:text-blue-700 hover:shadow-sm transition-all duration-200 
                                        border border-transparent hover:border-blue-200
                                    "
                  onClick={closeMenu}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden lg:ml-72">
        <div className="h-full p-6">
          <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-full p-8 overflow-y-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}