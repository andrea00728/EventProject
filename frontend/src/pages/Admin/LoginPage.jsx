import { motion } from "framer-motion";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import {
  loginWithGoogle,
  loginWithFacebook,
} from "../../services/firebase/authService";
import { useStateContext } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { setUser } = useStateContext();
      const navigate = useNavigate();
  const handleLogin = async (provider) => {
    const response =
      provider === "google"
        ? await loginWithGoogle()
        : await loginWithFacebook();
    
    const result = {...response, role : "admin"}
    setUser(result);
    navigate('/AdminAccueil')
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-10 rounded-3xl shadow-2xl text-center w-full max-w-md"
      >
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800">
          SuperAdmin Login
        </h1>
        <button
          onClick={() => handleLogin("google")}
          className="flex items-center justify-center gap-3 w-full mb-4 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg rounded-xl hover:from-red-600 hover:to-red-700 transition"
        >
          <FaGoogle size={20} /> Continue with Google
        </button>
        <button
          onClick={() => handleLogin("facebook")}
          className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg rounded-xl hover:from-blue-600 hover:to-blue-700 transition"
        >
          <FaFacebook size={20} /> Continue with Facebook
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
