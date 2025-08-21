import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getUserIdForToken } from './services/userService';
import { useStateContext } from './context/ContextProvider';

export const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const {token} = useStateContext()

  useEffect(() => {
    let newSocket;

    async function connectSocket() {
      if(token){
        const userId = await getUserIdForToken();
        if (!userId) return;

        newSocket = io(SOCKET_URL, {
          transports: ['websocket'],
          auth: { userId },
        });
        setSocket(newSocket);
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
