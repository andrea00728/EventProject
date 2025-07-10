export default function NosService() {
  return (
    <>
      {/* Section Services - Schéma Professionnel */}
      <section className="relative bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-white py-24 px-4 rounded-3xl shadow-2xl overflow-hidden">
        {/* Décorations schéma */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-2 h-[420px] bg-gradient-to-b from-[#FB9E3A]/30 via-indigo-200/30 to-transparent z-0 hidden md:block" />
        <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-[#FB9E3A]/20 via-indigo-200/20 to-transparent z-0 hidden md:block" />
        <div className="container mx-auto text-center max-w-7xl relative z-10">
          <h2 className="text-4xl font-extrabold mb-16 text-indigo-800 animate-fadeIn tracking-tight drop-shadow-sm">
            NOS SERVICES
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-16 relative">
            {/* Flèches de schéma */}
            <div className="hidden md:flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 rounded-full bg-[#FB9E3A] flex items-center justify-center shadow-lg mb-2">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <div className="h-24 w-1 bg-gradient-to-b from-[#FB9E3A] to-indigo-200" />
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg mb-2">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <div className="h-24 w-1 bg-gradient-to-b from-indigo-500 to-[#8B5CF6]" />
              <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
            </div>
            {/* Cartes services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-indigo-50 p-10 relative animate-fadeIn">
                <img
                  src="/src/assets/organiser.png"
                  className="h-32 mb-8 object-contain transition-transform duration-200 hover:scale-105"
                  alt="Organiser"
                />
                <h3 className="text-xl font-bold text-indigo-700 mb-4">Organisation</h3>
                <p className="text-[#6D6767] text-base leading-relaxed text-center">
                  Planifiez chaque étape de votre événement et structurez votre organisation de manière claire, efficace et numérique.
                </p>
                {/* Schéma ligne */}
                <div className="hidden md:block absolute right-[-32px] top-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-[#FB9E3A] to-indigo-200 rounded-full" />
              </div>
              <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-indigo-50 p-10 relative animate-fadeIn">
                <img
                  src="/src/assets/location.png"
                  className="h-32 mb-8 object-contain transition-transform duration-200 hover:scale-105"
                  alt="Location"
                />
                <h3 className="text-xl font-bold text-indigo-700 mb-4">Lieu</h3>
                <p className="text-[#6D6767] text-base leading-relaxed text-center">
                  Trouvez facilement des suggestions de lieux selon votre budget, votre type d’événement et votre localisation.
                </p>
                <div className="hidden md:block absolute right-[-32px] top-1/2 -translate-y-1/2 w-16 h-1 bg-gradient-to-r from-indigo-200 to-[#8B5CF6] rounded-full" />
              </div>
              <div className="flex flex-col items-center bg-white rounded-2xl shadow-xl border border-indigo-50 p-10 animate-fadeIn">
                <img
                  src="/src/assets/wedding-invitation.png"
                  className="h-32 mb-8 object-contain transition-transform duration-200 hover:scale-105"
                  alt="Invitation"
                />
                <h3 className="text-xl font-bold text-indigo-700 mb-4">Invitation</h3>
                <p className="text-[#6D6767] text-base leading-relaxed text-center">
                  Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}