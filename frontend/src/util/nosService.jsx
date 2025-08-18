export default function NosService() {
  return (
    <>
      {/* Section Services - Design Pro et Moderne en Mode Clair */}
      <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Effets lumineux de fond */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-2 h-[420px] bg-gradient-to-b from-orange-400/20 via-purple-400/20 to-transparent z-0 hidden md:block rounded-full blur-sm" />
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-orange-400/15 via-purple-400/15 to-pink-400/15 z-0 hidden md:block rounded-full blur-sm" />
        
        {/* Orbes lumineux flottants */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/8 to-purple-400/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-orange-400/8 to-yellow-400/8 rounded-full blur-3xl animate-pulse" />
        
        <div className="container mx-auto text-center max-w-7xl relative z-10">
          {/* Badge moderne */}
          <div className="mb-6">
            <span className="inline-block bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent text-sm font-bold tracking-widest uppercase px-6 py-2 rounded-full border border-orange-400/30 backdrop-blur-sm bg-white/50">
              Solution Complète
            </span>
          </div>
          
          {/* Titre principal moderne */}
          <h2 className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-5xl sm:text-6xl font-extrabold mb-6 animate-fadeIn tracking-tight">
            NOS SERVICES
          </h2>
          
          <p className="text-gray-700 text-xl sm:text-2xl font-light leading-relaxed max-w-3xl mx-auto mb-20">
            Une plateforme <span className="font-semibold text-orange-600">innovante</span> pour créer des événements 
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold"> extraordinaires</span>
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-16 relative">
            {/* Timeline futuriste */}
            <div className="hidden md:flex flex-col items-center justify-center h-full">
              {/* Étape 1 */}
              <div className="group relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-white text-xl font-bold relative z-10">1</span>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="h-24 w-1 bg-gradient-to-b from-orange-400 via-purple-400 to-blue-400 rounded-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-pink-400 to-purple-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Étape 2 */}
              <div className="group relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-white text-xl font-bold relative z-10">2</span>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              
              <div className="h-24 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-400 via-pink-400 to-red-400 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Étape 3 */}
              <div className="group relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="text-white text-xl font-bold relative z-10">3</span>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            {/* Cartes services modernes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {/* Carte Organisation */}
              <div className="group flex flex-col items-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 relative animate-fadeIn hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                {/* Container image avec effet moderne */}
                <div className="relative mb-8 p-6 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl">
                  <img
                    src="/src/assets/organiser.png"
                    className="h-24 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 filter group-hover:brightness-110"
                    alt="Organiser"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
                </div>
                
                <h3 className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent text-2xl font-bold mb-4">
                  Organisation
                </h3>
                <p className="text-gray-600 text-base leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
                  Planifiez chaque étape de votre événement avec notre outil de gestion 
                  <span className="font-semibold text-orange-600"> intelligent et intuitif</span>.
                </p>
                
                {/* Ligne de connexion moderne */}
                <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-1 bg-gradient-to-r from-orange-400 to-purple-400 rounded-full opacity-40" />
              </div>
              
              {/* Carte Lieu */}
              <div className="group flex flex-col items-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 relative animate-fadeIn hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative mb-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
                  <img
                    src="/src/assets/location.png"
                    className="h-24 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 filter group-hover:brightness-110"
                    alt="Location"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
                </div>
                
                <h3 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-2xl font-bold mb-4">
                  Lieux
                </h3>
                <p className="text-gray-600 text-base leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
                  Découvrez des lieux <span className="font-semibold text-purple-600">parfaits</span> selon vos critères, 
                  budget et localisation avec notre IA.
                </p>
                
                <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 w-12 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-40" />
              </div>
              
              {/* Carte Invitation */}
              <div className="group flex flex-col items-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 relative animate-fadeIn hover:bg-white/90 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="relative mb-8 p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl">
                  <img
                    src="/src/assets/wedding-invitation.png"
                    className="h-24 object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 filter group-hover:brightness-110"
                    alt="Invitation"
                  />
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
                </div>
                
                <h3 className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent text-2xl font-bold mb-4">
                  Invitations
                </h3>
                <p className="text-gray-600 text-base leading-relaxed text-center group-hover:text-gray-700 transition-colors duration-300">
                  Créez et envoyez des invitations <span className="font-semibold text-pink-600">personnalisées</span> 
                  en quelques clics avec notre éditeur avancé.
                </p>
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
