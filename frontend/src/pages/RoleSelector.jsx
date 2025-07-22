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
    <div className="flex flex-col items-center gap-6 mt-20 bg-gray-100 rounded-lg w-[50%] mx-auto mt-50 p-10  ">
      <h2 className="text-2xl font-bold text-gray-700">Choisissez votre rôle</h2>
      <div className="flex gap-6">
        <button
          onClick={() => choisirRole(user.role)}
          class="middle none center mr-3 rounded-lg bg-pink-500 py-3 px-6 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-light="true"
        >
          Continuer comme {user.role}
        </button>
        <button
          onClick={() => choisirRole("organisateur")}
           class="middle none center rounded-lg py-3 px-6 font-sans text-xs font-bold uppercase text-pink-500 transition-all hover:bg-pink-500/10 active:bg-pink-500/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          data-ripple-dark="true"
        >
          Créer mon propre événement
        </button>
      </div>
    </div>
  );
}
