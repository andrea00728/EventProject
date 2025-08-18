import { useEffect, useState } from "react";
import { getPersonnelByEventId } from "../../services/personnel_service";
import Image from "../../assets/user.png";

const roleLabels = {
  accueil: "Accueil",
  caissier: "Caissier",
  cuisinier: "Cuisinier",
};

const statusLabels = {
  confirmed: { label: "Confirmé", color: "text-green-600" },
  pending: { label: "En attente", color: "text-yellow-600" },
};

const getAvatarUrl = () => Image;

export default function OrganisationChart({ eventId, token, refreshTrigger }) {
  const [personnels, setPersonnels] = useState([]);
  const [error, setError] = useState("");

  const organisateur = {
    id: "static-organisateur",
    nom: "createur de l'evenement",
    role: "organisateur",
  };

  useEffect(() => {
    if (!eventId || !token) return;
    const fetchPersonnels = async () => {
      try {
        const data = await getPersonnelByEventId(eventId, token);
        setPersonnels(data);
      } catch (err) {
        setError("Erreur lors du chargement des personnels.");
      }
    };
    fetchPersonnels();
    const interval = setInterval(fetchPersonnels, 6000);
    return () => clearInterval(interval);
  }, [eventId, token, refreshTrigger]);

  const renderNode = (person) => {
    const avatar = getAvatarUrl();
    const status = statusLabels[person.status];

    return (
      <div className="flex flex-col items-center text-center relative">
        <div className="w-16 h-16 mb-2">
          <img
            src={avatar}
            alt={person.nom}
            className="rounded-full shadow-md w-full h-full object-cover"
          />
        </div>
        <div className="text-gray-700 font-semibold">{person.nom}</div>
        <div className="text-sm text-gray-500">
          {roleLabels[person.role] || "Organisateur"}
        </div>
        <div className={`text-xs mt-1 ${status?.color}`}>{status?.label}</div>
      </div>
    );
  };
  const rolesSousOrganisateur = personnels.filter((p) =>
    ["accueil", "caissier", "cuisinier"].includes(p.role)
  );

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-xl shadow-lg overflow-x-auto">
      <h1 className="text-3xl text-gray-400 font-bold  mb-10">ORGANIGRAMME</h1>
      {error && <p className="text-red-500">{error}</p>}
      {personnels.length === 0 ? (
        <p className="text-gray-500">Aucun personnel enregistré.</p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            {renderNode(organisateur)}
            <div className="w-0.5 h-10 bg-gray-400 mt-2"></div>
          </div>
          <div className="relative w-full flex justify-center items-center mt-2 mb-2">
            <div className="absolute top-0 h-0.5 w-64 bg-gray-400"></div>
          </div>
          <div className="flex justify-center gap-10 mt-4">
            {rolesSousOrganisateur.map((person) => (
              <div key={person.id} className="relative flex flex-col items-center">
                <div className="w-0.5 h-6 bg-gray-400 absolute top-[-28px] left-1/2 transform -translate-x-1/2"></div>
                {renderNode(person)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}