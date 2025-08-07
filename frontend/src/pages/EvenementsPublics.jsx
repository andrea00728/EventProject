// pages/EvenementsPublics.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const EvenementsPublics = () => {
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/evenements/publics`) // Adapte le port si nécessaire
      .then(response => {
        setEvenements(response.data);
      })
      .catch(error => {
        console.error('Erreur lors du chargement des événements publics :', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Événements Publics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evenements.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to={`/evenement/${event.id}`}>
              <Card className="shadow-lg hover:shadow-xl transition">
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold">{event.nom}</h2>
                  <p className="text-sm text-gray-500">{event.type} - {event.theme}</p>
                  <p className="text-sm">{new Date(event.date).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{event?.location?.nom} - {event?.salle?.nom}</p>
                  <p className="text-xs mt-1 text-green-700 font-semibold">Événement Public</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EvenementsPublics;
