
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getUserIdForToken } from './services/userService';
import { url } from './api/url';



export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    async function connectSocket() {
      const userId = await getUserIdForToken();
      if (!userId) return;

      newSocket = io(`${url}`, {
         transports: ['websocket', 'polling'],
        auth: { userId },
      });
      setSocket(newSocket);
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