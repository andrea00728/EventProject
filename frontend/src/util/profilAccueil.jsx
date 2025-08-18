import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import image from "../assets/LogoMaster.png"
export default function Profil_Accueil() {
  const { user, isLoading } = useStateContext();
  const [userName, setUserName] = useState("Utilisateur");
  const [userEmail, setUserEmail] = useState("email@example.com");
  const [userPhoto, setUserPhoto] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "Utilisateur");
      setUserEmail(user.email || "email@example.com");
      setUserPhoto(user.photo );
    }
  }, [user]);
  if (isLoading) return <p>Chargement...</p>;
  return (
   <div className="mt-8 text-center">
      <img
        src={userPhoto || image }
        alt="Profil"
        className="w-10 bg-gray-100 h-10 m-auto rounded-full object-cover lg:w-28 lg:h-28"
      />
         <h5 className="hidden mt-4 text-xl font-semibold text-gray-600 lg:block">{userName}</h5>
          <span className="hidden text-gray-400 lg:block">{userEmail}</span>
    </div>
  );
}
