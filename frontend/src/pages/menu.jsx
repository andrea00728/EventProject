import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MenuItemForm from './menuItem'; 

const MenuForm = () => {
  const [events, setEvents] = useState([]);
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [createdMenuId, setCreatedMenuId] = useState(null); 
  const token = localStorage.getItem('token');

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:3000/evenements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des événements.');
      console.error(error);
    }
  };

  const fetchMenus = async () => {
    try {
      const res = await axios.get('http://localhost:3000/menus', {
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
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const menuExists = menus.some(menu =>
      menu.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      Number(menu.event?.id) === Number(eventId)
    );

    if (menuExists) {
      setMessage('Erreur : un menu avec ce nom existe déjà pour cet événement.');
      setLoading(false);
      return;
    }

    try {
      const body = { name: name.trim(), eventId: Number(eventId) };
      const response = await axios.post('http://localhost:3000/menus', body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.id) {
        setMessage('Menu créé avec succès !');
        setCreatedMenuId(response.data.id); // Redirige vers MenuItemForm
      } else {
        setMessage('Menu créé, mais impossible de récupérer l’ID.');
      }

      setName('');
      setEventId('');
      await fetchMenus();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage(error.response.data.message || 'Erreur : doublon détecté côté serveur.');
      } else {
        setMessage('Erreur lors de la création du menu.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md mt-10">
      {createdMenuId ? (
        <MenuItemForm menuId={createdMenuId} token={token} />
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Créer un Menu</h2>
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">Nom du menu :</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Entrez le nom du menu"
              />
            </div>
            <div>
              <label htmlFor="event" className="block mb-1 font-medium text-gray-700">Événement :</label>
              <select
                id="event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Sélectionnez un événement --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nom || 'Sans nom'}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md text-white font-semibold transition ${
                loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Création en cours...' : 'Créer le menu'}
            </button>
          </form>
          {message && (
            <p className={`mb-6 text-center ${message.toLowerCase().includes('erreur') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default MenuForm;
