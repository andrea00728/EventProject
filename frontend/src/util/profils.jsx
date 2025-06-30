import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";

export default function Profil() {
  const { user, isLoading } = useStateContext();
  const [userName, setUserName] = useState("Utilisateur");
  const [userEmail, setUserEmail] = useState("email@example.com");
  const [userPhoto, setUserPhoto] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.name || "Utilisateur");
      setUserEmail(user.email || "email@example.com");
      setUserPhoto(user.photo || "");
    }
  }, [user]);
  if (isLoading) return <p>Chargement...</p>;
  return (
    <div className="flex items-center gap-4">
      <img
        src={userPhoto || ""}
        alt="Profil"
        className="w-9 h-9 rounded-full object-cover"
      />
      {/* <div>
        <p className="font-semibold">{userName}</p>
        <p className="text-sm text-gray-600">{userEmail}</p>
      </div> */}
    </div>
  );
}
