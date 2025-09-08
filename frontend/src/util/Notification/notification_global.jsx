import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../../socket';

const NotificationListener = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => console.log('Socket connectée', socket.id));
    socket.on('notification', (data) => {
      console.log('Notification reçue:', data);
      toast.info(`${data.title} - ${data.message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('notification');
    };
  }, [socket]);

  return null;
};

export default NotificationListener;
