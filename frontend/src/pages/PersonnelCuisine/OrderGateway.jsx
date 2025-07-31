// src/pages/CaissierPage.jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function MyComponent() {
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    socket.on('order_status_updated', (data) => {
      console.log('Mise à jour : ', data)
      setCommandes((prev) => {
        const updated = prev.filter(cmd => cmd.id !== data.id);
        return [...updated, data];
      });
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, []);

  return (
    <div>
      <h1>Caissier</h1>
      {commandes.map(cmd => (
        <p key={cmd.id}>{cmd.plat} - Statut : {cmd.statut}</p>
      ))}
    </div>
  );
}
