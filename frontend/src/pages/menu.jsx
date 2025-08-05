import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MenuItemForm from './menuItem';

const MenuForm = () => {
  const [name, setName] = useState('');
  const [eventId, setEventId] = useState('');
  const [events, setEvents] = useState([]);
  const [menus, setMenus] = useState([]);
  const [message, setMessage] = useState('');
  const [createdMenuId, setCreatedMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Récupérer les événements
  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://api.mastertable.site/evenements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des événements.');
      console.error(error);
    }
  };

  // Récupérer les menus pour vérifier les doublons
  const fetchMenus = async () => {
    try {
      const res = await axios.get('http://api.mastertable.site/menus', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenus(res.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des menus.');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMenus();
  }, []);

  // Vérifier si un menu existe déjà pour l'événement
  const menuExists = () => {
    return menus.some(menu => menu.name === name.trim() && menu.event?.id === Number(eventId));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    if (!name.trim() || !eventId) {
      setMessage('Veuillez remplir tous les champs.');
      setIsLoading(false);
      return;
    }

    if (menuExists()) {
      setMessage('Un menu avec ce nom existe déjà pour cet événement.');
      setIsLoading(false);
      return;
    }

    try {
      const body = { name: name.trim(), eventId: Number(eventId) };
      const response = await axios.post('http://api.mastertable.site/menus', body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.id) {
        setCreatedMenuId(response.data.id);
        setMessage('Menu créé avec succès !');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setMessage('Accès refusé : vous devez être organisateur.');
      } else if (error.response?.status === 409) {
        setMessage('Un menu avec ce nom existe déjà pour cet événement.');
      } else {
        setMessage('Erreur lors de la création du menu.');
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded-md shadow-md mt-10">
      {createdMenuId ? (
        <MenuItemForm menuId={createdMenuId} token={token} />
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600 dark:text-blue-400">
            Créer un Menu
          </h2>
          {message && (
            <p className={`text-center mb-4 ${message.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Nom du Menu
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Entrez le nom du menu"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Événement
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              >
                <option value="">Sélectionnez un événement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-md text-white font-semibold transition ${
                isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Création en cours...' : 'Créer le Menu'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default MenuForm;
