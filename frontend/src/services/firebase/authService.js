import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import axiosClient from "../api/axios-client";

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();
  const providerData = result.user.providerData[0]; // Profil Google
  const res = await axiosClient.post('/auth/firebase', { idToken });

  console.log("Résultat attendue : ",res)

  return {
    token,
    name: result.user.displayName,
    email: result.user.email,
    photoURL: result.user.photoURL,
    providerId: providerData.providerId, // 'google.com'
  };
};

export const loginWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();
  const providerData = result.user.providerData[0]; // Profil Facebook

const res = await axiosClient.post('/auth/firebase', { idToken });

  console.log("Résultat attendue : ",res)

  return {
    token,
    name: result.user.displayName,
    email: result.user.email,
    photoURL: result.user.photoURL,
    providerId: providerData.providerId, // 'facebook.com'
  };
};

export const logout = () => signOut(auth);
