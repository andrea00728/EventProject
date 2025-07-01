import { useEffect } from "react";
export default function Inviteform({ tableEv }) {
  useEffect(() => {
    console.log("Événement reçu :", tableEv); 
  }, [tableEv]);
  return <div>Formulaire d’invités ici</div>;
}
