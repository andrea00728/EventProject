import React from "react";
import OrderCard from "./OrderCard";

const OrderList = ({ commandes, changerStatut }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {commandes.map((commande) => (
        <OrderCard
          key={commande.id}
          commande={commande}
          changerStatut={changerStatut}
          formatDateTime={formatDateTime}
        />
      ))}
    </div>
  );
};

export default OrderList;