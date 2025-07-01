import React, { useState } from 'react';
import Evenementform from '../components/evenementForm';
import Inviteform from '../components/inviteForm';
import Stepper from '../util/Stepper';
import Table from './Table';

export default function Evenemenpage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [evenementData, setEvenetData] = useState({});

  const handleNext = (data) => {
    if (currentStep === 1) {
      setEvenetData(data); 
      setCurrentStep(2);
    }
  };

  return (
    <div className="b-[#ffffff] flex flex-col items-center">
      <div>
        <Stepper currentStep={currentStep} />
        {currentStep === 1 && <Evenementform onNext={handleNext} />}
        {currentStep === 2 && <Table eventId={evenementData.eventId} />}
        {currentStep === 3 && <Inviteform eventId={evenementData.eventId} />}
      </div>
    </div>
  );
}
