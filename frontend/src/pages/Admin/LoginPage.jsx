import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../context/ContextProvider';
import { signInWithGoogle, signInWithFacebook, handleRedirectResult } from '../../services/firebase/authService'; 
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LoginPage = () => {

  const { setToken, setUser } = useStateContext();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null); // <-- Ajout de l'état pour l'erreur

  useEffect(() => {
  const checkRedirectResult = async () => {
    const token = await handleRedirectResult();
    if (token) {
      // Faire l'appel à ton backend avec le token
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login/admin`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setToken(res.access_token);
        setUser(res.user);

        navigate('/AdminAccueil');
      } catch (error) {
        console.error("Erreur lors de la connexion Google (redirect):", error);
        setErrorMessage("Accès non autorisé.");
      }
    }
  };

  checkRedirectResult();
}, []);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);  // Réinitialiser l'erreur
    try {
      const token = await signInWithGoogle();
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login/admin`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = response.data;
      setToken(res.access_token);
      setUser(res.user);

      navigate('/AdminAccueil');
    } catch (error) {
      console.error("Erreur lors de la connexion Google :", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage("Accès non autorisé. Votre compte n'a pas les droits d'admin.");
      } else {
        setErrorMessage("Erreur de connexion. Veuillez réessayer.");
      }
    }
  };

  const handleFacebookLogin = async () => {
    setErrorMessage(null);  // Réinitialiser l'erreur
    try {
      const token = await signInWithFacebook();
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login/admin`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = response.data;
      setToken(res.access_token);
      setUser(res.user);

      navigate('/AdminAccueil');
    } catch (error) {
      console.error("Erreur lors de la connexion Facebook :", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage("Accès non autorisé. Votre compte n'a pas les droits d'admin.");
      } else {
        setErrorMessage("Erreur de connexion. Veuillez réessayer.");
      }
    }
  };

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
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Connexion Admin</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Veuillez vous connecter avec votre compte</p>

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
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 py-3 rounded-xl shadow hover:shadow-md transition mb-4"
        >
          <FcGoogle size={24} />
          Connexion avec Google
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl shadow hover:bg-blue-700 transition"
        >
          <FaFacebook size={24} />
          Connexion avec Facebook
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
