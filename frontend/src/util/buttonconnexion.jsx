import { Google } from "@mui/icons-material";
import { FaGoogle } from "react-icons/fa";

const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://api.mastertable.site';

export default function ButtonConnexion() {
  const connecter = () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Version moderne avec bordure colorée */}
      <button
        className="relative overflow-hidden group flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white px-7 py-3 w-[90%] h-[50px] sm:w-80 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-base font-semibold tracking-wide focus:outline-none focus:ring-4 focus:ring-blue-200/50 border-2 border-transparent cursor-pointer"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(31, 41, 55), rgb(17, 24, 39)), linear-gradient(to right, rgb(59, 130, 246), rgb(147, 51, 234), rgb(236, 72, 153))`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
        onClick={connecter}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        
        <Google/>
        <span className="relative z-10 ml-2">Continuer avec Google</span>
      </button>
    </div>
  );
}