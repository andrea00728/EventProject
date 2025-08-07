import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut, getAuth, getRedirectResult } from 'firebase/auth';
import { auth } from './firebaseConfig';
import axios from 'axios';
import { useStateContext } from '../../context/ContextProvider';

const URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"

export const signInWith = async (props) => {
  const provider = props === "Google" ? new GoogleAuthProvider() : new FacebookAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const token = await result.user.getIdToken(true);
  const response = await axios.post(`${URL}/admin/login/admin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const res = response.data;
  sessionStorage.setItem("USER", JSON.stringify(res.user));   
  sessionStorage.setItem("ACCESS_TOKEN", res.access_token); 
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
