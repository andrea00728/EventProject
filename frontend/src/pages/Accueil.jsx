import React from "react";
import Footer from "./footer";

export default function Accueil() {
  return (
    <>
      {/* Section Hero */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl">
          <div className="max-w-2xl text-center md:text-left animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Bonjour <br />
              <span className="text-[#FB9E3A]">cher organisateur</span>
            </h1>
            <p className="mt-6 text-gray-600 text-lg leading-relaxed">
              Profitez pleinement de toutes les fonctionnalités de notre plateforme et organisez vos événements facilement, de manière professionnelle et sans stress !
            </p>
            <button className="mt-8 bg-[#6B46C1] text-white px-6 py-3 rounded-lg hover:bg-[#553C9A] transition-all duration-200 shadow-md">
              Découvrir maintenant
            </button>
          </div>
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <img
              src="/src/assets/vecteezy_beautiful-vintage-group-silhouette-sharing-ideas-meeting_60786770.png"
              className="w-full max-w-md md:max-w-xl object-contain transition-transform duration-300 hover:scale-105"
              alt="Organisateurs"
            />
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="container mx-auto text-center max-w-7xl">
          <h2 className="text-2xl font-semibold mb-12 text-gray-800 animate-fadeIn">NOS SERVICES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img src="/src/assets/organiser.png" className="h-32 mb-6 object-contain" alt="Organiser" />
              <p className="text-gray-600 text-base leading-relaxed">
                Nous vous aidons à planifier chaque étape de votre événement et à structurer votre organisation de manière claire, efficace et numérique.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img src="/src/assets/location.png" className="h-32 mb-6 object-contain" alt="Location" />
              <p className="text-gray-600 text-base leading-relaxed">
                Trouvez facilement des suggestions de lieux pour accueillir votre événement, selon votre budget, votre type d’événement et votre localisation.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img src="/src/assets/wedding-invitation.png" className="h-32 mb-6 object-contain" alt="Invitation" />
              <p className="text-gray-600 text-base leading-relaxed">
                Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements passés */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 animate-fadeIn">Nos événements passés</h2>
          <p className="text-center text-gray-600 text-base mb-12 max-w-3xl mx-auto font-medium animate-fadeIn">
            Pour consulter les événements déjà passés, cliquez sur le bouton "Voir +". L'historique des événements précédents est publié et accessible à tout moment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg">
                <img
                  src={
                    index === 0
                      ? "/src/assets/couple-443600_1280.jpg"
                      : index === 1
                      ? "/src/assets/music-7238254_1280.jpg"
                      : "/src/assets/little-girl-6746693_1280.jpg"
                  }
                  className="w-full h-72 object-cover transition-transform duration-300 group-hover:scale-105"
                  alt={`Event ${index + 1}`}
                />
                <button
                  className="absolute opacity-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FB9E3A] to-[#FDBA74] text-white px-6 py-3 rounded-full hover:from-[#FDBA74] hover:to-[#FB9E3A] transition-all duration-200 shadow-md"
                >
                  Voir +
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <Footer />
      </section>
    </>
  );
}