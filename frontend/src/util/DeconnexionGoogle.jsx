

// import { useStateContext } from "../context/ContextProvider";
// import axiosClient from "../api/axios-client";
// import { useNavigate } from "react-router-dom";
// import {LogOut} from "lucide-react";

// const LogoutButton = () => {
//   const { handleLogout } = useStateContext();
//   const navigate = useNavigate();

//   const onLogoutClick = async () => {
//     try {
//       await axiosClient.post("/auth/logout");
//     } catch (error) {
//       console.error("Erreur lors de la déconnexion:", error);
//     } finally {
//       handleLogout(); // Réinitialise l'état global
//       navigate("/", { replace: true }); // Redirige vers la page d'accueil publique
//     }
//   };

//   return (
//     <button onClick={onLogoutClick}  className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base logout-button">
//        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
//       Déconnexion
//     </button>
//   );
// };

// export default LogoutButton;

// src/components/LogoutButton.jsx
import { LogOut } from "lucide-react";

const LogoutButton = ({ onOpenModal }) => {
  return (
    <button
      onClick={onOpenModal}
      className="w-full flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 cursor-pointer text-sm sm:text-base logout-button"
    >
      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
      Déconnexion
    </button>
  );
};

export default LogoutButton;