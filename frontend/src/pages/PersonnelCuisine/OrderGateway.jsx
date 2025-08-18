import { useEffect, useState } from 'react';
import { useSocket } from '../../socket';  // utilise le hook au lieu du socket global

export default function CaissierPage() {
  const socket = useSocket();  // récupère la socket connectée
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    if (!socket) return;  // attendre la connexion

    const handleOrderStatusUpdated = (data) => {
      console.log('Mise à jour : ', data);
      setCommandes((prev) => {
        const updated = prev.filter(cmd => cmd.id !== data.id);
        return [...updated, data];
      });
    };

    socket.on('order_status_updated', handleOrderStatusUpdated);

    return () => {
      socket.off('order_status_updated', handleOrderStatusUpdated);
    };
  }, [socket]);

  return (
    <div>
      <h1>Caissier</h1>
      {commandes.map(cmd => (
        <p key={cmd.id}>{cmd.plat} - Statut : {cmd.statut}</p>
      ))}
    </div>
  );
}
