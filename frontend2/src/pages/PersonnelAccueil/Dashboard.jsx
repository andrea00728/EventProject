import React, { useEffect, useState } from "react";
import { getCheckinStats } from "../../services/invitationService";
import { useStateContext } from "../../context/ContextProvider";

const DashboardpersAccueil = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useStateContext();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!token) throw new Error("Token manquant");

        const data = await getCheckinStats(token); // 👈 plus besoin d'eventId
        setStats(data);
      } catch (err) {
        console.error("Erreur API :", err.response?.data || err.message);
        setError(err.response?.data?.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <p className="text-center text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur : {error}</p>;
  if (!stats) return <p className="text-center text-gray-500">Aucune donnée reçue</p>;

  const { checkedIn, notCheckedIn } = stats;
  const total = checkedIn + notCheckedIn;
  const percentage = total > 0 ? ((checkedIn / total) * 100).toFixed(1) : 0;

  return (
    <div className="h-full py-8 px-6 space-y-6 rounded-xl border border-gray-200 bg-white">
      <h5 className="text-xl text-gray-600 text-center">📊 Statistiques de présence</h5>

      <div className="mt-2 flex justify-center gap-4">
        <h3 className="text-3xl font-bold text-gray-700">{checkedIn}</h3>
        <div className="flex items-end gap-1 text-green-500">
          <svg className="w-3" viewBox="0 0 12 15" fill="none">
            <path d="M6 0L12 8H0L6 0Z" fill="currentColor" />
          </svg>
            
          <span>{percentage}%</span>
        </div>
      </div>
      <span className="block text-center text-gray-500">
        Comparé aux {notCheckedIn} invités absents
      </span>

      <table className="w-full text-gray-600 mt-4">
        <tbody>
          <tr>
            <td className="py-2">Total invités</td>
            <td className="text-gray-500">{total}</td>
          </tr>
          <tr>
            <td className="py-2">Invités présents</td>
            <td className="text-gray-500">{checkedIn}</td>
          </tr>
          <tr>
            <td className="py-2">Invités absents</td>
            <td className="text-gray-500">{notCheckedIn}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DashboardpersAccueil;