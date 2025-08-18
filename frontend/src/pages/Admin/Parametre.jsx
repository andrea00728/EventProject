// import { FaGears } from "react-icons/fa6";
import SystemPromptManager from "./SystemPromptManager";
import { useDarkMode } from "../../context/DarkModeContext";
import SuperAdminProfileEdit from "./Profil";


export default function Parametre() {

  const { darkMode, toggleDarkMode } = useDarkMode();

  const pageBg = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-50 text-gray-800";
  return (
    <div className={`min-h-auto p-4 sm:p-6 md:p-8 w-full mx-auto transition duration-500 ${pageBg}`}>
      
      <div>
        <SystemPromptManager />
      </div>

      <div>
        <SuperAdminProfileEdit/>
      </div>
      
    </div>
  );
}
