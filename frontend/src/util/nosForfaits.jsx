import { Rocket, Star, Gem, Crown } from "lucide-react";
import { AuthModal } from "../components/Modal/authModal";
import { useState } from "react";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

export default function NosForfaits() {

  const [isModalOpen , setModalOpen] = useState(false)
  // Card
  const Card = ({ title, price, invitations, events, duration, icon, featured }) => {
    return (
      <div
        className={`relative rounded-2xl shadow-lg p-8 border transition-transform hover:-translate-y-2 hover:shadow-2xl
        ${featured ? "bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 text-white" : "bg-white border-gray-200"}`}
      >
        {featured && (
          <div className="absolute top-3 right-3 bg-white text-yellow-600 px-3 py-1 rounded-full text-xs font-bold shadow">
            Populaire
          </div>
        )}

        <div className="flex justify-center mb-4">
          {icon}
        </div>

        <h3 className="text-2xl font-extrabold mb-4">{title}</h3>
        <p className={`text-3xl font-bold mb-6 ${featured ? "text-white" : "text-gray-800"}`}>
          {price}
        </p>

        <ul className="text-sm space-y-2 mb-6">
          <li>Invitations : <span className="font-semibold">{invitations}</span></li>
          <li>Événements : <span className="font-semibold">{events}</span></li>
          <li>Durée : <span className="font-semibold">{duration}</span></li>
        </ul>

        <button
          type="button"
          onClick={() => setModalOpen(true)} 
          className={`w-full py-3 px-5 rounded-xl cursor-pointer font-semibold transition-all duration-300 shadow focus:outline-none focus:ring
          ${featured
            ? "bg-white text-yellow-600 hover:bg-gray-100 focus:ring-yellow-200"
            : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 focus:ring-blue-200"}`}
        >
          Acheter ce forfait
        </button>
      </div>
    );
  };

  return (
    <>
      <AuthModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Orbes lumineux */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl animate-pulse" />

        <div className="container mx-auto text-center max-w-7xl relative z-10">
          <h2 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-5xl sm:text-6xl font-extrabold mb-6 animate-fadeIn tracking-tight">
            Choisissez votre forfait
          </h2>

          <p className="text-gray-700 text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-20">
            Nos offres s’adaptent à votre croissance. Que vous débutiez ou gériez des événements à grande échelle,
            sélectionnez la formule idéale et débloquez toutes nos fonctionnalités.
          </p>
          
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Card
              title="STARTER"
              price="10 €/mois"
              invitations="100"
              events="5"
              duration="180 jours"
              icon={<Rocket className="w-10 h-10 text-blue-500" strokeWidth={2.5} />}
            />
            <Card
              title="PRO"
              price="25.99 €/mois"
              invitations="500"
              events="Illimité"
              duration="180 jours"
              icon={<Star className="w-10 h-10 text-purple-500" strokeWidth={2.5} />}
            />
            <Card
              title="PREMIUM"
              price="39.99 €/mois"
              invitations="1000"
              events="Illimité"
              duration="180 jours"
              icon={<Gem className="w-10 h-10 text-pink-500" strokeWidth={2.5} />}
            />
            <Card
              title="GOLD"
              price="59.99 €/mois"
              invitations="Illimité"
              events="Illimité"
              duration="365 jours"
              icon={<Crown className="w-10 h-10 text-yellow-600" strokeWidth={2.5} />}
              featured
            />
          </div>

          <div className="lg:hidden">
            <Slider
              dots={true}
              infinite={false}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              arrows={false}
              autoplay={true}
              autoplaySpeed={3000}
              className="slick-carousel-mobile"
            >
              {/* Les Cards seront les "slides" du carrousel */}
              <Card
                title="STARTER"
                price="10 €/mois"
                invitations="100"
                events="5"
                duration="180 jours"
                icon={<Rocket className="w-10 h-10 text-blue-500" strokeWidth={2.5} />}
              />
              <Card
                title="PRO"
                price="25.99 €/mois"
                invitations="500"
                events="Illimité"
                duration="180 jours"
                icon={<Star className="w-10 h-10 text-purple-500" strokeWidth={2.5} />}
              />
              <Card
                title="PREMIUM"
                price="39.99 €/mois"
                invitations="1000"
                events="Illimité"
                duration="180 jours"
                icon={<Gem className="w-10 h-10 text-pink-500" strokeWidth={2.5} />}
              />
              <Card
                title="GOLD"
                price="59.99 €/mois"
                invitations="Illimité"
                events="Illimité"
                duration="365 jours"
                icon={<Crown className="w-10 h-10 text-yellow-600" strokeWidth={2.5} />}
                featured
              />
            </Slider>
          </div>

          <p className="mt-16 text-center text-gray-500 text-sm">
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
