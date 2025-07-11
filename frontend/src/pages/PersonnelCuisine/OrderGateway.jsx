import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');  // Crée une seule instance ici

export default function MyComponent() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connecté au serveur WebSocket');
    });

    socket.on('updateOrderStatus', (data) => {
      console.log('Mise à jour reçue', data);
    });

    return () => {
      socket.off('connect');
      socket.off('updateOrderStatus');
    };
  }, []);

  return <div>Mon composant connecté</div>;
}
