import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/ContextProvider";
import {
  signInWithGoogle,
  signInWithFacebook,
} from "../../services/firebase/authService";
import { FcGoogle } from "react-icons/fc";
import { FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { getRedirectResult } from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import axiosClient from "../../api/axios-client";

const LoginPage = () => {
  const { setUser, setIsAuthenticated, isLoading } = useStateContext();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);

  // 🟢 useEffect pour gérer le retour après redirection Google
  // useEffect(() => {
  //   const handleRedirect = async () => {
  //     try {
  //       const result = await getRedirectResult(auth);

  //       if (result) {
  //         const token = await result.user.getIdToken(true);

  //         // Envoi vers ton backend NestJS
  //         const response = await axiosClient.post(
  //           `/admin/login/admin`,
  //           {},
  //           {
  //             headers: { Authorization: `Bearer ${token}` },
  //             withCredentials: true,
  //           }
  //         );

  //         // Mise à jour du contexte
  //         console.log("Réponse du backend :", response.data);
  //         setUser(response.data.user);
  //         setIsAuthenticated(true);

  //         navigate("/AdminAccueil");
  //       }
  //     } catch (error) {
  //       console.error("Erreur lors du retour Google :", error);
  //       setErrorMessage("Erreur de connexion avec Google.");
  //     }
  //   };

  //   handleRedirect();
  // }, [navigate, setUser, setIsAuthenticated]);

  // Bouton pour déclencher le login
  const handleLogin = async (provider) => {
    setErrorMessage(null);
    try {
      provider === "Google"
        ? await signInWithGoogle()
        : await signInWithFacebook();
      // ⚠️ Pas de mise à jour directe ici → car getRedirectResult prendra le relais
      navigate("/AdminAccueil");
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      setErrorMessage("Erreur de connexion. Veuillez réessayer.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <FaLock className="text-4xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Connexion Admin
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Veuillez vous connecter avec votre compte
        </p>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLogin("Google")}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 py-3 rounded-xl shadow hover:shadow-md transition mb-4"
        >
          <FcGoogle size={24} />
          Connexion avec Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
