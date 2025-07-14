import React from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' ;

export default function ButtonConnexion() {
  const connecter= () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <button className="bg-[#333446] text-white px-5 py-2.5 sm:px-6 sm:py-3 w-full sm:w-40 rounded-full flex items-center justify-center gap-2 hover:bg-[#222] transition text-sm sm:text-base" onClick={connecter}>
    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
     alt="Google"
     className="w-4 h-4 sm:w-5 sm:h-5"
     />
     Email
    </button>
  );
}

