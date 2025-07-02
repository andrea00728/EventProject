import React from 'react';
import Footer from './footer';

export default function Accueil() {
  return (
    <>
      {/* Section Hero */}
      <section className="bg-white py-16 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Bonjour <br />
              <span className="text-orange-500">cher organisateur</span>
            </h1>
            <p className="mt-8 text-gray-600 text-lg leading-relaxed">
              Profitez pleinement de toutes les fonctionnalités de notre plateforme et organisez vos événements facilement, de manière professionnelle et sans stress !
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src="/src/assets/vecteezy_beautiful-vintage-group-silhouette-sharing-ideas-meeting_60786770.png"
              className="w-full max-w-md md:max-w-lg object-contain"
              alt="Organisateurs"
            />
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-12 text-gray-800">NOS SERVICES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/organiser.png" className="h-28 mb-4 object-contain" alt="Organiser" />
              <p className="text-gray-600 text-sm">
                Nous vous aidons à planifier chaque étape de votre événement et à structurer votre organisation de manière claire, efficace et numérique.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/location.png" className="h-28 mb-4 object-contain" alt="Location" />
              <p className="text-gray-600 text-sm">
                Trouvez facilement des suggestions de lieux pour accueillir votre événement, selon votre budget, votre type d’événement et votre localisation.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/wedding-invitation.png" className="h-28 mb-4 object-contain" alt="Invitation" />
              <p className="text-gray-600 text-sm">
                Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements passés */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Nos événements passés</h2>
          <p className="text-center text-gray-600 text-base mb-12 max-w-3xl mx-auto font-medium">
            Pour consulter les événements déjà passés, cliquez sur le bouton "Voir +". L'historique des événements précédents est publié et accessible à tout moment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="relative group overflow-hidden rounded-md shadow-lg">
                <img
                  src={
                    index === 0
                      ? "/src/assets/couple-443600_1280.jpg"
                      : index === 1
                      ? "/src/assets/music-7238254_1280.jpg"
                      : "/src/assets/little-girl-6746693_1280.jpg"
                  }
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  alt={`Event ${index + 1}`}
                />
                <button
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  bg-black opacity-50 text-white px-6 py-3 rounded-full 
                  hover:bg-[#FB9E3A] active:bg-black active:bg-opacity-30 transition duration-200"
                >
                  Voir +
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <Footer/>
      </section>
    </>
  );
}
