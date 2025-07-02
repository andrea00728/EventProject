import React from 'react';
import { FaPhone, FaFacebook, FaInstagram } from 'react-icons/fa'; // Pour les icônes Font Awesome
import { MdEmail } from 'react-icons/md'; // Pour les icônes Material Design

function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-800 py-10 font-sans shadow-lg"> {/* Fond blanc, texte gris foncé */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Section Nos Services */}
          <div className="mb-6 md:mb-0 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos Services</h3> {/* Titre en noir */}
            <p className="text-sm leading-relaxed">
              Services de gestion d'événements : simplicité, excellence, succès.
            </p>
          </div>

          {/* Section Événement */}
          <div className="mb-6 md:mb-0 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Événement</h3> {/* Titre en noir */}
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300 ease-in-out text-sm"> {/* Liens en gris foncé, hover bleu */}
                  Nos événements passés
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300 ease-in-out text-sm"> {/* Liens en gris foncé, hover bleu */}
                  À propos
                </a>
              </li>
            </ul>
          </div>

          {/* Section Contactez Nous */}
          <div className='text-center'>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 ">Contactez Nous</h3> {/* Titre en noir */}
            <p className="text-sm mb-4 leading-relaxed">
                S'il y a un problème, vous pouvez nous joindre sur :
            </p>
            <div className="flex justify-center space-x-6 ">
                {/* Icône Téléphone */}
                <a href="tel:+" className="text-gray-700 hover:text-green-600 transition duration-300 ease-in-out">
                    <FaPhone className="w-6 h-6" />
                </a>
                {/* Icône Gmail */}
                <a href="mailto:example@example.com" className="text-gray-700 hover:text-red-600 transition duration-300 ease-in-out">
                    <MdEmail className="w-6 h-6" /> 
                  </a>
                {/* Icône Facebook */}
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition duration-300 ease-in-out">
                    <FaFacebook className="w-6 h-6" />
                </a>
                {/* Icône Instagram */}
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out">
                    <FaInstagram className="w-6 h-6" />
                </a>
            </div>
         </div>
        </div> 

        {/* Section Copyright */}
        <div className="border-t border-gray-300 mt-8 pt-8 text-center text-sm text-gray-700"> {/* Bordure et texte en gris */}
          <p className="mb-2">&copy; 2025. Tous droits réservés <a href="#" className="hover:underline text-gray-700 hover:text-blue-600">Confidentialité ?</a> {/* Lien en gris foncé, hover bleu */}</p>
          
        </div>
      </div>
    </footer>
  );
}

export default Footer;
