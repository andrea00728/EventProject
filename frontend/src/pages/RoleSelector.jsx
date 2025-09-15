import { Navigate, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { useEffect } from "react";
import { clearCookiesPage } from "../services/service";

export default function RoleSelector() {
  const { user, setUser } = useStateContext();
  const navigate = useNavigate();

  const choisirRole = (role) => {
    if (!role) {
      console.warn("Rôle non défini");
      return;
    }
    setUser({ ...user, role });
    if (role === "organisateur") {
      navigate("/");
    } else if (role === "accueil") {
      navigate("/personnelAccueil");
    } else if (role === "caissier") {
      navigate("/personnelCaisse");
    } else if (role === "cuisinier") {
      navigate("/personnelCuisine");
    } else {
      navigate("/infoEventForPersonnal")
    }
  };

  // Si user est null, on affiche un petit message ou un loader
  if (!user) {
    return <div className="text-center mt-10 text-red-500">Utilisateur non connecté</div>;
  }

  return (
  <div className="flex w-full h-full items-center justify-center px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Choisissez votre rôle
          </h2>
          <p className="text-white/90 text-base font-medium">
            Sélectionnez comment vous souhaitez utiliser la plateforme
          </p>
        </div>
        
        <div className="px-6 py-8 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => choisirRole(user?.role)}
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              aria-label={`Continuer en tant que ${user?.role || "rôle actuel"}`}
              disabled={!user?.role}
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-y-6 group-hover:skew-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider">
                  Continuer en tant que {user?.role || "rôle actuel"}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => choisirRole("organisateur")}
              className="group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-gray-700 hover:text-indigo-700 font-semibold py-3 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              aria-label="Créer ou gérer un événement en tant qu'organisateur"
            >
              <div className="relative flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider text-center">
                  Créer ou gérer mon propre événement
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
