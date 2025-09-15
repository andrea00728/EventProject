import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { url } from "../../api/url";
import axiosClient from "../../api/axios-client";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Vérifie si un paramètre "error" est présent dans l'URL
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      if (!email || !password) {
        throw new Error("Veuillez remplir tous les champs !");
      }

      // Appel à l'API NestJS
      const response = await axiosClient.post(
        "/admin/login-email",
        { email, password },
        { withCredentials: true } // très important pour les cookies HTTP-only
      );

      // Redirection après succès
      if(response.data){
        window.location.href = '/AdminAccueil';
      }

      } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(error.message || "Erreur lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = () => {
    window.location.href = `${url}/admin/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Connexion
        </h2>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded bg-red-600 text-white text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Champ Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Champ Mot de passe */}
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bouton Connexion */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold rounded-lg shadow-md"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </motion.button>
        </form>

        {/* Séparateur */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-3 text-gray-400">ou</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        {/* Bouton Google */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full gap-3 py-2 bg-white text-gray-900 font-medium rounded-lg shadow-md hover:bg-gray-100"
        >
          <FcGoogle size={22} /> Continuer avec Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
