import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/ContextProvider";
import {
  signInWithGoogle,
  signInWithFacebook,
  handleRedirectResult,
} from "../../services/firebase/authService";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { url } from "../../api/url";

const LoginPage = () => {
  const { setUser, setIsAuthenticated, isLoading } = useStateContext();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);


  if (isLoading) return <div>Chargement...</div>;

  const handleDirection = () => {
    return window.location.href = `${url}/admin/google`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.button
        onClick={handleDirection}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center gap-2 border py-2 px-4 rounded"
      >
        <FcGoogle size={24} /> Connexion avec Google
      </motion.button>
    </div>
  );
};

export default LoginPage;
