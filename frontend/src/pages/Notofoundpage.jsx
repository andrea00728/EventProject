import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, Search, Mail, Phone } from 'lucide-react';

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoHome = () => {
    // Redirection vers la page d'accueil
    window.location.href = '/';
    // Ou si vous utilisez React Router :
    // navigate('/');
  };

  const handleGoBack = () => {
    // Retour à la page précédente dans l'historique
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Si pas d'historique, rediriger vers l'accueil
      window.location.href = '/';
    }
  };

  const handleSearch = () => {
    console.log('Ouverture de la recherche');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: mousePosition.x * 0.02 + '%',
            top: mousePosition.y * 0.02 + '%',
            transition: 'all 0.3s ease-out'
          }}
        />
        <div 
          className="absolute w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: (window.innerWidth - mousePosition.x) * 0.03 + 'px',
            bottom: (window.innerHeight - mousePosition.y) * 0.03 + 'px',
            transition: 'all 0.5s ease-out'
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-bounce"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (Math.random() * 3 + 2) + 's'
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="max-w-4xl w-full">
          {/* Main content */}
          <div className="text-center mb-16">
            {/* 404 Number with glassmorphism effect */}
            <div className="relative mb-8">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 leading-none animate-pulse">
                404
              </h1>
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl -z-10 transform rotate-3 scale-110" />
            </div>

            {/* Error message */}
            <div className="space-y-6 mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Oops! Page non trouvée
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                La page que vous recherchez semble avoir disparu dans l'espace numérique. 
                Ne vous inquiétez pas, même les meilleurs explorateurs se perdent parfois.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={handleGoHome}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center"
              >
                <Home className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Retour à l'accueil
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </button>

              <button
                onClick={handleGoBack}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                Page précédente
              </button>

            </div>

            
          </div>

        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-purple-500/30 rounded-full animate-spin" />
      <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-blue-500/30 rounded-lg animate-bounce" />
      <div className="absolute top-1/2 left-5 w-2 h-2 bg-pink-400 rounded-full animate-ping" />
      <div className="absolute top-1/4 right-5 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
    </div>
  );
}