export default function Connexionorganisateur() {
    return (
        <>
            <div className='min-h-screen flex justify-center items-center py-10 px-4'>
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-20">
                    <h2 className="text-xl font-semibold mb-16 text-gray-800">Commencer</h2>

                    <div className="mb-4">
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2"> Nom </label>
                        <input type="text" id="nom" name="nom" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" placeholder="" />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-2"> Mot de passe </label>
                        <input type="password" id="mot_de_passe" name="mot_de_passe" className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" placeholder=""/>
                    </div>

                    <button type="submit" className="cursor-pointer w-full bg-[#333446] text-white py-3 rounded-2xl font-semibold text-lg hover:bg-[#373846] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-300" >
                        Se connecter
                    </button>

                    <button className="cursor-pointer mt-4 w-full bg-gray-50 py-3 rounded-md border border-gray-100 flex items-center justify-center space-x-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        <img src="https://api.iconify.design/logos:google-icon.svg" alt="Google logo" className="h-6" />
                        <span className="text-sm font-semibold text-gray-700">Se connecter avec Google</span>
                    </button>
                </div>
            </div>
        </>
    );
}
