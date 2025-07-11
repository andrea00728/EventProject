import React from "react";
import Footer from "./footer";

export default function Accueil() {
  return (
    <>
      {/* Section Hero */}
      <section className="relative bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-white py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Décorations */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#FB9E3A]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-52 h-52 bg-indigo-200/20 rounded-full blur-2xl -z-10" />
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-16 max-w-7xl relative z-10">
          <div className="max-w-2xl text-center md:text-left animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-extrabold text-[#333446] leading-tight drop-shadow-sm">
              Bonjour <br />
              <span className="text-[#FB9E3A]">cher organisateur</span>
            </h1>
            <p className="mt-8 text-[#6D6767] text-xl leading-relaxed font-medium">
              Profitez pleinement de toutes les fonctionnalités de notre plateforme et organisez vos événements facilement, de manière professionnelle et sans stress !
            </p>
            <button className="mt-10 bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6] text-white px-8 py-4 rounded-full hover:from-[#553C9A] hover:to-[#6B46C1] transition-all duration-200 shadow-lg text-lg font-semibold tracking-wide">
              Découvrir maintenant
            </button>
          </div>
          <div className="flex justify-center md:justify-end w-full md:w-auto">
            <img
              src="/src/assets/undraw_having-fun_kkeu.svg"
             
              alt="Organisateurs"
            />
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="container mx-auto text-center max-w-7xl">
          <h2 className="text-3xl font-bold mb-14 text-indigo-800 animate-fadeIn tracking-tight">NOS SERVICES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center max-w-sm mx-auto p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-indigo-50">
              <img src="/src/assets/organiser.png" className="h-32 mb-8 object-contain" alt="Organiser" />
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Nous vous aidons à planifier chaque étape de votre événement et à structurer votre organisation de manière claire, efficace et numérique.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-indigo-50">
              <img src="/src/assets/location.png" className="h-32 mb-8 object-contain" alt="Location" />
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Trouvez facilement des suggestions de lieux pour accueillir votre événement, selon votre budget, votre type d’événement et votre localisation.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-indigo-50">
              <img src="/src/assets/wedding-invitation.png" className="h-32 mb-8 object-contain" alt="Invitation" />
              <p className="text-gray-600 text-lg leading-relaxed font-medium">
                Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements passés */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-indigo-800 animate-fadeIn tracking-tight">Nos événements passés</h2>
          <p className="text-center text-gray-600 text-lg mb-14 max-w-3xl mx-auto font-medium animate-fadeIn">
            Pour consulter les événements déjà passés, cliquez sur le bouton "Voir +". L'historique des événements précédents est publié et accessible à tout moment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="relative group overflow-hidden rounded-2xl shadow-xl border border-indigo-50 hover:shadow-2xl transition">
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
                  className="absolute opacity-90 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FB9E3A] to-[#FDBA74] text-white px-8 py-3 rounded-full hover:from-[#FDBA74] hover:to-[#FB9E3A] transition-all duration-200 shadow-lg text-lg font-semibold"
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