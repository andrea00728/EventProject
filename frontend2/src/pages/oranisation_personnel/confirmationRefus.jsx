import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios-client";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function  Optionpersonnel() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const action = searchParams.get("action"); // 'confirm' or 'reject'

  useEffect(() => {
    if (!token || !action) {
      setStatus("error");
      setMessage(" Lien invalide ou incomplet.");
      return;
    }

    const processResponse = async () => {
      try {
        const endpoint =`/personnel/response?token=${token}&action=${action}`;

        const response = await axiosClient.get(endpoint);
        setStatus("success");
        setMessage(
          response.data.message ||
            (action === "confirm"
              ? " Votre rôle a été confirmé avec succès."
              : " Vous avez refusé l’invitation et vos données ont été supprimées.")
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            " Le lien est expiré, invalide ou déjà traité."
        );
      }
    };

    processResponse();
  }, [token, action]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-md text-center border border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">
          {action === "confirm" ? "Confirmation de votre rôle" : "Refus d’invitation"}
        </h1>

        {status === "loading" ? (
          <p className="text-gray-500 animate-pulse">⏳ Traitement en cours...</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 mb-4">
              {status === "success" ? (
                action === "confirm" ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-500" />
                )
              ) : (
                <ExclamationCircleIcon className="w-8 h-8 text-yellow-500" />
              )}

              <p
                className={`text-base ${
                  status === "success"
                    ? action === "confirm"
                      ? "text-green-700"
                      : "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {message}
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 mt-4 text-indigo-600 font-medium underline hover:text-indigo-800 transition"
            >
              <ArrowRightIcon className="w-4 h-4" />
              Retour à la plateforme
            </button>
          </>
        )}
      </div>
    </div>
  );
}
