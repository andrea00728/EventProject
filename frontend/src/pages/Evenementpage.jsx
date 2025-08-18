import React, { useState } from "react";
import Evenementform from "../components/evenementForm";
import Inviteform from "./choixModInvite/inviteForm";
import Stepper from "../util/Stepper";
import Table from "./Table";

export default function Evenemenpage() {
  const [mode, setMode] = useState(null); // "public" ou "prive"
  const [currentStep, setCurrentStep] = useState(1);
  const [evenementData, setEvenetData] = useState({});

  const handleNext = (data) => {
    setEvenetData(data);
    if (mode === "prive" && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  // Choix du mode
  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <h1 className="text-2xl font-bold">Choisissez le type d'événement</h1>
        <div className="flex gap-4">
          <button
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            onClick={() => setMode("public")}
          >
            Événement Public
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900"
            onClick={() => setMode("prive")}
          >
            Événement Privé
          </button>
        </div>
      </div>
    );
  }

  // Mode PUBLIC → afficher juste le formulaire
  if (mode === "public") {
    return (
      <div className="flex flex-col items-center">
        <Evenementform onNext={(data) => console.log("Public créé :", data)} />
      </div>
    );
  }

  // Mode PRIVE → afficher le stepper avec les étapes
  return (
    <div className="bg-[#ffffff] flex flex-col items-center">
      <div>
        <Stepper currentStep={currentStep} />

        {currentStep === 1 && <Evenementform onNext={handleNext} />}

        {currentStep === 2 && (
          <Table
            eventId={evenementData.eventId}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
  
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
