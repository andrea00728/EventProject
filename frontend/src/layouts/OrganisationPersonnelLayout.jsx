import { Link, Outlet } from "react-router-dom";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { RxCaretRight, RxCaretLeft } from "react-icons/rx";
import { CountAllPersonnels } from "../services/personnel_service";

export default function OrganisationPersonnelLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [allPersonnels, setAllPersonnels] = useState([]);
  const [totalPersonnels, setTotalPersonnels] = useState(0); // ✅ état pour le count global

    const navigatement = useNavigate();
    const versDashboard = () => {
        navigatement("/evenement/dashboard/eventsDash");
    }
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Charger tous les personnels
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await CountAllPersonnels();
        setTotalPersonnels(count);
      } catch (err) {
        console.error("Erreur lors de la récupération du count global:", err);
      }
    };

    fetchCount();
  }, []);

//   console.log("Total personnels:", totalPersonnels);

  const choixItems = [
    {
      path: "",
      name: "Dashboard Personnel",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      path: "organigramme",
      name: "Organigramme",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14-7l2 2-2 2m-7 6h7l-2-2 2-2M7 13l-2 2 2 2"
          />
        </svg>
      ),
    },
    {
      path: "createPersonnel",
      name: "Créer un Personnel",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Bouton menu mobile */}
      <div
        className={`
          absolute top-4 z-40 lg:hidden
          transform transition-transform duration-300
          ${isMenuOpen ? "left-80" : "left-2"}
        `}
      >
        <button
          onClick={toggleMenu}
          className="p-3 bg-white/30 backdrop-blur-sm shadow-xl border border-slate-200/60 transition-all hover:scale-105 transform hover:-rotate-12"
        >
          {isMenuOpen ? (
            <RxCaretLeft className="w-6 h-6 text-slate-700" />
          ) : (
            <RxCaretRight className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed h-screen w-80 bg-white/95 backdrop-blur-sm shadow-xl border-r border-gray-200/60 flex flex-col z-30
          transform transition-transform duration-300
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/60 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
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
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                Gestion Personnel
              </h2>
            </div>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Gérez votre équipe et organisation efficacement
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 min-h-0 overflow-y-auto">
          <ul className="space-y-3">
            {choixItems.map((item, index) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-4 py-4 rounded-xl
                    text-slate-700 hover:text-white font-medium
                    transition-all duration-300 transform hover:scale-[1.02]
                    ${
                      index === 0
                        ? "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/25"
                        : index === 1
                        ? "hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-500/25"
                        : "hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:shadow-xl hover:shadow-orange-500/25"
                    }
                    relative overflow-hidden border border-transparent
                    hover:border-white/20
                  `}
                  onClick={toggleMenu}
                >
                  <div
                    className={`
                      p-2.5 rounded-lg transition-all duration-300 flex-shrink-0
                      ${
                        index === 0
                          ? "bg-blue-100 group-hover:bg-white/20"
                          : index === 1
                          ? "bg-purple-100 group-hover:bg-white/20"
                          : "bg-orange-100 group-hover:bg-white/20"
                      }
                    `}
                  >
                    <div
                      className={`
                        ${
                          index === 0
                            ? "text-blue-600"
                            : index === 1
                            ? "text-purple-600"
                            : "text-orange-600"
                        } 
                        group-hover:text-white transition-colors duration-300
                      `}
                    >
                      {item.icon}
                    </div>
                  </div>
                  <span className="text-sm font-semibold flex-1 min-w-0 truncate">
                    {item.name}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Statistiques */}
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1" onClick={versDashboard}>
                  <p className="text-sm font-bold text-emerald-700 truncate">
                    Total du personnel
                  </p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {totalPersonnels}
                    </p>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200/60 flex-shrink-0">
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  Centre d'aide
                </p>
                <p className="text-xs text-slate-500 truncate">
                  Ressources RH disponibles
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden lg:ml-80">
        <Outlet />
      </main>
    </div>
  );
}
