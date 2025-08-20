import { useRef, useState } from "react";
import tutorialVideo from "../assets/demo.mp4"; // import de la vidéo
import DemoTable from "./demo";
import { FaPlay, FaEyeSlash, FaDownload, FaEye } from 'react-icons/fa';

const Demo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);



  const videoRef = useRef(null);

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch((err) => console.log(err));
      } else {
        document.exitFullscreen();
      }
    }
  };
  return (
    <>
      <section className="relative w-full min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 px-6 md:px-12 py-16 bg-gray-50">
        {/* Vidéo à gauche */}
        {showVideo && (
            <div className="relative w-full md:w-1/2 rounded-2xl overflow-hidden shadow-2xl">
                <video
                    ref={videoRef}
                    src={tutorialVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-64 md:h-full object-cover rounded-2xl"
                />
                <button
                    onClick={toggleFullScreen}
                    className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-white transition"
                >
                    {document.fullscreenElement ? "Quitter plein écran" : "Plein écran"}
                </button>
            </div>
        )}

        {/* Description + Boutons à droite */}
        <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 text-center">
                Découvrez notre plateforme en action
            </h2>
            <p className="text-gray-700 text-sm md:text-base text-center">
                Plongez au cœur de notre plateforme grâce à cette démonstration interactive. Découvrez ses fonctionnalités clés en naviguant à votre rythme. Que vous préfériez une vue compacte ou une immersion en plein écran, la vidéo s'adapte à vos besoins pour une expérience optimale.
            </p>

            <div className="flex flex-wrap gap-4 mt-4 align-center justify-center">
                {/* Bouton pour ouvrir le modal */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                    <FaPlay />
                    <span className="hidden md:inline">Voir la démo</span>
                </button>

                {/* Bouton pour afficher/masquer la vidéo */}
                <button
                    onClick={() => setShowVideo(!showVideo)}
                    className="flex items-center gap-2 bg-gray-200 text-gray-900 px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                    {showVideo ? <FaEyeSlash /> : <FaEye />}
                    <span className="hidden md:inline">{showVideo ? "Masquer la vidéo" : "Voir la vidéo"}</span>
                </button>

                {/* Bouton pour télécharger la vidéo */}
                <a
                    href={tutorialVideo}
                    download="demonstration.mp4"
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
                >
                    <FaDownload />
                    <span className="hidden md:inline">Télécharger la vidéo</span>
                </a>
            </div>
        </div>
      </section>

      {/* Modal plein écran (inchangé) */}
      {isOpen && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
              <div className="relative w-full h-full bg-white flex flex-col items-center justify-center">
                  {/* Bouton fermer */}
                  <button
                      onClick={() => setIsOpen(false)}
                      className="absolute top-4 right-6 text-2xl font-bold text-gray-800 hover:text-red-500 transition-colors"
                  >
                      ✕
                  </button>
                  {/* Contenu du modal */}
                  <DemoTable />
              </div>
          </div>
      )}
    </>
  );
};

export default Demo;
