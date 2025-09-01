import React, { useState } from "react";
import Evenementform from "../components/evenementForm";
import Inviteform from "./choixModInvite/inviteForm";
import Stepper from "../util/Stepper";
import Table from "./Table";
import { useNavigate } from "react-router-dom";

export default function Evenemenpage() {
  const [mode, setMode] = useState(null); // "public" ou "prive"
  const [currentStep, setCurrentStep] = useState(1);
  const [evenementData, setEvenetData] = useState({});
  const navigate = useNavigate()

  const handleNext = (data) => {
    setEvenetData(data);
    if (mode === "prive" && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleExit = () => {
    setMode(null);
  }

  // Choix du mode
  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-8 mt-20 px-4">
        {/* Header avec animation subtile */}
        <div className="text-center space-y-3 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choisissez le type d'événement
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Sélectionnez le format qui correspond le mieux à votre événement
          </p>
        </div>

        {/* Container des boutons avec effet glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
          {/* Bouton Événement Public */}
          <div className="group relative flex-1 transform transition-all duration-300 hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <button
              className="relative w-full px-8 py-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-gray-800 font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={() => setMode("public")}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">Événement Public</h3>
                  <p className="text-sm text-gray-600 mt-1">Ouvert à tous, grande audience</p>
                </div>
              </div>
            </button>
          </div>

          {/* Bouton Événement Privé */}
          <div className="group relative flex-1 transform transition-all duration-300 hover:scale-105">
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <button
              className="relative w-full px-8 py-6 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-gray-800 font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
              onClick={() => setMode("prive")}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">Événement Privé</h3>
                  <p className="text-sm text-gray-600 mt-1">Sur invitation uniquement</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Indicateur visuel subtil */}
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <style jsx>{`
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.8s ease-out;
      }
    `}</style>
      </div>
    );
  }

  // Mode PUBLIC → afficher juste le formulaire (isPublic = true)
  if (mode === "public") {
    return (
      <div className="flex flex-col items-center">
        <Evenementform
          isPublic={true}
          onNext={(data) => {
            console.log("Public créé :", data);
            navigate("/evenement/evenement")
          }}
          isExit={handleExit}
        />
      </div>
    );
  }

  // Mode PRIVE → afficher le stepper avec les étapes (isPublic = false)
  return (
    <div className="bg-[#ffffff] min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Stepper currentStep={currentStep} />

        {currentStep === 1 && (
          <Evenementform isPublic={false} onNext={handleNext} isExit={handleExit} />
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