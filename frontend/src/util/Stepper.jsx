import React from 'react';

const Stepper = ({ currentStep }) => {
  return (
    <div className="flex justify-center mb-6 gap-10">
      {/* Étape 1 : Événement */}
      <div className={`
        flex items-center px-4 py-2
        transition-colors duration-300
        ${currentStep >= 1 ? 'text-gray-700' : 'text-gray-500'} {/* Le texte "Événement" est maintenant gris, avec une légère différence d'opacité */}
      `}>
        <span className={`
          w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-lg mr-2
          transition-all duration-300
          ${currentStep >= 1 ? 'bg-[#333446] text-white' : 'bg-gray-300 text-gray-600'} {/* Seul le cercle change de couleur de fond et de texte */}
        `}>
          1
        </span>
        <p className="text-sm md:text-base">Événement</p>
      </div>

      {/* Étape 2 : Invite */}
      <div className={`
        flex items-center px-4 py-2
        transition-colors duration-300
        ${currentStep >= 2 ? 'text-gray-700' : 'text-gray-500'}
      `}>
        <span className={`
          w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-lg mr-2
          transition-all duration-300
          ${currentStep >= 2 ? 'bg-[#333446] text-white' : 'bg-gray-300 text-gray-600'}
        `}>
          2
        </span>
        <p className="text-sm md:text-base">Table</p>
      </div>
      <div className={`
        flex items-center px-4 py-2
        transition-colors duration-300
        ${currentStep >= 3 ? 'text-gray-700' : 'text-gray-500'}
      `}>
        <span className={`
          w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-lg mr-2
          transition-all duration-300
          ${currentStep >= 3 ? 'bg-[#333446] text-white' : 'bg-gray-300 text-gray-600'}
        `}>
          3
        </span>
        <p className="text-sm md:text-base">Invite</p>
      </div>
    </div>
  );
};

export default Stepper;