import { useEffect, useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../../context/ContextProvider";
import { getMyEvents } from "../../services/evenementServ";
import { createPersonnel } from "../../services/personnel_service";
import ListePersonnel from "./Listepersonnel";
import { checkEmail, textControll } from "../../services/controll_champs/controll_champs";

const roles = [
  { id: "accueil", label: "🛎️ Accueil", color: "bg-blue-100 text-blue-800" },
  { id: "caissier", label: "💰 Caissier", color: "bg-green-100 text-green-800" },
  { id: "cuisinier", label: "👨‍🍳 Cuisinier", color: "bg-yellow-100 text-yellow-800" },
];

export default function CreationPersonnel() {
  const { token } = useStateContext();
  const [form, setForm] = useState({ nom: "", email: "", role: "", event: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [eventError, setEventError] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getMyEvents(token);
        setEvents(data);
        if(data.length>0){
          setSelectedEvent(data[0].id);
          setForm({ ...form, event: data[0].id });
        }
      } catch (error) {
        setEventError(
          error.response?.data?.message || "Impossible de charger les événements"
        );
      } finally {
        setIsLoadingEvents(false);
      }
    };
    if (token) fetchEvents();
  }, [token]);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const jour = date.toLocaleDateString("fr-FR");
    const heure = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${jour} ${heure}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSelectEvent = (eventId) => {
    setSelectedEvent(eventId);
    setForm({ nom: "", email: "", role: "", event: eventId });
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!form.nom.trim() || !form.email.trim() || !form.role || !form.event) {
      setError(" Tous les champs sont obligatoires.");
      setLoading(false);
      return;
    }

    const emailValid=await checkEmail(form.email.trim());
    if(!emailValid){
      setError("Format d'email invalide.");
      setLoading(false);
      return;
    }

    try {
      await createPersonnel(
        {
          nom: form.nom.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          evenementId: Number(form.event),
        },
        token
      );

      setForm({ nom: "", email: "", role: "", event: form.event });
      setSuccess(" Invitation envoyée au personnel. En attente de confirmation.");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        " Erreur lors de la création du personnel."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Créer un Personnel</h1>

      {eventError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {eventError}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Sélectionner un événement</h2>

      {isLoadingEvents ? (
        <p className="text-gray-500 animate-pulse">Chargement des événements...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => handleSelectEvent(ev.id)}
              className={`cursor-pointer border rounded-xl p-5 shadow-md transition transform hover:-translate-y-1 ${
                selectedEvent === ev.id
                  ? "border-indigo-500 bg-indigo-50"
                  : "hover:border-indigo-300"
              }`}
            >
              <div className="flex flex-col gap-1 mb-2">
                <h3 className="text-lg font-semibold text-indigo-700">{ev.nom}</h3>
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <span>📅 Début : {formatDateTime(ev.date)}</span>
                  <span>🕓 Fin : {formatDateTime(ev.date_fin)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedEvent && (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
              <UserPlusIcon className="inline-block w-6 h-6 mr-2 text-indigo-500" />
              Infos du personnel
            </h2>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={(e)=>setForm({...form,nom:textControll(e.target.value)})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Nom du personnel"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Email</label>
             <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 ${
                  error.includes("e-mail") ? "border-red-500" : ""
                }`}
                placeholder="email@ii.com"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Rôle</label>
              <div className="flex gap-2 flex-wrap">
                {roles.map((roleObj) => (
                  <button
                    type="button"
                    key={roleObj.id}
                    onClick={() => setForm({ ...form, role: roleObj.id })}
                    className={`px-4 py-2 rounded-full font-medium border transition ${
                      form.role === roleObj.id
                        ? `${roleObj.color} border-transparent shadow`
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {roleObj.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 border border-red-300">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 border border-green-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              <UserPlusIcon className="w-5 h-5" />
              {loading ? "Création..." : "Créer le personnel"}
            </button>
          </form>

          <ListePersonnel eventId={selectedEvent} token={token} refreshTrigger={refreshKey} />
        </>
      )}
    </div>
  );
}

