import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getUserIdForToken } from './services/userService';

export const SOCKET_URL = 'https://api.mastertable.site';

export function useSocket() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    async function connectSocket() {
      const userId = await getUserIdForToken();
      if (!userId) return;

      newSocket = io(SOCKET_URL, {
        path:' /socket.io/',
        transports: ['websocket'],
        auth: { userId },
        secure:true,
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
