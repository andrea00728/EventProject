import React, { useEffect, useState } from 'react';
import { getAllForfait, updateForfait, getUserForfait } from '../../services/forfaitService';
import { useStateContext } from '../../context/ContextProvider';
import ForfaitModal from '../../components/Modal/ForfaitModal';
import { is } from 'date-fns/locale';

const ForfaitPage = ({ open, onClose }) => {
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeForfait, setActiveForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const { isAuthenticated } = useStateContext();

  useEffect(() => {
    if (!open || !isAuthenticated) return;
//
    const fetchData = async () => {
      try {
        // Récupérer tous les forfaits
        const forfaitsData = await getAllForfait();
        setForfaits(forfaitsData.filter((f) => f.nom.toLowerCase() !== 'freemium'));

        // Récupérer le forfait actif de l'utilisateur
        const userForfait = await getUserForfait();
        setActiveForfait(userForfait.forfait);
        setExpirationDate(userForfait.forfaitExpirationDate);
      } catch (err) {
        console.error('Erreur lors du chargement des données', err);
        alert('Erreur lors du chargement des forfaits ou du forfait actif');
      }
    };

    fetchData();
  }, [open, isAuthenticated]);

  const handleChoisir = async (nom) => {
    try {
      setLoading(true);
      const res = await updateForfait( nom);
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