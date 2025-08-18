import React from "react";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white py-10 overflow-hidden">
      {/* Décorations de fond - même style que tes sections */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-l from-indigo-400/15 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-300/5 to-fuchsia-300/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-screen relative z-10 px-6">
        {/* En-tête du footer */}
        <div className="text-center mb-20 space-y-6">
          <div className="container mx-auto max-w-7xl relative z-10">
            {/* En-tête du footer */}
            <div className="text-center mb-16 space-y-6">
              {/* Badge - même style que tes autres sections */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-white/90 shadow-sm">
                <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
                Restons connectés
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                Prêt à organiser votre
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-400 to-amber-400 drop-shadow-sm">
                  prochain événement ?
                </span>
              </h2>
            </div>

            {/* Newsletter */}
            {/* Newsletter - Nouveau ajout */}
            <div className="bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 backdrop-blur-sm rounded-3xl p-8 border border-orange-400/20 mb-16">
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-black text-white">
                  Restez informé de nos dernières actualités
                </h3>
                <p className="text-slate-300 xl:text-lg">
                  Recevez nos conseils d'organisation et les dernières tendances événementielles
                </p>

                {/* Contact Icons */}
                <div className="flex justify-center gap-6 pt-4">
                  <a
                    href="tel:+33123456789"
                    className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-green-500/20 hover:border-green-400/30 border border-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FaPhone className="w-5 h-5 text-white group-hover:text-green-400 transition-colors" />
                  </a>

                  <a
                    href="mailto:contact@rapexgroup.com"
                    className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-blue-500/20 hover:border-blue-400/30 border border-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <MdEmail className="w-5 h-5 text-white group-hover:text-blue-400 transition-colors" />
                  </a>

                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 border border-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FaFacebook className="w-5 h-5 text-white group-hover:text-blue-500 transition-colors" />
                  </a>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-400/30 border border-white/20 transition-all duration-300 hover:scale-110"
                  >
                    <FaInstagram className="w-5 h-5 text-white group-hover:text-pink-400 transition-colors" />
                  </a>
                </div>
              </div>
            </div>

            {/* Section Copyright - Améliorée */}
          </div>
        </div>

        {/* Section Copyright - Amélirorée */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Logo/Nom */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FB9E3A] to-orange-400 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-black text-white">Rapex group</span>
              </div>
              <p className="text-slate-400 text-sm">
                © 2025. Tous droits réservés
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Conditions d'utilisation
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
