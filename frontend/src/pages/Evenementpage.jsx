import React, { useState } from 'react'
import Evenementform from '../components/evenementForm';
import Inviteform from '../components/inviteForm';
import Stepper from '../util/Stepper';

export default function Evenemenpage() {
  const[currentStep,setCurrentStep]=useState(1);
    const[evenementData,setEvenetData]=useState({});

    const handleNext=(data)=>{
        if(currentStep===1){
            setEvenetData(data);
            setCurrentStep(2);
        };
    }
   return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-2xl p-4">
        <Stepper currentStep={currentStep} />
        {currentStep === 1 && <Evenementform onNext={handleNext} />}
        {currentStep === 2 && <Inviteform />}
      </div>
    </div>
  );
}
