export default function Testimonials() {
  return (
    <>
      {/* Section Témoignages - Design Pro et Moderne */}
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Effets lumineux de fond */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-orange-400/8 via-amber-400/8 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-r from-blue-400/8 via-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse" />
        
        {/* Décorations géométriques */}
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-full blur-2xl" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Badge d'introduction */}
          <div className="text-center mb-8">
            <span className="inline-block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-full border border-orange-400/30 backdrop-blur-sm bg-white/50">
              Ce que disent nos clients
            </span>
          </div>
          
          {/* Titre principal */}
          <div className="text-center mb-6">
            <h2 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-5xl sm:text-6xl font-extrabold mb-4 animate-fadeIn tracking-tight">
              TÉMOIGNAGES
            </h2>
            <p className="text-gray-700 text-xl sm:text-2xl font-light leading-relaxed max-w-3xl mx-auto">
              Découvrez pourquoi plus de <span className="font-semibold text-orange-600">10,000+ organisateurs</span> nous font confiance pour leurs 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold"> événements inoubliables</span>
            </p>
          </div>
          
          {/* Grille de témoignages */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Témoignage 1 */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeIn">
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              {/* Étoiles */}
              <div className="flex mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                "Une plateforme révolutionnaire ! J'ai organisé mon mariage en un temps record. L'interface est intuitive et les suggestions de lieux sont parfaites."
              </blockquote>
              
              {/* Profil */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Sophie Martin</p>
                  <p className="text-sm text-gray-500">Mariée - Paris</p>
                </div>
              </div>
            </div>
            
            {/* Témoignage 2 */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeIn" style={{animationDelay: '0.2s'}}>
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <div className="flex mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                "Excellent pour les événements corporatifs ! La gestion des invitations et le suivi en temps réel nous ont fait gagner énormément de temps."
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Jean Dubois</p>
                  <p className="text-sm text-gray-500">Event Manager - Lyon</p>
                </div>
              </div>
            </div>
            
            {/* Témoignage 3 */}
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeIn md:col-span-2 lg:col-span-1" style={{animationDelay: '0.4s'}}>
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <div className="flex mb-6 mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
              </div>
              
              <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                "Interface moderne et fonctionnalités complètes. Parfait pour organiser nos conférences tech. Le système d'invitations automatiques est génial !"
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Marie Leroy</p>
                  <p className="text-sm text-gray-500">Tech Lead - Marseille</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Témoignage vedette */}
          <div className="bg-gradient-to-r from-orange-50 via-purple-50 to-pink-50 rounded-3xl p-12 shadow-2xl border border-gray-200/50 mb-16 relative overflow-hidden animate-fadeIn" style={{animationDelay: '0.6s'}}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-2xl">
                  A
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                
                <blockquote className="text-gray-800 text-2xl font-light leading-relaxed mb-6 italic">
                  "Après avoir testé plusieurs plateformes, celle-ci se démarque vraiment par sa simplicité et ses fonctionnalités avancées. 
                  <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent font-semibold"> Un vrai game-changer</span> pour l'organisation d'événements !"
                </blockquote>
                
                <div>
                  <p className="font-bold text-xl text-gray-900">Alexandre Petit</p>
                  <p className="text-gray-600">Wedding Planner Professionnel - Nice</p>
                  <p className="text-sm text-gray-500 mt-1">Plus de 200 événements organisés avec notre plateforme</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style >{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
}
