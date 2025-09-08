export default function Inscription() {
  return (
    <>
      <div className="flex items-center justify-center min-h-200 ">
        <div className="bg-white  rounded-lg shadow-lg w-full max-w-md max-w-full ">
           <h2 className="text-xl font-semibold text-gray-700 mb-6 ml-10.5 mt-2">Rejoindre maintenant</h2>
          <div className="px-10 mt-15 py-6 mb-20">
          <form className="space-y-8">
            <div>
              <label className="block text-xl font-medium text-gray-700">Nom</label>
              <input type="text" className="mt-1 text-lg block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"/>
            </div>
            <div>
              <label className="block text-xl font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 text-lg block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"/>
            </div>
            <div>
              <label className="block text-xl font-medium text-gray-700">Mot de passe</label>
              <input type="password" className="mt-1 text-lg block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"/>
            </div>
            <button
              type="submit" className="w-full mt-5 text-xl bg-[#333446] text-white py-2 px-4 rounded-2xl hover:bg-[#373846] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Commencer</button>
          </form>
          </div>
         </div>
      </div>
    </>
  );
}

