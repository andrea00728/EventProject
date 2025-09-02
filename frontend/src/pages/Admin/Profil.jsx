import React, { useState, useEffect } from "react";
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
  const [gravatarUrl, setGravatarUrl] = useState(null);

  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");

  const showNotification = (type, message, duration = 4000) => {
    setNotification({ type, message, visible: true });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, visible: false })),
      duration
    );
  };

  // Charger le profil (user + localStorage)
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setProfile({ name: "", email: "", bio: "", photo: "", newFile: null });
      setLoading(false);
      return;
    }

    const autoName = deriveNameFromEmail(user.email);

    // 🔹 Charger depuis localStorage
    const storedName = localStorage.getItem("adminName");
    const storedPhoto = localStorage.getItem("adminPhoto");

    setProfile({
      name: storedName || user.name || autoName,
      email: user.email || "",
      bio: user.bio || "",
      photo: storedPhoto || user.photo || "",
      newFile: null,
    });
    setLoading(false);
  }, [user, isAuthenticated]);

  // Générer Gravatar auto selon l'email
  useEffect(() => {
    if (profile?.email) {
      const hash = md5(profile.email.trim().toLowerCase());
      setGravatarUrl(
        `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`
      );
    } else {
      setGravatarUrl(null);
    }
  }, [profile?.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        setProfile((prev) => ({ ...prev, photo: reader.result, newFile: file }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("bio", profile.bio || "");
    if (profile.newFile) formData.append("photo", profile.newFile);

    const response = await axiosClient.post("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true, // 🔑 pour envoyer le cookie JWT
    });

    // 🔑 Mettre à jour localStorage
    if (response.data.user) {
      localStorage.setItem("adminName", response.data.user.name);
      localStorage.setItem("adminPhoto", response.data.user.photo);
      localStorage.setItem("adminEmail", response.data.user.email);
    }

    // 🔑 Mettre à jour le contexte global (user)
    setUser(response.data.user);

    showNotification("success", "Profil mis à jour avec succès !");
  } catch (err) {
    console.error(
      "Erreur lors de la mise à jour du profil:",
      err.response?.data || err.message
    );
    showNotification("error", "Erreur lors de la mise à jour du profil");
  } finally {
    setIsSaving(false);
  }
};



  const containerClasses = `min-h-auto py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
    darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
  }`;
  const cardClasses = `p-6 w-full rounded-xl shadow-lg transition-colors duration-300 ${
    darkMode
      ? "bg-gray-800 border border-gray-700"
      : "bg-white border border-gray-200"
  }`;
  const inputClasses = (disabled) =>
    `w-full p-4 border rounded-lg focus:outline-none focus:ring-2 resize-none transition-all duration-300 ${
      disabled
        ? darkMode
          ? "bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
          : "bg-gray-200 border-gray-300 text-gray-600 cursor-not-allowed"
        : darkMode
        ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500"
        : "bg-gray-50 border-gray-200 text-gray-800 focus:ring-indigo-500"
    }`;
  const buttonClasses =
    "inline-flex items-center px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300";
  const labelClasses = `block font-semibold mb-2 transition-colors duration-300 ${
    darkMode ? "text-gray-200" : "text-gray-700"
  }`;

  if (loading)
    return (
      <div className={`${containerClasses} flex items-center justify-center`}>
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );

  const photoSrc = resolvePhotoSrc(profile.photo, gravatarUrl, placeholder);

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
                  <label className={labelClasses}>
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className={inputClasses(true)}
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
                    <FaSpinner className="animate-spin mr-2 w-5 h-5" />{" "}
                    Sauvegarde...
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
