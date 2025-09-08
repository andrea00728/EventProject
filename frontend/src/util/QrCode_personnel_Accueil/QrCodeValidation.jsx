import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
// QrScanner.WORKER_PATH = "/qr-scanner-worker.min.js";
import Swal from "sweetalert2";
import { useStateContext } from "../../context/ContextProvider";
import { QrCodeValidation } from "../../services/invitationService";

const QrScannerComponent = () => {
  const {isAuthenticated } = useStateContext();
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const lastCodeRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateQrCode = (text) => {
    try {
      const parsed = JSON.parse(text);
      const { guestId, eventId } = parsed;
      if (!guestId || !eventId) throw new Error("QR code invalide");
      return parsed;
    } catch {
      return null;
    }
  };

  const stopScanner = () => {
    scannerRef.current?.stop();
    scannerRef.current = null;
  };

  const startScanner = () => {
    if (scannerRef.current) return;

    scannerRef.current = new QrScanner(
      videoRef.current,
      async (result) => {
        if (isProcessing || result.data === lastCodeRef.current) return;

        lastCodeRef.current = result.data;
        setIsProcessing(true);

        const parsed = validateQrCode(result.data);
        if (!parsed) {
          Swal.fire("Erreur", "QR code invalide ou corrompu.", "error");
          setIsProcessing(false);
          return;
        }

        const payload = {
          guestId: Number(parsed.guestId),
          eventId: Number(parsed.eventId),
          tableNumber: parsed.tableNumber ? Number(parsed.tableNumber) : null,
          nombre_place: parsed.nombre_place ? Number(parsed.nombre_place) : null,
        };

        try {
          Swal.fire({
            title: "Analyse du QR code...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          const result = await QrCodeValidation(payload);
          Swal.fire("Succès", result.message, "success");
        } catch (err) {
          const raw = err.response?.data?.message || err.message || "Erreur inconnue";

          const messages = {
            "Invitation déjà utilisée": {
              title: "Attention",
              text: " Ce QR code a déjà été utilisé.",
              icon: "warning",
            },
            "Invitation introuvable": {
              title: "Erreur",
              text: "Ce QR code ne correspond à aucun invité pour cet événement.",
              icon: "error",
            },
            "QR code invalide": {
              title: "Erreur",
              text: "QR code mal formé ou incomplet.",
              icon: "error",
            },
            "Vous n'avez pas d'accès pour cet événement": {
              title: "Accès refusé",
              text: "Vous n'êtes pas autorisé à valider les invitations pour cet événement.",
              icon: "error",
            },
          };

          const match = Object.entries(messages).find(([key]) => raw.includes(key));

          if (match) {
            const { title, text, icon } = match[1];
            Swal.fire(title, text, icon);
          } else {
            Swal.fire("Erreur", raw, "error");
          }
        } finally {
          setTimeout(() => {
            setIsProcessing(false);
            lastCodeRef.current = null;
            scannerRef.current?.start();
          }, 4000);
          stopScanner();
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
      }
    );

    QrScanner.hasCamera().then((hasCamera) => {
      if (hasCamera) {
        scannerRef.current.start();
      } else {
        Swal.fire("Erreur", "Aucune caméra disponible", "error");
      }
    });
  };

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, [isAuthenticated]);

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: 16,
        backgroundColor: "#fff",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        fontFamily: "'Segoe UI', sans-serif",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: "1rem", color: "#222" }}>📷 Scanner le QR Code</h2>
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          width: "100%",
          height: 280,
          borderRadius: 12,
          objectFit: "cover",
          border: "2px solid #ccc",
          backgroundColor: "#000",
          marginBottom: "1rem",
        }}
      />
      <p style={{ fontSize: 14, color: "#555" }}>
        Place le QR code devant la caméra
      </p>
      {isProcessing && (
        <p style={{ marginTop: "1rem", color: "#007bff" }}> Analyse en cours...</p>
      )}
    </div>
  );
};

export default QrScannerComponent;