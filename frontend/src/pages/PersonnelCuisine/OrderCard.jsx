import React from "react";
import {
  MdPerson,
  MdTableRestaurant,
  MdPendingActions,
  MdKitchen,
  MdDoneAll,
  MdError,
} from "react-icons/md";

const OrderCard = ({ commande, changerStatut, formatDateTime }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-600",
    preparing: "bg-orange-100 text-orange-600",
    served: "bg-green-100 text-green-600",
    canceled: "bg-red-100 text-red-600",
  };

  const statusIcons = {
    pending: <MdPendingActions className="text-xl" />,
    preparing: <MdKitchen className="text-xl" />,
    served: <MdDoneAll className="text-xl" />,
    canceled: <MdError className="text-xl" />,
  };

  const statusLabels = {
    pending: "En attente",
    preparing: "En préparation",
    served: "Servie",
    canceled: "Annulée",
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-500">ID Commande</h3>
          <p className="text-lg font-bold text-gray-800">{commande.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-1">
            <MdPerson className="text-lg" /> Client
          </h3>
          <p className="text-lg text-gray-800">{commande.nom}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500 flex items-center gap-1">
            <MdTableRestaurant className="text-lg" /> Table
          </h3>
          <p className="text-lg text-gray-800">{commande.table.nom}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-500">Date & Heure</h3>
          <p className="text-lg text-gray-800">{formatDateTime(commande.orderDate)}</p>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-500">Plats & Quantités</h3>
        <p className="text-gray-700">
          {commande.items.map((p) => `${p.menuItem.name} (x${p.quantity})`).join(", ")}
        </p>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-500">Statut</h3>
        <span
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold capitalize ${statusStyles[commande.status]}`}
        >
          {statusIcons[commande.status]} {statusLabels[commande.status]}
        </span>
      </div>
      {commande.status !== "canceled" && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          {commande.status === "preparing" && (
            <button
              onClick={() => changerStatut(commande.id, "prev")}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <MdPendingActions className="text-xl" />
              Retour
            </button>
          )}
          {commande.status !== "served" && (
            <button
              onClick={() => changerStatut(commande.id, "next")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md font-semibold transition transform hover:scale-105 flex items-center gap-2"
            >
              <MdDoneAll className="text-xl" />
              Suivant
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard;