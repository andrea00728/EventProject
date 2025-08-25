import { useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";

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
      navigate("/pagepublic");
    } else if (role === "accueil") {
      navigate("/personnelAccueil");
    } else if (role === "caissier") {
      navigate("/personnelCaisse");
    } else if (role === "cuisinier") {
      navigate("/personnelCuisine");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-20 bg-gray-100 rounded-lg w-[50%] mx-auto p-10">
      <h2 className="text-2xl font-bold text-gray-700">Choisissez votre rôle</h2>
      <div className="flex gap-6">
        <button
          onClick={() => choisirRole(user?.role)}
          className="middle none center mr-3 rounded-lg bg-pink-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
          aria-label={`Continuer comme ${user?.role || "rôle actuel"}`}
          disabled={!user?.role}
        >
          Continuer comme {user?.role || "rôle actuel"}
        </button>
        <button
          onClick={() => choisirRole("organisateur")}
          className="middle none center rounded-lg py-3 px-6 font-sans text-xs font-bold uppercase text-pink-500 transition-all hover:bg-pink-500/10 active:bg-pink-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-dark="true"
          aria-label="Créer un événement en tant qu'organisateur"
        >
          Créer mon propre événement
        </button>
      </div>
    </div>
  );
}