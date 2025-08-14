import React, { useState } from "react";
import Evenementform from "../components/evenementForm"; // formulaire simple
import Table from "./Table";
import Inviteform from "./choixModInvite/inviteForm";
import Stepper from "../util/Stepper";

export default function CreerEvenementPrive() {
  const [currentStep, setCurrentStep] = useState(1);
  const [evenementData, setEvenementData] = useState({});

  const handleNext = (data) => {
    if (currentStep === 1) {
      setEvenementData(data); // récupère eventId créé par Evenementform
      setCurrentStep(2);
    }
  };

  return (
    <div className="b-[#ffffff] flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Stepper */}
        <Stepper currentStep={currentStep} />

        {/* Étape 1 : formulaire */}
        {currentStep === 1 && <Evenementform onNext={handleNext} />}

        {/* Étape 2 : Table */}
        {currentStep === 2 && (
          <Table
            eventId={evenementData.eventId}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {/* Étape 3 : Inviteform */}
        {currentStep === 3 && (
          <Inviteform
            eventId={evenementData.eventId}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
}
