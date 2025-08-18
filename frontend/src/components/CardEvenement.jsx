// frontend/src/components/CardEvenement.jsx
import { Link } from "react-router-dom";

export default function CardEvenement({ event }) {
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition duration-200">
      <h2 className="text-xl font-semibold mb-2">{event.nom}</h2>
      <p className="text-gray-600">Type : {event.type}</p>
      <p className="text-gray-600">Thème : {event.theme}</p>
      <p className="text-gray-600">Date : {new Date(event.date).toLocaleDateString()}</p>
      <Link
        to={`/evenements/${event.slug}`}
        className="mt-4 inline-block text-blue-500 hover:underline"
      >
        Voir les détails
      </Link>
    </div>
  );
}
