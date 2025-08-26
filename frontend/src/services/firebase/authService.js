import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import axiosClient from "../../api/axios-client";

// Détection simple mobile/desktop
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Connexion avec Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  if (isMobile) {
    await signInWithRedirect(auth, provider);
  } else {
    return await signInWithPopup(auth, provider);
  }
};

// Connexion avec Facebook
export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  if (isMobile) {
    await signInWithRedirect(auth, provider);
  } else {
    return await signInWithPopup(auth, provider);
  }
};

// Récupérer le résultat après redirection (mobile)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Erreur handleRedirectResult:", error);
    return null;
  }
};


// Déconnexion
export const logout = async () => {
  const res = await axiosClient.post(`/admin/logout`);
  //await signOut(auth);
  return res;
};
