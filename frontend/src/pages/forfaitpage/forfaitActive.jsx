import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../context/ContextProvider';
import { getUserForfait } from '../../services/forfaitService';
import { format } from 'date-fns';
import { FaCheckCircle } from 'react-icons/fa';
import SuccessIllustration from '../../assets/undraw_mobile-payments_0u42.svg';

const ForfaitActive = () => {
  const { token } = useStateContext();
  const navigate = useNavigate();
  const [forfait, setForfait] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchForfait = async () => {
      try {
        const data = await getUserForfait(token);
        setForfait(data.forfait);
        setExpirationDate(data.forfaitExpirationDate);
      } catch (err) {
        setError('Erreur lors de la récupération des informations du forfait.');
      }
    };

    fetchForfait();
  }, [token, navigate]);

  // Animations avec Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20, delay: 0.2 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <motion.div variants={iconVariants}>
          <img
            src={SuccessIllustration}
            alt="Succès"
            className="w-32 h-32 mx-auto mb-6"
          />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Forfait {forfait?.nom ? forfait.nom.toUpperCase() : 'Actif'} Activé avec Succès !
        </h1>
        <h2 className="text-lg text-gray-600 mb-6">
          Explorez dès maintenant les meilleures fonctionnalités de notre plateforme.
        </h2>
        {expirationDate && (
          <p className="text-sm text-gray-500 mb-6">
            Votre forfait est actif jusqu'au{' '}
            <span className="font-semibold text-indigo-600">
              {format(new Date(expirationDate), 'dd/MM/yyyy')}
            </span>.
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8">Merci de votre confiance !</p>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Découvrir les Fonctionnalités
        </motion.button>
        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ForfaitActive;