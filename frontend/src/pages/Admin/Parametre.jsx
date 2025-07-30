import { FaGears } from "react-icons/fa6";
import SystemPromptManager from "./SystemPromptManager";

export default function Parametre() {
  return (
    <div className="p-8 h-screen overflow-y-auto bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
      {/* <div>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
          <FaGears className="mr-3" /> Paramètres
        </h2>
      </div> */}
      <div>
        <SystemPromptManager />
      </div>
      
    </div>
  );
}