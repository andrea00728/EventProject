import { useState } from 'react';
import tutorialVideo from "../assets/demo.mp4"; // import de la vidéo

const Demo = () => {
    const [isOpen, setIsOpen] = useState(false);
    return(
        <>
            <section className="relative w-full h-screen overflow-hidden">
            {/* Vidéo en arrière-plan */}
                <video
                    src={tutorialVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
                />
        
                {/* Overlay assombrissant */}
                <div className="absolute inset-0 bg-black/30 z-0" />
        
                {/* Texte Démo en haut à gauche */}
                <div className="absolute top-6 left-6 z-10">
                    <div className="bg-white/80 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-1 rounded-lg shadow-md flex items-center gap-2">
                    <span className="text-red-500 text-sm">●</span>
                    <span>Ceci est une démonstration directe</span>
                    <span className="text-[10px] text-gray-700">
                        Explorez les fonctionnalités sans risque.
                    </span>
                    </div>
                </div>
        
                {/* Badge Démo en bas à droite */}
                <div className="absolute bottom-6 right-6 z-10">
                    <button
                    onClick={() => setIsOpen(true)}
                    className="bg-white/90 backdrop-blur-sm text-slate-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                    <span className="text-red-500 text-lg">●</span>
                    Démonstration en direct
                    </button>
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