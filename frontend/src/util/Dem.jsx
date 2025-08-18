import { useState, useRef } from 'react';
import tutorialVideo from "../assets/demo.mp4"; // import de la vidéo

const Demo = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showVideo, setShowVideo] = useState(true);
    
    const videoRef = useRef(null);

    const toggleFullScreen = () => {
        if (videoRef.current) {
            if (!document.fullscreenElement) {
            videoRef.current.requestFullscreen().catch(err => console.log(err));
            } else {
            document.exitFullscreen();
            }
        }
    };
    return(
        <>
            <section className="relative w-full min-h-20vw flex flex-col md:flex-row items-center justify-center gap-8 px-6 md:px-5 py-10 bg-gray-50">
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
                <div className="flex-1 flex flex-col gap-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                    Ceci est une démonstration directe
                    </h2>
                    <p className="text-gray-700 text-sm md:text-base">
                    Explorez les fonctionnalités de notre plateforme comme vous le souhaitez.
                    Vous pouvez regarder la vidéo en petit écran ou en plein écran selon vos préférences.
                    </p>
        
                    <div className="flex gap-4 mt-4">
                    {/* Bouton pour ouvrir le modal */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
                    >
                        Voir la démo
                    </button>
        
                    {/* Bouton pour afficher/masquer la vidéo */}
                    <button
                        onClick={() => setShowVideo(!showVideo)}
                        className="bg-gray-200 text-gray-900 px-5 py-3 rounded-xl font-semibold hover:scale-105 transition"
                    >
                        {showVideo ? "Masquer la vidéo" : "Voir la vidéo"}
                    </button>
        
                    {/* Bouton pour télécharger la vidéo */}
                    <a
                        href={tutorialVideo}
                        download="demonstration.mp4"
                        className="bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:scale-105 transition flex items-center justify-center"
                    >
                        Télécharger la vidéo
                    </a>
                    </div>
                </div>
            </section>
    
            {/* Modal plein écran */}
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
                <h1 className="text-3xl font-bold text-gray-900">
                    Page de démonstration
                </h1>
                </div>
            </div>
            )}
        </>
    )
}

export default Demo;