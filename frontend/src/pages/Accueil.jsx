import React from "react";
import Footer from "./footer";
import { FaAward, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
import EventsSection from "../util/eventSection";
import TestimonialsSection from "../util/testimonialsSection";

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
      <section>
        <EventsSection />
      </section>

      {/* Section À Propos */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800 py-24">
        {/* Décorations de fond light */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-300/5 to-fuchsia-300/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl relative z-10 px-6">
          <div className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 text-sm font-medium text-slate-600 shadow-sm mb-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                À propos
              </div>

              <h3 className="text-3xl lg:text-4xl font-black text-slate-800 mb-4">
                Qui sommes-nous ?
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Notre Mission */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Notre Mission</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Simplifier l'organisation d'événements et créer des expériences mémorables pour tous nos utilisateurs.
                </p>
              </div>

              {/* Notre Équipe */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaUsers className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Notre Équipe</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Une équipe passionnée de développeurs et designers dédiés à l'innovation événementielle.
                </p>
              </div>

              {/* Nos Valeurs */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaAward className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Nos Valeurs</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Excellence, innovation et satisfaction client sont au cœur de tout ce que nous faisons.
                </p>
              </div>

              {/* Notre Localisation */}
              <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 hover:border-pink-300 transition-all duration-300 hover:shadow-lg hover:shadow-pink-100 hover:bg-white/90">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <FaMapMarkerAlt className="w-6 h-6 text-white" />
                </div>

                <h4 className="text-xl font-bold text-slate-800 mb-3">Basés à Paris</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Situés au cœur de Paris, nous servons des clients dans le monde entier depuis 2020.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] to-orange-500 mb-2 group-hover:scale-110 transition-transform">
                  500+
                </div>
                <p className="text-slate-500 text-sm font-semibold">Événements organisés</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-2 group-hover:scale-110 transition-transform">
                  50K+
                </div>
                <p className="text-slate-500 text-sm font-semibold">Participants heureux</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 mb-2 group-hover:scale-110 transition-transform">
                  98%
                </div>
                <p className="text-slate-500 text-sm font-semibold">Satisfaction client</p>
              </div>

              <div className="text-center group">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2 group-hover:scale-110 transition-transform">
                  24/7
                </div>
                <p className="text-slate-500 text-sm font-semibold">Support disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimony">
        <TestimonialsSection />
      </section>

      <section>
        <Footer />
      </section>
    </>
  );
}
