import { useState,useEffect } from "react";
import {
  createPublicInvite,
  createInviteForSpecificEvent
} from "../../services/inviteService";
import { useStateContext } from "../../context/ContextProvider";
import { checkEmail, textControll } from "../../services/controll_champs/controll_champs";

export default function Inviteform({ onBack, eventId }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sex: "",
  });
  const [error, setError] = useState(null);
  const { token, user } = useStateContext(); // suppose que user et token sont accessibles ici
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  /**
   * 
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
      const emailValid = await checkEmail(form.email.trim());
      setIsValid(emailValid);
    }, 800);

    return () => clearTimeout(debouceTimeout);
  }, [form.email]);


  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // const emailValid = await checkEmail(form.email.trim());

    if (isValid === false) {
      setError("adresse email incorrecte ou inexistante.");
      const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const emailValid = await checkEmail(form.email.trim());
        if (!emailValid) {
          setError("L'adresse email saisie n'existe pas");
          setLoading(false);
          return;
        }

        try {
          let result;
          if (user && token && eventId) {
            // Utilisateur connecté avec eventId => création liée à l'événement
            const dataWithEvent = { ...form, eventId };
            result = await createInviteForSpecificEvent(dataWithEvent, token);
          } else {
            // Invité public / anonyme
            result = await createPublicInvite(form);
          }
          console.log("Invité créé :", result);
          setForm({ nom: "", prenom: "", email: "", sex: "" });
          setError(null);
        } catch (err) {
          console.error("Erreur complète lors de la création :", err);

          // Essaie d’extraire un message d’erreur précis côté backend
          if (err.response?.data?.message) {
            setError(err.response.data.message);
          } else if (err.response?.data) {
            setError(JSON.stringify(err.response.data));
          } else if (err.message) {
            setError(err.message);
          } else {
            setError("Erreur lors de la création de l'invité");
          }
        }


      };

      return (
        <form
          onSubmit={onSubmit}
          className="max-w-2xl w-450 mx-auto mt-14 bg-white rounded-3xl shadow-2xl border border-gray-100 p-10"
        >
          <h2 className="text-3xl font-extrabold text-center mb-2 text-indigo-800 tracking-tight">
            Ajouter un invité
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Remplissez les informations de l'invité à ajouter à votre événement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label htmlFor="nom" className="text-sm font-semibold text-gray-700">
                Nom
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                onChange={(e) => setForm({ ...form, nom: textControll(e.target.value) })}
                maxLength="50"
                value={form.nom}
                placeholder="Nom de l'invité"
                required
                className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="prenom" className="text-sm font-semibold text-gray-700">
                Prénom
              </label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: textControll(e.target.value) })}
                placeholder="Prénom de l'invité"
                required
                className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email de l'invité"
                required
                className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="sex" className="text-sm font-semibold text-gray-700">
                Sexe
              </label>
              <select
                id="sex"
                name="sex"
                value={form.sex}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-xl px-5 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-200 transition"
              >
                <option value="">-- Sélectionnez --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-500 mt-6 text-center bg-red-50 py-3 rounded-xl font-semibold">
              {error}
            </p>
          )}

          <div className="flex justify-between mt-10">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-8 py-3 rounded-xl bg-gray-200 text-indigo-800 font-semibold shadow hover:bg-gray-300 transition"
              >
                Retour
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl ${loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-700"
                  : "bg-indigo-700 text-white hover:bg-indigo-800"
                } font-bold shadow transition`}
            >
              {loading ? "Création..." : "Ajouter un invité"}
            </button>
          </div>
        </form>
      );
    }
  }
}
