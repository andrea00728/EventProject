import React from 'react';

const Stepper = ({ currentStep }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className={`px-4 py-2 ${currentStep >= 1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
        1. Événement
      </div>
      <div className={`px-4 py-2 ${currentStep >= 2 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
        2. Invite
      </div>
      <div className={`px-4 py-2 ${currentStep >= 3 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
        3. Table
      </div>
    </div>
  );
};

export default Stepper;