import { useStateContext } from "../context/ContextProvider";
import axiosClient from "../api/axios-client";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { setUser, setIsAuthenticated } = useStateContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/pagepublic", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      setUser(null);
      setIsAuthenticated(false);
      navigate("/pagepublic", { replace: true });
    }
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Déconnexion
    </button>
  );
};
export default LogoutButton;