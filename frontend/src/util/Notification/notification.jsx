import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify'; 

const SOCKET_URL = 'http://localhost:3000';

const NotificationListener = () => {
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connecté au WebSocket');
    });

    socket.on('notification', (data) => {
      console.log('Notification reçue :', data);
      toast(`${data.title} - ${data.message}`, {
        type: data.type || 'info',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
};

export default NotificationListener;
