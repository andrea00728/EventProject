import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

export default function RoleSelector() {
  const { user, setUser } = useStateContext();
  const navigate = useNavigate();

  const choisirRole = (role) => {
    setUser({ ...user, role }); 
    if (role === "organisateur") {
      navigate("/accueil");
    } else if (role === "accueil") {
      navigate("/personnelAccueil");
    } else if (role === "caissier") {
      navigate("/personnelCaisse");
    } else if (role === "cuisinier") {
      navigate("/personnelCuisine");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-20">
      <h2 className="text-2xl font-bold text-gray-700">Choisissez votre rôle</h2>
      <div className="flex gap-6">
        <button
          onClick={() => choisirRole(user.role)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continuer comme {user.role}
        </button>
        <button
          onClick={() => choisirRole("organisateur")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Créer mon propre événement
        </button>
      </div>
    </div>
  );
}
