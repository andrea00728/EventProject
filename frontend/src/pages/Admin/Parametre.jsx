import { FaGears } from "react-icons/fa6";
import SystemPromptManager from "./SystemPromptManager";

export default function Parametre() {
  return (
    <div className="p-8 h-screen overflow-y-auto bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
      
      <div>
        <SystemPromptManager />
      </div>
      
    </div>
  );
}