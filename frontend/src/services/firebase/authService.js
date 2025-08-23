import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, getAuth, getRedirectResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import axios from 'axios';

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);
  const response = await axios.post(`${URL}/admin/login/admin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);
  const response = await axios.post(`${URL}/admin/login/admin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


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

export const logout = () => signOut(auth);
