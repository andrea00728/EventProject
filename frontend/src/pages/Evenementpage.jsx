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
      <div className="flex flex-col items-center justify-center min-h-full gap-6 mt-50">
        <h1 className="text-2xl font-bold">Choisissez le type d'�v�nement</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            onClick={() => setMode("public")}
          >
            �v�nement Public
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-900"
            onClick={() => setMode("prive")}
          >
            �v�nement Priv�
          </button>
        </div>
      </div>
    );
  }

  // Mode PUBLIC \u2192 afficher juste le formulaire (isPublic = true)
  if (mode === "public") {
    return (
      <div className="flex flex-col items-center">
        <Evenementform
          isPublic={true}
          onNext={(data) => console.log("Public cr�� :", data)}
        />
      </div>
    );
  }

  // Mode PRIVE \u2192 afficher le stepper avec les �tapes (isPublic = false)
  return (
    <div className="bg-[#ffffff] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Stepper currentStep={currentStep} />

        {currentStep === 1 && (
          <Evenementform isPublic={false} onNext={handleNext} />
        )}

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