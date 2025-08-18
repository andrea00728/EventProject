export default function NosForfaits() {

  // Définition de Card avant le return
  const Card = ({ title, price, invitations, events, duration, active, expire }) => {
    return (
      <div className={`rounded-xl shadow-lg p-6 border ${
          active ? "bg-yellow-400 border-yellow-500 relative" : "bg-white border-gray-200"
        }`}>
        {active && (
          <div className="absolute top-3 right-3 bg-white text-yellow-600 px-3 py-1 rounded-full text-xs font-bold">
            Actif
          </div>
        )}
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-2xl font-extrabold mb-2">{price}</p>
        <p>Invitations : {invitations}</p>
        <p>Événements : {events}</p>
        <p>Durée : {duration}</p>
        {active && expire && <p className="mt-2 text-sm">Expire le : {expire}</p>}
      </div>
    );
  };

  return (
    <>
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Orbes lumineux flottants */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-400/8 to-yellow-400/8 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto text-center max-w-7xl relative z-10">
          <h2 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-5xl sm:text-6xl font-extrabold mb-6 animate-fadeIn tracking-tight">
            NOS FORFAITS
          </h2>

          <p className="text-gray-700 text-xl sm:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-20">
            Vous avez un forfait actif (<span className="font-semibold text-yellow-600">GOLD</span>) jusqu'au 
            <strong> 30/07/2026</strong>. Vous ne pouvez pas choisir un nouveau forfait avant son expiration.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card title="STARTER" price="10 €/mois" invitations="100" events="5" duration="180 jours" />
            <Card title="PRO" price="25.99 €/mois" invitations="500" events="Illimité" duration="180 jours" />
            <Card title="PREMIUM" price="39.99 €/mois" invitations="1000" events="Illimité" duration="180 jours" />
            <Card title="GOLD" price="59.99 €/mois" invitations="Illimité" events="Illimité" duration="365 jours" active expire="30/07/2026" />
          </div>

          <p className="mt-12 text-center text-gray-500 text-sm">
            🔒 Paiement sécurisé • 💳 Toutes cartes acceptées • 🔄 Résiliation à tout moment
          </p>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </>
  );
}
