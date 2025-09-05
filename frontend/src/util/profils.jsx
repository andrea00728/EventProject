import { useEffect, useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Camera, LogOut, Mail, User, X, Save, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../api/axios-client";
import { useNavigate } from "react-router-dom";
import md5 from "blueimp-md5";

const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:");
const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isLikelyBase64 = (v) =>
  typeof v === "string" && /^[A-Za-z0-9+/]+={0,2}$/.test(v) && v.length % 4 === 0;

const resolvePhotoSrc = (photo, email, previewImage) => {
  const placeholder = "https://via.placeholder.com/150";
  if (previewImage) return previewImage;
  if (photo && typeof photo === "string") {
    if (isDataUrl(photo)) return photo;
    if (isLikelyBase64(photo)) return `data:image/jpeg;base64,${photo}`;
    if (isHttpUrl(photo)) return photo;
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "https://api.mastertable.site";
    const path = photo.startsWith("/") ? photo : `/${photo}`;
    return `${base}${path}`;
  }
  if (email) {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=150`;
  }
  return placeholder;
};

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
};
const buttonVariants = { hover: { scale: 1.05 }, tap: { scale: 0.95 } };

export default function Profil() {
  const { user, setUser, isLoading, handleLogout } = useStateContext();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoto, setUserPhoto] = useState("/default-avatar.png");

  const [isOpenProfil, setIsOpenProfil] = useState(false);
  const [openEditProfil, setOpenEditProfil] = useState(false);
  const [confirmLogOut, setConfirmLogOut] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    photo: null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const photoUrl = resolvePhotoSrc(user.photo, user.email);
    setUserName(user.name || "");
    setUserEmail(user.email || "");
    setUserPhoto(photoUrl);
    setPreviewImage(null);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      photo: null,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [user]);

  if (isLoading) return <p className="text-center text-gray-600">Chargement...</p>;

  const handleConfirmLogOut = async () => {
    try { await axiosClient.post("/auth/logout"); }
    finally {
      handleLogout();
      setConfirmLogOut(false);
      navigate("/", { replace: true });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const 
  handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setPreviewImage(null);

    if (file.size > 5 * 1024 * 1024) return setErrors(prev => ({ ...prev, photo: "La taille de l'image ne doit pas dépasser 5MB" }));
    if (!file.type.startsWith("image/")) return setErrors(prev => ({ ...prev, photo: "Veuillez sélectionner une image valide" }));

    setEditFormData(prev => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewImage(ev.target.result);
    reader.readAsDataURL(file);
    if (errors.photo) setErrors(prev => ({ ...prev, photo: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editFormData.name.trim()) newErrors.name = "Le nom est requis";
    if (!editFormData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) newErrors.email = "Veuillez entrer un email valide";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("email", editFormData.email);
      if (editFormData.photo) formData.append("photo", editFormData.photo);
      if (editFormData.name) formData.append("name", editFormData.name);
      if (editFormData.newPassword) {
        formData.append("current_password", editFormData.currentPassword);
        formData.append("new_password", editFormData.newPassword);
        formData.append(
          "new_password_confirmation",
          editFormData.confirmPassword
        );
      }

      const response = await axiosClient.post(
        "/auth/update-profile",
        formData,
        { withCredentials: true }
      );

      const updatedUser = response.data.user;

      // Persistance dans ContextProvider (et localStorage)
      setUser(updatedUser);

      // 🔹 Générer la nouvelle photo
      const newPhotoUrl = resolvePhotoSrc(
        updatedUser.photo,
        updatedUser.name,
        updatedUser.email
      );
      setUserPhoto(newPhotoUrl);
      setPreviewImage(null);

      setSuccessMessage("Profil mis à jour avec succès !");
      setEditFormData(prev => ({ ...prev, photo: null, currentPassword: "", newPassword: "", confirmPassword: "" }));

      setTimeout(() => {
        setSuccessMessage("");
        setOpenEditProfil(false);
      }, 2000);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({
          general: "Une erreur est survenue lors de la mise à jour",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* Avatar */}
      <motion.div className="flex items-center gap-2 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsOpenProfil(true)}>
        <img src={userPhoto} alt="Photo de profil" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200" />
      </motion.div>

      {/* Profil Modal */}
      <AnimatePresence>
        {isOpenProfil && (
          <motion.div className="fixed top-15 inset-0 z-50 flex items-start justify-end p-4 sm:p-6" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={() => setIsOpenProfil(false)}>
            <motion.div className="relative bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/20 w-full max-w-xs sm:max-w-sm p-6" variants={modalVariants} onClick={e => e.stopPropagation()}>
              <motion.button className="absolute top-3 right-3 p-1.5 bg-gray-100/80 rounded-full" onClick={() => setIsOpenProfil(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <X size={18} />
              </motion.button>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-r from-blue-400 to-purple-500">
                    <img src={userPhoto} alt="Photo de profil" className="w-full h-full rounded-full object-cover border-2 border-white" />
                  </div>
                  <motion.button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setOpenEditProfil(true)}>
                    <Camera size={16} className="text-gray-600" />
                  </motion.button>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{userName}</h2>
                  <p className="text-gray-600 text-sm flex items-center justify-center gap-2 mt-2"><Mail size={16} />{userEmail}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />En ligne
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <motion.button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold" onClick={() => setOpenEditProfil(true)} variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <User size={18} />Éditer mon profil
                  </motion.button>
                  <motion.button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold" onClick={() => setConfirmLogOut(true)} variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <LogOut size={18} />Déconnexion
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Profil Modal */}
      <AnimatePresence>
        {openEditProfil && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center h-screen bg-black/30 backdrop-blur-xs p-2" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={() => setOpenEditProfil(false)}>
            <motion.div className="bg-white rounded-2xl shadow-xl border border-gray-100/20 w-full max-w-md mx-auto my-8" variants={modalVariants} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white rounded-t-2xl relative">
                <motion.button className="absolute top-3 right-3 p-1.5" onClick={() => setOpenEditProfil(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X size={18} /></motion.button>
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full"><User size={20} /></div>
                  <h2 className="text-lg font-bold">Éditer mon profil</h2>
                </div>
              </div>

              <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
                {errors.general && <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">{errors.general}</div>}
                {successMessage && <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm">{successMessage}</div>}

                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img src={previewImage || userPhoto || "/default-avatar.png"} alt="Aperçu" className="w-20 h-20 rounded-full object-cover border-4 border-gray-200" />
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                      <Upload size={16} className="text-white" />
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  {errors.photo && <p className="text-red-500 text-xs">{errors.photo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input type="text" name="name" value={editFormData.name} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`} placeholder="Entrez votre nom" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse email</label>
                  <input type="email" name="email" value={editFormData.email} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`} placeholder="Entrez votre email" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button type="button" onClick={() => setOpenEditProfil(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium" variants={buttonVariants} whileHover="hover" whileTap="tap">Annuler</motion.button>
                  <motion.button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" variants={buttonVariants} whileHover="hover" whileTap="tap">
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={16} />Enregistrer</>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <AnimatePresence>
        {confirmLogOut && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center h-screen bg-black/30 backdrop-blur-xs" variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" onClick={() => setConfirmLogOut(false)}>
            <motion.div className="bg-white/95 rounded-2xl shadow-xl border border-gray-100/20 max-w-md mx-auto" variants={modalVariants} onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white rounded-t-2xl relative">
                <motion.button className="absolute top-3 right-3 p-1.5" onClick={() => setConfirmLogOut(false)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}><X size={18} /></motion.button>
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-white/20 rounded-full"><LogOut size={20} /></div>
                  <h2 className="text-lg font-bold">Confirmer la déconnexion</h2>
                </div>
              </div>
              <div className="p-6 text-center">
                <p className="text-gray-700 mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <div className="flex justify-center gap-4">
                  <motion.button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-semibold" onClick={handleConfirmLogOut} variants={buttonVariants} whileHover="hover" whileTap="tap">Oui</motion.button>
                  <motion.button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold" onClick={() => setConfirmLogOut(false)} variants={buttonVariants} whileHover="hover" whileTap="tap">Non</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
