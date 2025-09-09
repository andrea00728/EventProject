import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA__IoaaG303EayQaiNDkAsW43FO4h0lec",
  authDomain: "gestionevenement-947d3.firebaseapp.com",
  projectId: "gestionevenement-947d3",
  storageBucket: "gestionevenement-947d3.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
