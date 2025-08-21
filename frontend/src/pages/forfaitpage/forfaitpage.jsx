import React, { useEffect, useState } from 'react';
import { getAllForfait, updateForfait, getUserForfait } from '../../services/forfaitService';
import { useStateContext } from '../../context/ContextProvider';
import ForfaitModal from '../../components/Modal/ForfaitModal';

const ForfaitPage = ({ open, onClose }) => {
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const { token } = useStateContext();

  useEffect(() => {
    if (!open || !token) return;

    const fetchData = async () => {
      try {
        // Récupérer tous les forfaits
        const forfaitsData = await getAllForfait(token);
        setForfaits(forfaitsData.filter((f) => f.nom.toLowerCase() !== 'freemium'));

        // Récupérer le forfait actif de l'utilisateur
        const userForfait = await getUserForfait(token);
        setActiveForfait(userForfait.forfait);
        setExpirationDate(userForfait.forfaitExpirationDate);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
        alert('Erreur lors du chargement des forfaits ou du forfait actif');
      }
    };

    fetchData();
  }, [open, token]);

  const handleChoisir = async (nom) => {
    try {
      setLoading(true);
      const res = await updateForfait(token, nom);
      window.location.href = res.url;
    } catch (err) {
      console.error('Erreur lors du choix du forfait', err);
      alert(err.message || 'Erreur lors du choix du forfait');
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <ForfaitModal
      forfaits={forfaits}
      loading={loading}
      onChoisir={handleChoisir}
      onClose={onClose}
      activeForfait={activeForfait}
      expirationDate={expirationDate}
    />
  ) : null;
};

export default ForfaitPage;