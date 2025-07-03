import Image from "../assets/vecteezy_impressive-minimalist-white-conference-table-with_57724294.png";
import ButtonConnexion from "../util/buttonconnexion";
import Confidentialite from "../util/Confidentialite";
import NosService from "../util/nosService";
import Footer from "./footer";

export default function Pagepublic() {
  const loginwithgoogle = () => {};

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 lg:px-12 py-12 sm:py-16 bg-white shadow-md">
        <div className="max-w-lg w-full text-center lg:text-left mb-8 lg:mb-0 animate-fadeIn">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#333446] leading-tight">
            <span className="text-[#FB9E3A]">Organ</span>isation <br />
            <span className="text-[#333446]">d’événement</span>
          </h2>
          <p className="text-[#6D6767] mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg leading-relaxed">
            En vous connectant avec votre compte, vous accéderez à une expérience personnalisée, fluide et entièrement adaptée à vos besoins. Découvrez toutes les fonctionnalités avancées que notre site web met à votre disposition. Connectez-vous dès maintenant pour en profiter pleinement.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center lg:justify-start">
            <button
              onClick={loginwithgoogle}
              className="bg-[#333446] text-white px-5 py-2.5 sm:px-6 sm:py-3 w-full sm:w-40 rounded-full hover:bg-[#222] transition-all duration-200 shadow-md text-sm sm:text-base"
            >
              Connexion
            </button>
            <ButtonConnexion />
          </div>
        </div>
        <div className="w-full max-w-xs sm:max-w-md lg:max-w-lg lg:ml-12">
          <img
            src={Image}
            alt="Réunion"
            className="w-full h-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
      <div className="animate-fadeIn">
        <NosService />
      </div>
      <div className="animate-fadeIn">
        <Confidentialite />
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}