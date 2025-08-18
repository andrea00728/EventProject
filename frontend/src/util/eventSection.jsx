const events = [
  {
    id: 1,
    name: 'Tech Conference 2024',
    date: '15 Nov 2024',
    location: 'Paris',
    participants: '524 participants',
    rating: 4.9,
    description: 'Conférence technologique avec plus de 500 participants et 20 speakers internationaux.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    status: 'TERMINÉ',
    icon: (
      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Festival Solidaire',
    date: '08 Nov 2024',
    location: 'Lyon',
    participants: '1,2k participants',
    rating: 4.8,
    description: 'Événement caritatif avec concerts, ateliers et collecte de fonds pour les associations locales.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    status: 'SUCCÈS',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'Summit Business 2024',
    date: '02 Nov 2024',
    location: 'Marseille',
    participants: '300 participants',
    rating: 4.7,
    description: 'Sommet d\'affaires réunissant les leaders de l\'industrie pour discuter des tendances futures.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    status: 'CORPORATE',
    icon: (
      <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {/* Icône personnalisée */}
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'Nuit des Arts Créatifs',
    date: '25 Oct 2024',
    location: 'Bordeaux',
    participants: '180 participants',
    rating: 5.0,
    description: 'Exposition d\'art contemporain avec vernissage, performances artistiques et networking créatif.',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    status: 'CULTUREL',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16m-7 8v-2m0 0a2 2 0 00-2-2 2 2 0 00-2 2m0 0h4m-7 0H4m7 0h6m-7-4h6m-7 0H4" />
      </svg>
    ),
  },
];

const EventsSection = () => {
  return (
    <section className="relative bg-white py-24 px-4 overflow-hidden">
      <div className="absolute top-20 right-10 w-40 h-40 bg-gradient-to-r from-indigo-300/10 to-purple-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-56 h-56 bg-gradient-to-r from-[#FB9E3A]/10 to-orange-400/10 rounded-full blur-2xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center lg:text-left mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-full px-4 py-2 text-sm font-medium text-[#FB9E3A] shadow-sm">
            <div className="w-2 h-2 bg-[#FB9E3A] rounded-full animate-pulse"></div>
            Événements récents
          </div>

          <h2 className="text-4xl lg:text-6xl font-black text-slate-800 leading-[1.1] tracking-tight">
            Découvrez nos derniers
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FB9E3A] via-orange-500 to-amber-500 drop-shadow-sm">
              succès
            </span>
          </h2>

          <p className="text-slate-600 text-xl lg:text-2xl leading-relaxed font-normal max-w-2xl">
            Des événements exceptionnels organisés par notre communauté
            <span className="font-semibold text-slate-700"> d'organisateurs</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {events.map((event) => (
            <div key={event.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:scale-105">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-3 py-2 rounded-full border border-white/30 shadow-lg">
                  {event.status}
                </div>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl border border-white/30 shadow-lg">
                  {event.date}
                </div>

                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                  {event.icon}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-black text-xl text-slate-800 group-hover:text-rose-600 transition-colors leading-tight">
                  {event.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {event.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{event.participants}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(Math.floor(event.rating)) + '☆'.repeat(5 - Math.floor(event.rating))}
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-semibold">{event.rating}</span>
                  </div>
                  {/* <button className="text-rose-600 text-sm font-bold hover:text-rose-800 transition-colors group-hover:translate-x-1 transform duration-200">
                    Voir détails →
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
