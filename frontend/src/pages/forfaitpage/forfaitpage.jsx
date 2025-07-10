import React, { useEffect, useState } from 'react';
import { getAllForfait, updateForfait } from '../../services/forfaitService';
import { useStateContext } from '../../context/ContextProvider';
import ForfaitModal from '../../components/Modal/ForfaitModal';

const ForfaitPage = ({ open, onClose }) => {
  const [forfaits, setForfaits] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useStateContext();
   const [activeNom, setActiveNom] = useState(null);
 const filtreForfait = forfaits.filter((f) => f.nom.trim().toLowerCase() !== 'freemium');
  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      try {
        const data = await getAllForfait(token);
        setForfaits(data);
      } catch (err) {
        alert('Erreur lors du chargement des forfaits');
      }
    };
    fetchData();
  }, [open]);
  useEffect(() => {
  const fetchAll = async () => {
    try {
      const data = await getAllForfait(token);
      setForfaits(data);

      const res = await getSuccessForfait(token);
      if (res.nom) setActiveNom(res.nom);
    } catch (err) {
      console.error('Erreur dans la récupération du forfait actif', err);
    }
  };

  if (open && token) fetchAll();
}, [open, token]);

  const handleChoisir = async (nom) => {
    try {
      setLoading(true);
      const res = await updateForfait(token, nom);
      window.location.href = res.url;
    } catch (err) {
      alert(err.message || 'Erreur lors du choix du forfait');
    } finally {
      setLoading(false);
    }
  };

  return open ? (
    <ForfaitModal
      forfaits={filtreForfait}
      loading={loading}
      onChoisir={handleChoisir}
      activeNom={activeNom}
      onClose={onClose}
    />
  ) : null;
};

export default ForfaitPage;