// import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import { getUserIdForToken } from './services/userService';

// export const SOCKET_URL = 'http://localhost:3000';

// export function useSocket() {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     let newSocket;

//     async function connectSocket() {
//       const userId = await getUserIdForToken();
//       if (!userId) return;

//       newSocket = io(SOCKET_URL, {
//         path: '/socket.io/', 
//         // transports: ['websocket'],
//         transports: ['websocket', 'polling'],
//         auth: { userId },
//         // secure:true,
//       });
//       setSocket(newSocket);
//     }

//     connectSocket();

//     return () => {
//       if (newSocket) {
//         newSocket.disconnect();
//       }
//     };
//   }, []);

//   return socket;
// }




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