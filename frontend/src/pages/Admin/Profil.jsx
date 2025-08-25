import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import { useStateContext } from "../../context/ContextProvider";
import { MdSave } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import axios from 'axios';
import axiosClient from '../../api/axios-client';

export default function SuperAdminProfileEdit() {
  const { darkMode } = useDarkMode();
  const { user, isAuthenticated, setUser } = useStateContext(); 
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    photo: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !isAuthenticated) {
        setError("Impossible de récupérer les informations de l'utilisateur.");
        setLoading(false);
        return;
      }

      setProfile({
        // firstName: user.firstName || '',
        // lastName: user.lastName || '',
        name: user.name,
        email: user.email || '',
        bio: user.bio || '',
        photo: user.photo || 'https://via.placeholder.com/150',
      });
      setLoading(false);
    };

    fetchProfileData();
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    // Logique pour gérer le changement de fichier
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prevProfile => ({ ...prevProfile, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('bio', profile.bio);

    if (profile.photo && profile.photo.startsWith('data:')) {
        
        const res = await fetch(profile.photo);
        const blob = await res.blob();
        formData.append('photo', blob);
    }

    try {
      const response = await axiosClient.post(`/auth/update-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(response.data.user);

      alert('Le profil a été mis à jour avec succès !');
    } catch (err) {
      console.error("Erreur de sauvegarde du profil :", err);
      setError("Erreur lors de la sauvegarde du profil. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  // Classes de styles communes pour une meilleure réutilisabilité
  const containerClasses = `min-h-auto py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
    darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
  }`;

  const cardClasses = `p-6 w-full rounded-xl shadow-lg transition-colors duration-300 ${
    darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
  }`;

  const inputClasses = (disabled) => `w-full p-4 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300 ${
    disabled
      ? (darkMode ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed" : "bg-gray-200 border-gray-300 text-gray-600 cursor-not-allowed")
      : (darkMode ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" : "bg-gray-50 border-gray-200 text-gray-800 focus:ring-indigo-500")
  }`;

  const buttonClasses = `inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300`;

  const textClasses = darkMode ? "text-gray-300" : "text-gray-800";
  const labelClasses = `block font-semibold mb-2 transition-colors duration-300 ${darkMode ? "text-gray-200" : "text-gray-700"}`;

  if (loading) {
    return (
      <div className={`${containerClasses} flex items-center justify-center`}>
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="max-w-full mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Édition du Profil Super Administrateur
          </h1>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 mb-6 rounded-lg shadow-md transition-colors duration-300 flex items-center ${
              darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-700"
            }`}
          >
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cardClasses + " mb-8"}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-10">
              <img
                src={profile.photo}
                alt="Photo de profil"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md transition-all duration-300 ${darkMode ? "border-blue-500" : "border-indigo-500"}`}
              />
              <label
                htmlFor="profilePictureInput"
                className={`mt-4 px-4 py-2 font-semibold rounded-full shadow-md transition-colors duration-300 cursor-pointer ${
                  darkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Changer la photo
              </label>
              <input id="profilePictureInput" type="file" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label htmlFor="firstName" className={labelClasses}>Nom de l'Admin</label>
                  <input
                    type="text"
                    id="firstName"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className={inputClasses(false)}
                  />
                </div>
                {/* <div className="mb-6">
                  <label htmlFor="lastName" className={labelClasses}>Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    className={inputClasses(false)}
                  />
                </div> */}
                <div className="mb-6">
                  <label htmlFor="email" className={labelClasses}>Adresse E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled
                    className={inputClasses(true)}
                  />
                </div>
              </div>
              
              <div>
                <div className="mb-6">
                  <label htmlFor="bio" className={labelClasses}>Biographie</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="6"
                    className={inputClasses(false)}
                  />
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
                className={`${buttonClasses} w-full md:w-auto text-lg ${
                  darkMode ? "bg-green-600 text-white hover:bg-green-700" : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 w-5 h-5" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <MdSave className="mr-2 w-5 h-5" />
                    Sauvegarder les modifications
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}