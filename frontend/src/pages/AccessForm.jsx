import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AccessForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/guests/verify-email', { email });
      const data = res.data;
      localStorage.setItem('guestName', `${data.nom} ${data.prenom}`);
      localStorage.setItem('eventName', data.eventName);
      localStorage.setItem('tableNumber', data.table);
      localStorage.setItem('guestEmail', data.email);

      navigate('/frontend/src/pages/menu.jsx');
    } catch (err) {
      setError('Email non reconnu. Veuillez contacter l’organisateur.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Accès Invité</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Entrez votre email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Valider
        </button>
      </form>
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default AccessForm;
