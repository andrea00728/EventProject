import { useEffect, useState } from "react";
import { getPersonnelByEventId } from "../../services/personnel_service";
import * as XLSX from "xlsx";

const roleLabels = {
  accueil: "🛎️ Accueil",
  caissier: "💰 Caissier",
  cuisinier: "👨‍🍳 Cuisinier",
};

const statusLabels = {
  confirmed: { label: " Confirmé", style: "bg-green-100 text-green-800" },
  pending: { label: "🕒 En attente", style: "bg-yellow-100 text-yellow-800" },
};

export default function ListePersonnel({ eventId, token, refreshTrigger }) {
  const [personnels, setPersonnels] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (!eventId || !token) return;
    const fetchPersonnels = async () => {
      try {
        const data = await getPersonnelByEventId(eventId, token);
        setPersonnels(data);
        setFiltered(data);
      } catch (err) {
        setError("Erreur lors du chargement des personnels.");
      } finally {
        setLoading(false);
      }
    };
    fetchPersonnels();
  }, [eventId, token, refreshTrigger]);

  const handleFilter = (role) => {
    setSelectedRole(role);
  

    let result = personnels;

    if (role !== "all") {
      result = result.filter((p) => p.role === role);
    }
    setFiltered(result);
  };

  const handleExportExcel = () => {
    const data = filtered.map((p) => ({
      Nom: p.nom,
      Email: p.email,
      Rôle: roleLabels[p.role] || p.role,
      Statut: statusLabels[p.status]?.label || p.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Personnels");
    XLSX.writeFile(workbook, "liste_personnels.xlsx");
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="bg-gray-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
          personnels enregistrés : {filtered.length}
        </div>
        <button
          onClick={handleExportExcel}
          className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          📥 Exporter en Excel
        </button>
      </div>

      <div className="mb-6 flex gap-3 flex-wrap">
        <div className="flex gap-2">
          <span className="text-sm font-semibold text-gray-600 mt-1">Rôle :</span>
          {["all", ...Object.keys(roleLabels)].map((role) => (
            <button
              key={role}
              onClick={() => handleFilter(role, selectedStatus)}
              className={`px-4 py-1 rounded-full text-sm font-medium border ${
                selectedRole === role
                  ? "bg-indigo-600 text-white border-transparent"
                  : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {role === "all" ? "Tous" : roleLabels[role]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Chargement des personnels...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">Aucun personnel trouvé.</p>
      ) : (
        <ul className="space-y-3 animate-fade-in">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="p-4 rounded-xl border border-gray-200 shadow-sm bg-white flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">{p.nom}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm px-3 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-800 capitalize">
                  {roleLabels[p.role] || p.role}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-semibold ${
                    statusLabels[p.status]?.style || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabels[p.status]?.label || p.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

