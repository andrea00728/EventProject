import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import { useStateContext } from "../../context/ContextProvider";
import { MdSave } from "react-icons/md";
import { FaSpinner, FaUpload } from "react-icons/fa";
import { updateAdmin } from "../../services/userService";

export default function SuperAdminProfileEdit() {
  const { darkMode } = useDarkMode();
  const { user, setUser } = useStateContext();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    photo: "",
    newFile: null,
    preview: null, // 🔹 aperçu local de la photo
  });

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    visible: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  // 🔹 Gestion du changement de fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        newFile: file,
        preview: URL.createObjectURL(file), // génère un aperçu local
      }));
    }
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("bio", profile.bio || "");
    if (profile.newFile) formData.append("photo", profile.newFile);
    if (passwords.newPassword)
      formData.append("password", passwords.newPassword);

    try {
      if (!user) return;
      const response = await updateAdmin(user?.sub, formData);
      setUser(response.user);

      setNotification({
        type: "success",
        message: "Profil mis à jour avec succès ✅",
        visible: true,
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        message: "Une erreur est survenue ❌",
        visible: true,
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
    }
  };

  return (
    <div
      className={`min-h-auto py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Édition du Profil Super Administrateur
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`p-6 w-full rounded-xl shadow-lg transition-colors duration-300 ${
            darkMode
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          } mb-8`}
        >
          <form onSubmit={handleSubmit}>
            {/* 🔹 Photo de profil */}
            <div className="flex flex-col items-center mb-10">
              <img
                src={profile.preview || user.photo}
                alt="Photo de profil"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md transition-all duration-300 ${
                  darkMode ? "border-blue-500" : "border-indigo-500"
                }`}
              />

              {/* Bouton upload stylisé avec animation */}
              <motion.label
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 flex items-center cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <FaUpload className="mr-2" />
                <span>Choisir une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </motion.label>
            </div>

            {/* 🔹 Formulaire */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Nom de l'Admin
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full p-4 border rounded-lg"
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1">{nameError}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full p-4 border rounded-lg bg-gray-200 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-4 border rounded-lg"
                  />
                </div>
                <div className="mb-6">
                  <label className="block font-semibold mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full p-4 border rounded-lg"
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mb-4">{passwordError}</p>
                )}
              </div>
            </div>

            {/* 🔹 Bouton Sauvegarde */}
            <div className="text-center mt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
                className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 ${
                  darkMode
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2 w-5 h-5" /> Sauvegarde...
                  </>
                ) : (
                  <>
                    <MdSave className="mr-2 w-5 h-5" /> Sauvegarder
                  </>
                )}
              </motion.button>

              {/* 🔹 Notifications */}
              <AnimatePresence>
                {notification.visible && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 p-3 rounded-lg shadow-md text-center w-full md:w-auto mx-auto ${
                      notification.type === "success"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {notification.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
