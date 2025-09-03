import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from 'react';
import ChatWidget from "../pages/ChatWidget";
import { RxCaretRight, RxCaretLeft } from 'react-icons/rx';

export default function EventLayout() {
    const navigate = useNavigate()
    const versDash  = () => {
      navigate("/evenement/dashboard/eventsDash")
    }
    
    const choixItems = [
        { 
            path: "eventpadding", 
            name: "Événements en attente",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        { 
            path: "", 
            name: "Événements en cours",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="relative flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Bouton de menu pour les petits écrans (visible uniquement sur mobile) */}
            <div className={`
                    absolute top-4 z-40 lg:hidden
                    transform transition-transform duration-300
                    ${isMenuOpen ? 'left-80' : 'left-2'}
                `}>
                <button
                    onClick={toggleMenu}
                    className="p-3 bg-white/30 backdrop-blur-sm shadow-xl border border-slate-200/60 transition-all hover:scale-105 transform hover:-rotate-12"
                >
                    {isMenuOpen ? (
                        <RxCaretLeft className="w-6 h-6 text-slate-700" />
                    ) : (
                        <RxCaretRight className="w-6 h-6 text-slate-700" />
                    )}
                </button>
            </div>

            {/* Sidebar : cachée par défaut, s'anime pour apparaître, visible sur les grands écrans */}
            <aside
                className={`
                    fixed h-screen w-80 bg-white/90 backdrop-blur-sm border-r border-slate-200/60 shadow-2xl flex flex-col z-30
                    transform transition-transform duration-300
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-200/60 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                                Gestion Événements
                            </h2>
                        </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Organisez et gérez vos événements facilement
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 min-h-0">
                    <ul className="space-y-3">
                        {choixItems.map((item, index) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`
                                        group flex items-center gap-3 px-4 py-4 rounded-xl
                                        text-slate-700 hover:text-white font-medium
                                        transition-all duration-300 transform hover:scale-[1.02]
                                        ${index === 0
                                            ? 'hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:shadow-xl hover:shadow-orange-500/25'
                                            : 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:shadow-blue-500/25'
                                        }
                                        relative overflow-hidden border border-transparent
                                        hover:border-white/20
                                    `}
                                    onClick={toggleMenu} // Ferme le menu après avoir cliqué sur un lien
                                >
                                    <div className={`
                                        p-2.5 rounded-lg transition-all duration-300 flex-shrink-0
                                        ${index === 0
                                            ? 'bg-orange-100 group-hover:bg-white/20'
                                            : 'bg-blue-100 group-hover:bg-white/20'
                                        }
                                    `}>
                                        <div className={`
                                            w-5 h-5
                                            ${index === 0 ? 'text-orange-600' : 'text-blue-600'}
                                            group-hover:text-white transition-colors duration-300
                                        `}>
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold flex-1 min-w-0 truncate">
                                        {item.name}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Section stats ou info supplémentaire */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 cursor-pointer" onClick={versDash}>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1 ">
                                <p className="text-xs font-bold text-slate-700 truncate">Tableau de bord</p>
                                <p className="text-xs text-slate-500 truncate">Vue d'ensemble</p>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200/60 flex-shrink-0">
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-700 truncate">Besoin d'aide ?</p>
                                <p className="text-xs text-slate-500 truncate">Support disponible 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden lg:ml-80">
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
                <ChatWidget />
            </main>
        </div>
    );
}
