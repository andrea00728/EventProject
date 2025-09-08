import React, { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Camera, Check } from "lucide-react";
import { loginUser, registerUser } from "../../services/authService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ButtonConnexion from "../../util/buttonconnexion";
import { useStateContext } from "../../context/ContextProvider";

export const AuthModal = ({ isOpen, onClose, isSignIn = false }) => {
  const [isSignUp, setIsSignUp] = useState(!isSignIn);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useStateContext();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));

      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const validateForm = () => {
  if (isSignUp) {
    if (!formData.name.trim()) {
      return "Le nom est requis";
    }
    if (formData.name.length < 2) {
      return "Le nom doit contenir au moins 2 caractères";
    }
  }

  if (!formData.email.includes('@')) {
    return "Email invalide";
  }

  if (formData.password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères";
  }

  return null;
};
 const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  console.log("Données envoyées:", {
    isSignUp,
    formData: {
      ...formData,
      photo: formData.photo ? formData.photo.name : 'Aucune photo'
    }
  });

  try {
    if (isSignUp) {
      // 🔹 Inscription
      const result = await registerUser(formData);
      
      if (!result) throw new Error("Erreur lors de l'inscription");
      
      toast.success("Inscription réussie !");
      
      // 🔹 Connexion automatique après inscription
      const loginResult = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (!loginResult?.user) throw new Error("Connexion automatique échouée");

      setUser(loginResult.user);
      setIsAuthenticated(true);
      toast.success("Connexion automatique réussie ✅");
      onClose();

      // 🔥 REDIRECTION VERS PAGEPUBLIC APRÈS SUCCÈS
      navigate("/", { replace: true });
      
    } else {
      // 🔹 Connexion
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (!result?.user) throw new Error("Utilisateur non trouvé.");

      setUser(result.user);
      setIsAuthenticated(true);
      toast.success("Connexion réussie ");
      onClose();

      // 🔥 REDIRECTION VERS PAGEPUBLIC APRÈS SUCCÈS
      navigate("/", { replace: true });
    }

  } catch (err) {
    console.error("Auth error :", err);
    
    let errorMessage = "Une erreur est survenue.";
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
    
  } finally {
    setLoading(false);
  }
};

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: null }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        
        {/* Bandeau gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
          <div className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse"></div>
        </div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 z-10 shadow-lg hover:shadow-xl"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Contenu */}
        <div className="overflow-y-auto max-h-[95vh] p-6 sm:p-8 pt-12">
          <div className="text-center mb-6">
            <div className="mb-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="text-white" size={24} />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {isSignUp ? "Rejoignez notre communauté" : "Bon retour parmi nous"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isSignUp
                ? "Créez votre profil en quelques étapes"
                : "Connectez-vous pour continuer"}
            </p>
          </div>

          {/* FORMULAIRE */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Photo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Photo de profil (optionnelle)
                  </label>
                  {photoPreview ? (
                    <div className="relative w-20 h-20 mx-auto">
                      <img
                        src={photoPreview}
                        alt="Aperçu"
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group"
                      >
                        <Camera
                          className="text-gray-400 group-hover:text-gray-500 mb-1"
                          size={24}
                        />
                        <p className="text-xs text-gray-500 group-hover:text-gray-600">
                          Cliquez pour ajouter une photo
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Nom */}
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Nom complet"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                name="email"
                placeholder="Adresse e-mail"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-white text-base sm:text-lg
                bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400
                hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500
                shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-200
                relative overflow-hidden group
                ${loading ? "opacity-70 cursor-not-allowed transform-none" : ""}
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <div className="flex items-center justify-center space-x-2 relative z-10">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    {isSignUp ? <User size={18} /> : <Check size={18} />}
                    <span>{isSignUp ? "Créer mon compte" : "Se connecter"}</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Connexion Google */}
          <div className="transform hover:-translate-y-2 transition-all duration-300 cursor-pointer mt-4">
            <ButtonConnexion />
          </div>

          {/* Bascule inscription/connexion */}
          <div className="text-center mt-5">
            <p className="text-gray-600 text-sm">
              {isSignUp ? "Déjà membre ?" : "Première visite ?"}
            </p>
            <button
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setError(null);
                setPhotoPreview(null);
                setFormData({ name: "", email: "", password: "", photo: null });
              }}
              className="mt-2 font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity text-base"
            >
              {isSignUp ? "Se connecter" : "Créer un compte"}
            </button>
          </div>

          {isSignUp && (
            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              En créant un compte, vous acceptez nos{" "}
              <span className="text-blue-500 hover:underline cursor-pointer font-medium">
                conditions d'utilisation
              </span>{" "}
              et notre{" "}
              <span className="text-blue-500 hover:underline cursor-pointer font-medium">
                politique de confidentialité
              </span>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
