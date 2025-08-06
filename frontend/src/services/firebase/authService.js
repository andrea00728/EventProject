import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, getAuth, getRedirectResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import axios from 'axios';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);
  return token;
};

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);
  return token;
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
