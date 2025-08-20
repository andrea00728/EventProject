import { useEffect, useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "../../context/ContextProvider";
import { getMyEvents } from "../../services/evenementServ";
import { createPersonnel } from "../../services/personnel_service";
import ListePersonnel from "./Listepersonnel";
import { checkEmail, textControll } from "../../services/controll_champs/controll_champs";
import { Building2, Calendar, User, UserPlus } from "lucide-react";

const roles = [
  { id: "accueil", label: "🛎️ Accueil", color: "bg-blue-100 text-blue-800" },
  { id: "caissier", label: "💰 Caissier", color: "bg-green-100 text-green-800" },
  { id: "cuisinier", label: "👨‍🍳 Cuisinier", color: "bg-yellow-100 text-yellow-800" },
];

let debouceTimeout;
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
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getMyEvents(token);
        setEvents(data);
        if (data.length > 0) {
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


  /**
   * verification d'email
   * 
   */

  useEffect(() => {
    clearTimeout(debouceTimeout);

    if (!form.email.trim()) {
      setIsValid(null);
      return;
    }

    debouceTimeout = setTimeout(async () => {
      const valid = await checkEmail(form.email.trim());
      setIsValid(valid);
    }, 800);

    return () => clearTimeout(debouceTimeout);
  }, [form.email]);

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
    // const emailValid=await checkEmail(form.email.trim());
    // if(!emailValid){
    //   setError("Format d'email invalide.");
    //   setLoading(false);
    //   return;
    // }

    if (isValid === false) {
      setError("adresse email incorrecte ou inexistante.");
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
      // Gestion des erreurs spécifiques du backend
      const errorMessage = error.response?.data?.message;
      console.log("voici l'erreur", errorMessage);
      
      if (errorMessage === "Cet utilisateur a déjà un rôle dans cet événement.") {
        setError("Cet utilisateur a déjà un rôle dans cet événement.");
      } else if (
        errorMessage ===
        "L'utilisateur est déjà assigné à un autre événement pendant cette période."
      ) {
        setError(
          "L'utilisateur est déjà assigné à un autre événement pendant cette période."
        );
      } else if (errorMessage === "Événement non trouvé pour cet utilisateur.") {
        setError("Événement non trouvé pour cet utilisateur.");
      } else {
        setError(
          errorMessage || "Erreur lors de la création du personnel."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Header fixe */}
      <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Créer Personnel
            </h1>
            <p className="text-gray-600">Ajoutez un nouveau membre à votre équipe</p>
          </div>
        </div>

        {/* Sélecteur d'événements */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {isLoadingEvents ? (
            <div className="text-gray-500">Chargement des événements...</div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSelectEvent(event.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${selectedEvent === event.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
              >
                {event.nom || `Événement ${event.id}`}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contenu principal scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedEvent ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sélectionnez un événement
              </h3>
              <p className="text-gray-600">
                Choisissez un événement pour commencer à créer du personnel
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Messages d'erreur/succès */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {eventError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {eventError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Formulaire principal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Informations du personnel
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={form.nom}
                      onChange={(e) => setForm({ ...form, nom: textControll(e.target.value) })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Entrez le nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="exemple@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle *
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">-- Sélectionnez un rôle --</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setForm({
                    nom: '',
                    email: '',
                    role: '',
                    event: selectedEvent
                  })}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer le personnel'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );


}

