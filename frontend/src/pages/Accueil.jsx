import React from "react";
import Footer from "./footer";

export default function Accueil() {
  return (
    <>
      {/* Section Hero */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 py-32 px-4 overflow-hidden">
        {/* Décorations améliorées */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/15 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-gradient-to-l from-indigo-300/20 to-purple-300/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-200/10 to-fuchsia-200/10 rounded-full blur-3xl" />

        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-20 max-w-7xl relative z-10">
          {/* Contenu textuel */}
          <div className="flex-1 max-w-2xl text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
              <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
              Plateforme d'organisation événementielle
            </div>

            {/* Titre principal */}
            <h1 className="text-5xl lg:text-7xl font-black text-slate-800 leading-[1.1] tracking-tight">
              Organisez vos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500 drop-shadow-sm">
                événements
              </span>
              <span className="text-4xl lg:text-5xl font-bold text-indigo-600">
                comme un pro
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-xl lg:text-2xl leading-relaxed font-normal max-w-xl">
              Une plateforme complète et intuitive pour créer, gérer et promouvoir vos événements
              <span className="font-semibold text-slate-700"> sans effort</span>.
            </p>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative bg-gradient-to-r from-[#6B46C1] via-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 active:scale-95">
                <span className="relative z-10">Commencer gratuitement</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Voir la démo
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-9V8a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex justify-center lg:justify-end relative">
            <div className="relative">
              {/* Cercle décoratif derrière l'image */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FB9E3A]/20 to-indigo-400/20 rounded-full scale-110 blur-xl"></div>

              <div className="relative bg-white/30 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/40">
                <img
                  src="/src/assets/undraw_having-fun_kkeu.svg"
                  alt="Illustration organisateurs d'événements"
                  className="w-full max-w-lg h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Éléments flottants */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-3 animate-bounce delay-500">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                <div className="w-6 h-6 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements Récents */}
      <section className="relative bg-white py-24 px-4 overflow-hidden">
        {/* Décorations de fond - même style que le hero */}
        <div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-2xl" />

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* En-tête de section */}
          <div className="text-center lg:text-left mb-16 space-y-6">
            {/* Badge - même style que le hero */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-full px-4 py-2 text-sm font-medium text-[#FB9E3A] shadow-sm">
              <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
              Événements récents
            </div>

            <h2 className="text-4xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
              Découvrez nos derniers
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500 drop-shadow-sm">
                succès
              </span>
            </h2>

            <p className="text-slate-600 text-xl lg:text-2xl leading-relaxed font-normal max-w-2xl">
              Des événements exceptionnels organisés par notre communauté
              <span className="font-semibold text-slate-700"> d'organisateurs</span>.
            </p>
          </div>

          {/* Grille d'événements */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

            {/* Carte Événement 1 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                {/* Image de fond */}
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Tech Conference 2024"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay gradient pour la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>

                {/* Badge statut */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-2 rounded-full border border-white/30 shadow-lg">
                  TERMINÉ
                </div>

                {/* Date */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-white/30 shadow-lg">
                  15 Nov 2024
                </div>

                {/* Icône événement */}
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
                  </svg>
                </div>

                {/* Éléments flottants - adaptés pour la visibilité sur image */}
                <div className="absolute top-6 right-16 w-3 h-3 bg-white/60 rounded-full animate-pulse shadow-sm"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-white/70 rounded-full animate-bounce delay-300 shadow-sm"></div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                  Tech Conference 2024
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Conférence technologique avec plus de 500 participants et 20 speakers internationaux.
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="font-semibold">524 participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span className="font-semibold">Paris</span>
                  </div>
                </div>

                {/* Rating et bouton */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-semibold">4.9</span>
                  </div>
                  <button className="text-indigo-600 text-sm font-bold hover:text-indigo-800 transition-colors group-hover:translate-x-1 transform duration-200">
                    Voir détails →
                  </button>
                </div>
              </div>
            </div>


            {/* Carte Événement 2 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                {/* Image de fond */}
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Tech Conference 2024"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full border border-white/20">
                  SUCCÈS
                </div>

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/20">
                  08 Nov 2024
                </div>

                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>

                <div className="absolute top-8 right-20 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-500"></div>
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-xl text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
                  Festival Solidaire
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Événement caritatif avec concerts, ateliers et collecte de fonds pour les associations locales.
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="font-semibold">1,2k participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span className="font-semibold">Lyon</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-semibold">4.8</span>
                  </div>
                  <button className="text-emerald-600 text-sm font-bold hover:text-emerald-800 transition-colors group-hover:translate-x-1 transform duration-200">
                    Voir détails →
                  </button>
                </div>
              </div>
            </div>

            {/* Carte Événement 3 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                {/* Image de fond */}
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Tech Conference 2024"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full border border-white/20">
                  CORPORATE
                </div>

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/20">
                  02 Nov 2024
                </div>

                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
                  </svg>
                </div>

                <div className="absolute top-6 right-16 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-700"></div>
                <div className="absolute bottom-10 right-10 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-1000"></div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-xl text-slate-800 group-hover:text-[#FB9E3A] transition-colors leading-tight">
                  Summit Business 2024
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Sommet d'affaires réunissant les leaders de l'industrie pour discuter des tendances futures.
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="font-semibold">300 participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span className="font-semibold">Marseille</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(4)}☆
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-semibold">4.7</span>
                  </div>
                  <button className="text-[#FB9E3A] text-sm font-bold hover:text-orange-600 transition-colors group-hover:translate-x-1 transform duration-200">
                    Voir détails →
                  </button>
                </div>
              </div>
            </div>

            {/* Carte Événement 4 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                {/* Image de fond */}
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Tech Conference 2024"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-full border border-white/20">
                  CULTUREL
                </div>

                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-xl border border-white/20">
                  25 Oct 2024
                </div>

                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>

                <div className="absolute top-10 right-14 w-3 h-3 bg-white/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 right-6 w-2 h-2 bg-white/40 rounded-full animate-bounce delay-500"></div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-xl text-slate-800 group-hover:text-rose-600 transition-colors leading-tight">
                  Nuit des Arts Créatifs
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Exposition d'art contemporain avec vernissage, performances artistiques et networking créatif.
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span className="font-semibold">180 participants</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span className="font-semibold">Bordeaux</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-semibold">5.0</span>
                  </div>
                  <button className="text-rose-600 text-sm font-bold hover:text-rose-800 transition-colors group-hover:translate-x-1 transform duration-200">
                    Voir détails →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}
