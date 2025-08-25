import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, getAuth, getRedirectResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import axiosClient from '../../api/axios-client';

// Connexion avec Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);

  const response = await axiosClient.post(`/admin/login/admin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    user: response.data.user,
    access_token: response.data.access_token,
  };
};

// Connexion avec Facebook
export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);

  const response = await axiosClient.post(`/admin/login/admin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    user: response.data.user,
    access_token: response.data.access_token,
  };
};

// Gestion des redirections (mobile / PWA)
export const handleRedirectResult = async () => {
  const auth = getAuth();
  const result = await getRedirectResult(auth);

  if (result) {
    const token = await result.user.getIdToken();
    return token;
  } else {
    return null;
  }
};

// Déconnexion Firebase
export const logout = () => signOut(auth);
