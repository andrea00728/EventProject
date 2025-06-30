export default function NosService(){
    return (
        <>
        {/* Section Services */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-12 text-gray-800">NOS SERVICES</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/organiser.png" className="h-28 mb-4 object-contain" alt="Organiser" />
              <p className="text-gray-600 text-sm">
                Nous vous aidons à planifier chaque étape de votre événement et à structurer votre organisation de manière claire, efficace et numérique.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/location.png" className="h-28 mb-4 object-contain" alt="Location" />
              <p className="text-gray-600 text-sm">
                Trouvez facilement des suggestions de lieux pour accueillir votre événement, selon votre budget, votre type d’événement et votre localisation.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <img src="/src/assets/wedding-invitation.png" className="h-28 mb-4 object-contain" alt="Invitation" />
              <p className="text-gray-600 text-sm">
                Créez automatiquement vos invitations personnalisées et envoyez-les à vos invités en quelques clics, par email ou lien direct.
              </p>
            </div>
          </div>
        </div>
      </section>
        </>
    );
}