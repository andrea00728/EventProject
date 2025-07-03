export default function NosService() {
  return (
    <>
      {/* Section Services */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="container mx-auto text-center max-w-7xl">
          <h2 className="text-2xl font-semibold mb-12 text-[#333446] animate-fadeIn">NOS SERVICES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 animate-fadeIn">
              <img
                src="/src/assets/organiser.png"
                className="h-32 mb-6 object-contain transition-transform duration-200 hover:scale-105"
                alt="Organiser"
              />
              <p className="text-[#6D6767] text-base leading-relaxed text-center">
                Nous vous aidons à planifier chaque étape de votre événement et à structurer votre organisation de manière claire, efficace et numérique.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 animate-fadeIn">
              <img
                src="/src/assets/location.png"
                className="h-32 mb-6 object-contain transition-transform duration-200 hover:scale-105"
                alt="Location"
              />
              <p className="text-[#6D6767] text-base leading-relaxed text-center">
                Trouvez facilement des suggestions de lieux pour accueillir votre événement, selon votre budget, votre type d’événement et votre localisation.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 animate-fadeIn">
              <img
                src="/src/assets/wedding-invitation.png"
                className="h-32 mb-6 object-contain transition-transform duration-200 hover:scale-105"
                alt="Invitation"
              />
              <p className="text-[#6D6767] text-base leading-relaxed text-center">
                Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}