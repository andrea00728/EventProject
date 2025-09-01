import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "../../context/DarkModeContext";
import { useStateContext } from "../../context/ContextProvider";
import { MdSave } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";
import axiosClient from "../../api/axios-client";
import { getAuth } from "firebase/auth";
import md5 from "blueimp-md5";

// Helpers pour détecter le type de photo
const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:");
const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isLikelyBase64 = (v) =>
  typeof v === "string" &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(v) &&
  v.length % 4 === 0;

// Résolution de la meilleure source
function resolvePhotoSrc(photo, gravatar, placeholder) {
  if (isDataUrl(photo)) return photo;
  if (isHttpUrl(photo)) return photo;
  if (isLikelyBase64(photo)) return `data:image/jpeg;base64,${photo}`;
  return gravatar || placeholder;
}

// Utilitaire : dériver le nom à partir de l'email
function deriveNameFromEmail(email) {
  if (!email) return "";
  return email.split("@")[0].replace(/\./g, " "); // exemple: "john.doe" → "john doe"
}

export default function SuperAdminProfileEdit() {
  const { darkMode } = useDarkMode();
  const { user, isAuthenticated, setUser } = useStateContext();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    photo: "",
    newFile: null,
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState({
    type: "",
    message: "",
    visible: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [gravatarUrl, setGravatarUrl] = useState(null);

  const placeholder = "https://via.placeholder.com/150";

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
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswords((prev) => ({ ...prev, [name]: value }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
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
    setPasswordError(""); // Réinitialiser l'erreur de mot de passe

    try {
      // Validation des mots de passe s'ils sont remplis
      if (passwords.newPassword || passwords.confirmPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setPasswordError("Les mots de passe ne correspondent pas.");
          showNotification("error", "Les mots de passe ne correspondent pas.");
          setIsSaving(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("bio", profile.bio || "");
      if (profile.newFile) formData.append("photo", profile.newFile);
      if (passwords.newPassword)
        formData.append("password", passwords.newPassword);

      const response = await axiosClient.post("/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.data.user) {
        localStorage.setItem("adminName", response.data.user.name);
        localStorage.setItem("adminPhoto", response.data.user.photo);
        localStorage.setItem("adminEmail", response.data.user.email);
      }

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
    <div className={containerClasses}>
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
          className={cardClasses + " mb-8"}
        >
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-10">
              <img
                src={photoSrc}
                alt="Photo de profil"
                className={`w-32 h-32 rounded-full object-cover border-4 shadow-md transition-all duration-300 ${
                  darkMode ? "border-blue-500" : "border-indigo-500"
                }`}
                onError={(e) => {
                  if (gravatarUrl && e.currentTarget.src !== gravatarUrl) {
                    e.currentTarget.src = gravatarUrl;
                    return;
                  }
                  if (e.currentTarget.src !== placeholder) {
                    e.currentTarget.src = placeholder;
                  }
                }}
              />

              <div className="flex space-x-4 mt-2">
                <label
                  htmlFor="profilePictureInput"
                  className={`px-4 py-2 font-semibold rounded-full shadow-md transition-colors duration-300 cursor-pointer ${
                    darkMode
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Changer la photo
                </label>
              </div>
              <input
                id="profilePictureInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label htmlFor="name" className={labelClasses}>
                    Nom de l'Admin
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profile.name}
                    readOnly
                    className={inputClasses(true)}
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className={labelClasses}>
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className={inputClasses(true)}
                  />
                </div>
                {/* <div className="mb-6">
                  <label htmlFor="bio" className={labelClasses}>
                    Biographie
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleChange}
                    rows="6"
                    className={inputClasses(false)}
                  />
                </div> */}
              </div>
              <div>
                <div className="mb-6">
                  <label htmlFor="new-password" className={labelClasses}>
                    Nouveau mot de passe
                  </label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className={inputClasses(!!passwordError)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="confirm-password" className={labelClasses}>
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    className={inputClasses(!!passwordError)}
                    required
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mb-4">{passwordError}</p>
                )}
              </div>
            </div>

            <div className="text-center mt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSaving}
                className={`${buttonClasses} w-full md:w-auto text-lg ${
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
                    <MdSave className="mr-2 w-5 h-5" /> Sauvegarder les
                    modifications
                  </>
                )}
              </motion.button>

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