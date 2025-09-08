import React, { useState } from 'react';

const SuperAdminProfileEdit = () => {
  const [profile, setProfile] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@admin.com',
    bio: 'Super Administrateur responsable de la gestion des utilisateurs, de la configuration système et de la surveillance de l\'application.',
    profilePicture: 'https://via.placeholder.com/150', // Placeholder pour l'image
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous intégreriez votre logique pour envoyer les données à l'API
    console.log('Profil à mettre à jour :', profile);
    alert('Le profil a été sauvegardé avec succès !');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans w-full">
        <div className="max-w-4xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Édition du Profil Super Administrateur
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">

            <form onSubmit={handleSubmit}>

                <div className="flex flex-col items-center mb-10">
                    <img
                        src={profile.profilePicture}
                        alt="Photo de profil"
                        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
                    />
                    <label
                        htmlFor="profilePictureInput"
                        className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        Changer la photo
                    </label>

                    <input
                        id="profilePictureInput"
                        type="file"
                        className="hidden"
                    />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">

                    <div>

                        <div className="mb-6">
                        <label htmlFor="firstName" className="block text-gray-700 font-semibold mb-2">Prénom</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                        />
                        </div>
                        
                        <div className="mb-6">
                        <label htmlFor="lastName" className="block text-gray-700 font-semibold mb-2">Nom</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                        />
                        </div>
                        
                        <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">Adresse E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                            disabled // Champ désactivé pour des raisons de sécurité
                            className="w-full p-3 bg-gray-200 border border-gray-300 rounded-lg cursor-not-allowed"
                        />
                        </div>
                    </div>
                    
                    <div>

                        <div className="mb-6">
                        <label htmlFor="bio" className="block text-gray-700 font-semibold mb-2">Biographie</label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={profile.bio}
                            onChange={handleChange}
                            rows="6"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-colors"
                        />
                        </div>
                    </div>
                    </div>
                    
                    <div className="text-center mt-8">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-10 py-3 bg-green-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-700 transition-colors"
                    >
                        Sauvegarder les modifications
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfileEdit;