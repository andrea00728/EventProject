// frontend/src/pages/PageEvenementPublic.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import CardEvenement from "../components/CardEvenement";

export default function PageEvenementPublic() {
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/api/evenements/publics")
      .then((res) => setEvenements(res.data))
      .catch((err) => console.error("Erreur lors du chargement des événements publics :", err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Événements Publics</h1>
      {evenements.length === 0 ? (
        <p>Aucun événement public disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evenements.map((event) => (
            <CardEvenement key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
