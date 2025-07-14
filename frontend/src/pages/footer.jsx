import React from "react";
import { FaPhone, FaFacebook, FaInstagram } from "react-icons/fa"; // Pour les icônes Font Awesome
import { MdEmail } from "react-icons/md"; // Pour les icônes Material Design

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 shadow-md">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Section Nos Services */}
          <div className="mb-6 md:mb-0 animate-fadeIn">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-4">Nos Services</h3>
            <p className="text-base leading-relaxed text-[#D1D5DB]">
              Services de gestion d'événements : simplicité, excellence, succès.
            </p>
          </div>

          {/* Section Événement */}
          <div className="mb-6 md:mb-0 animate-fadeIn">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-4">Événement</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-[#D1D5DB] hover:text-[#3B82F6] transition-all duration-200 text-base"
                >
                  Nos événements passés
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#D1D5DB] hover:text-[#3B82F6] transition-all duration-200 text-base"
                >
                  À propos
                </a>
              </li>
            </ul>
          </div>

          {/* Section Contactez Nous */}
          <div className="animate-fadeIn">
            <h3 className="text-xl font-semibold text-[#E5E7EB] mb-4">Contactez Nous</h3>
            <p className="text-base mb-4 leading-relaxed text-[#D1D5DB]">
              S'il y a un problème, vous pouvez nous joindre sur :
            </p>
            <div className="flex justify-center md:justify-start space-x-6">
              {/* Icône Téléphone */}
              <a
                href="tel:+"
                className="text-[#D1D5DB] hover:text-green-400 transition-all duration-200"
              >
                <FaPhone className="w-6 h-6" />
              </a>
              {/* Icône Gmail */}
              <a
                href="mailto:example@example.com"
                className="text-[#D1D5DB] hover:text-red-400 transition-all duration-200"
              >
                <MdEmail className="w-6 h-6" />
              </a>
              {/* Icône Facebook */}
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D1D5DB] hover:text-blue-400 transition-all duration-200"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              {/* Icône Instagram */}
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D1D5DB] hover:text-pink-400 transition-all duration-200"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Section Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-[#D1D5DB] animate-fadeIn">
          <p className="mb-2">
            © 2025. Tous droits réservés{" "}
            <a
              href="#"
              className="hover:underline text-[#D1D5DB] hover:text-[#3B82F6] transition-all duration-200"
            >
              Confidentialité ?
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;