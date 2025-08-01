import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getUserIdForToken } from './services/userService';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    async function connectSocket() {
      const userId = await getUserIdForToken();
      if (!userId) return;

      newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
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
