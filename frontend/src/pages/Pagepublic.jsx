import Image from "../assets/vecteezy_impressive-minimalist-white-conference-table-with_57724294.png";
import ButtonConnexion from "../util/buttonconnexion";
import Confidentialite from "../util/Confidentialite";
import NosService from "../util/nosService";
import Footer from "./footer";

export default function Pagepublic() {
  const loginwithgoogle = () => {};

  return (
    <>
      <section className="relative flex flex-col lg:flex-row items-center justify-between px-4 sm:px-10 lg:px-24 py-16 sm:py-24 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Décorations */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#FB9E3A]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-52 h-52 bg-indigo-200/20 rounded-full blur-2xl -z-10" />
        {/* Texte & CTA */}
        <div className="max-w-lg w-full text-center lg:text-left mb-12 lg:mb-0 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#333446] leading-tight drop-shadow-sm">
            <span className="text-[#FB9E3A]">Organ</span>isation <br />
            <span className="text-indigo-800">d’événement</span>
          </h1>
          <p className="text-[#6D6767] mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
            Connectez-vous pour profiter d’une expérience personnalisée, fluide et
            adaptée à vos besoins. Découvrez toutes les fonctionnalités avancées de
            notre plateforme événementielle.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
            <button
              onClick={loginwithgoogle}
              className="bg-gradient-to-r from-[#333446] to-[#22223b] text-white px-7 py-3 w-full sm:w-44 rounded-full hover:from-[#222] hover:to-[#333446] transition-all duration-200 shadow-lg text-base font-semibold tracking-wide"
            >
              Connexion
            </button>
            <ButtonConnexion />
          </div>
        </div>
        {/* Illustration */}
        <div className="w-full max-w-xs sm:max-w-md lg:max-w-xl lg:ml-16 flex justify-center">
          <img
            src={Image}
            alt="Réunion"
            className="w-full h-auto object-contain rounded-2xl shadow-xl border border-indigo-100 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </section>
      <section className="animate-fadeIn mt-16">
        <NosService />
      </section>
      <section className="animate-fadeIn mt-10">
        <Confidentialite />
      </section>
      <Footer />
    </>
  );
}