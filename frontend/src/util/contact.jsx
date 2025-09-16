import { useState } from 'react';
import { url } from '../api/url';

export default function Contact() {
    // La bonne pratique est d'utiliser un message d'état pour les retours utilisateur,
    // car 'alert' peut bloquer l'interface et n'est pas stylisable.
    const [messageStatus, setMessageStatus] = useState(null); // 'success', 'error', or null
    // L'environnement de compilation actuel ne prend pas en charge import.meta.env.
    // Nous utiliserons donc une URL de base fixe.
    const URL = `${url}`;
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessageStatus(null); // Réinitialiser le message de statut

        // Créer l'objet complet avec la date de création au format ISO 8601
        // Ce format est standard et évite les erreurs de parsing de date.
        const messagePayload = {
            ...formData,
            createdAt: new Date().toISOString(),
        };

        try {
            const response = await fetch(`${url}/contact_messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messagePayload) // Utiliser le payload avec la date
            });

            if (response.ok) {
                setMessageStatus('success'); // Afficher un message de succès
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    message: ''
                });
            } else {
                setMessageStatus('error'); // Afficher un message d'erreur
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessageStatus('error'); // Afficher un message d'erreur réseau
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Section Contact - Design Épuré avec Touches Colorées */}
            <section className="relative bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 pt-24 pb-15 px-4 shadow-xl overflow-hidden">
                {/* Effets lumineux subtils colorés */}
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-400/8 rounded-full blur-3xl animate-pulse" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    {/* Badge d'introduction */}
                    <div className="text-center mb-8">
                        <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-sm font-bold tracking-wide uppercase px-6 py-3 rounded-full border border-blue-200 backdrop-blur-sm bg-white/70 shadow-sm">
                            Contactez-nous
                        </span>
                    </div>

                    {/* Titre principal */}
                    <div className="text-center mb-16">
                        <h2 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent text-5xl sm:text-6xl font-bold mb-6 tracking-tight">
                            Parlons de votre projet
                        </h2>
                        <p className="text-gray-600 text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto">
                            Notre équipe d'experts est là pour transformer vos
                            <span className="font-semibold text-blue-600"> idées d'événements</span> en
                            <span className="bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent font-semibold"> réalités exceptionnelles</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Formulaire de contact */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-10 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                    Envoyez-nous un message
                                </h3>
                                <p className="text-gray-500">Nous vous répondrons dans les 24h</p>
                            </div>
                            
                            {/* Message de statut */}
                            {messageStatus === 'success' && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
                                    <p className="font-bold">Succès !</p>
                                    <p>Message envoyé avec succès !</p>
                                </div>
                            )}
                            {messageStatus === 'error' && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
                                    <p className="font-bold">Erreur !</p>
                                    <p>Erreur lors de l'envoi du message. Veuillez réessayer.</p>
                                </div>
                            )}
                            
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {/* Prénom & Nom */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                {/* Email & Téléphone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 bg-gray-50/50"
                                            placeholder="06 12 34 56 78"
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        required
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-200 bg-gray-50/50 resize-none"
                                        placeholder="Décrivez-nous votre projet d'événement en détail..."
                                    ></textarea>
                                </div>

                                {/* Bouton d'envoi */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full px-8 py-4 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                                    } text-white font-semibold text-lg rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                                >
                                    {loading ? (
                                        'Envoi en cours...'
                                    ) : (
                                        <>
                                            Envoyer le message
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Informations de contact */}
                        <div className="space-y-8">
                            {/* Informations principales */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                                    Nos coordonnées
                                </h3>

                                <div className="space-y-6">
                                    {/* Adresse */}
                                    <div className="flex items-start gap-4 group hover:-translate-y-1 transition-transform duration-200">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors duration-200">
                                            <svg
                                                className="w-6 h-6 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-lg">Adresse</h4>
                                            <p className="text-gray-600">123 Avenue des Événements</p>
                                            <p className="text-gray-600">75001 Paris, France</p>
                                        </div>
                                    </div>

                                    {/* Téléphone */}
                                    <div className="flex items-start gap-4 group hover:-translate-y-1 transition-transform duration-200">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-green-200 group-hover:to-blue-200 transition-colors duration-200">
                                            <svg
                                                className="w-6 h-6 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-lg">Téléphone</h4>
                                            <p className="text-gray-600 font-medium">+33 1 23 45 67 89</p>
                                            <p className="text-sm text-green-600 font-medium">Lun-Ven: 9h-18h</p>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-4 group hover:-translate-y-1 transition-transform duration-200">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors duration-200">
                                            <svg
                                                className="w-6 h-6 text-purple-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-lg">Email</h4>
                                            <p className="text-gray-600 font-medium">contact@eventpro.fr</p>
                                            <p className="text-sm text-purple-600 font-medium">Réponse sous 24h</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Horaires d'ouverture */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
                                    Horaires d'ouverture
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400">
                                        <span className="text-gray-700 font-medium">Lundi - Vendredi</span>
                                        <span className="text-green-700 font-bold">9h00 - 18h00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400">
                                        <span className="text-gray-700 font-medium">Samedi</span>
                                        <span className="text-blue-700 font-bold">9h00 - 13h00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 border-l-4 border-gray-300">
                                        <span className="text-gray-600 font-medium">Dimanche</span>
                                        <span className="text-gray-500 font-medium">Fermé</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.7;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }
                
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}