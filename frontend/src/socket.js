import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getUserIdForToken } from './services/userService';
import { url } from './api/url';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    async function connectSocket() {
      try {
        const userId = await getUserIdForToken();

        if (!userId) {
          console.log("Pas d’utilisateur connecté, pas de socket.");
          return;
        }

        newSocket = io(url, {
          transports: ['websocket'],
          auth: { userId },
        });
        setSocket(newSocket);
      } catch (err) {
        if (err.response?.status === 401) {
          console.log("Socket bloqué : utilisateur non connecté.");
        } else {
          console.error("Erreur socket:", err);
        }
      }
    }

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return socket;
}
