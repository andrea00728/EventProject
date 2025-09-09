import React from 'react';
import { motion } from "framer-motion";
const Stepper = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "Événement" },
    { number: 2, label: "Table" },
    { number: 3, label: "Invite" },
  ];

  return (
    <div className="relative flex items-center justify-center mb-8 gap-12">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* Cercle et texte de l'étape */}
          <div
            className="flex items-center flex-col"
            aria-current={currentStep === step.number ? "step" : undefined}
            aria-label={`Étape ${step.number} : ${step.label} ${currentStep >= step.number ? "complétée" : "en attente"}`}
          >
            <motion.div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shadow-md
                transition-all duration-300 ease-in-out
                ${currentStep >= step.number ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white' : 'bg-gray-200 text-gray-500'}
              `}
              whileHover={{ scale: currentStep >= step.number ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {step.number}
            </motion.div>
            <p className={`
              mt-2 text-center text-base font-medium
              ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'}
              transition-colors duration-300
            `}>
              {step.label}
            </p>
          </div>

          {/* Ligne de progression (sauf pour la dernière étape) */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 bg-gray-200">
              <motion.div
                className="h-1 bg-gradient-to-r from-indigo-600 to-indigo-700"
                initial={{ width: 0 }}
                animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;