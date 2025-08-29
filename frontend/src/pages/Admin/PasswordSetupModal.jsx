import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePasswordUser } from "../../services/service";
import { useStateContext } from "../../context/ContextProvider";

export const PasswordSetupModal = ({ show, onClose, darkMode }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const {user} = useStateContext()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Vérification correspondance
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    // Vérification mot de passe moins strict
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[\d,.@!#]).{6,20}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Le mot de passe doit contenir 6 à 20 caractères, au moins une lettre et au moins un chiffre ou un caractère spécial (, . @ ! #)"
      );
      return;
    }

    try {
      const res = await updatePasswordUser(password);
      setSuccess(res.data.message || "Mot de passe défini avec succès !");

      if (dontShowAgain) {
        localStorage.setItem("hidePasswordModal", "true");
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("Erreur lors de la création du mot de passe");
    }
  };

  const handleDontShowAgain = () => {
    setDontShowAgain(!dontShowAgain);
    localStorage.setItem("hidePasswordModal", !dontShowAgain);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`rounded-3xl shadow-2xl p-8 w-full max-w-md border-t-4 
              ${
                darkMode
                  ? "bg-gray-800 border-blue-400 text-gray-200"
                  : "bg-white border-blue-600 text-gray-800"
              }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2 className="text-2xl font-extrabold mb-2 text-center">
              Bienvenue, {user.role != "admin" ? "Super Admin" : "Admin"} ! ✨
            </h2>
            <p
              className={`mb-4 text-center ${darkMode ? "text-gray-300" : "text-gray-600"}`}
            >
              Vous n'avez pas encore défini de mot de passe. Pour sécuriser
              votre compte administrateur, veuillez en créer un maintenant.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                className={`w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none
                  ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-400"
                      : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
                  }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                className={`w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none
                  ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-400"
                      : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
                  }`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <div className="flex items-center gap-2 ml-4 mt-1">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={handleDontShowAgain}
                  id="dontShowAgain"
                  className={`w-4 h-4 rounded ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <label
                  htmlFor="dontShowAgain"
                  className={darkMode ? "text-gray-200" : "text-gray-700"}
                >
                  Ne plus afficher ce message
                </label>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              {success && (
                <p className="text-green-500 text-sm text-center">{success}</p>
              )}

              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-5 py-2 rounded-lg border transition
                    ${
                      darkMode
                        ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-semibold transition
                    ${
                      darkMode
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
