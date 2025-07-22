import React from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000' ;

export default function ButtonConnexion() {
  const connecter= () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  return (
    <button className="bg-gradient-to-r from-[#333446] to-[#22223b] text-white px-7 py-3 w-[90%] h-[50px] sm:w-50 rounded-full hover:from-[#222] hover:to-[#333446] transition-all duration-200 shadow-lg text-base font-semibold tracking-wide" onClick={connecter}>
    {/* <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
     alt="Google"
     className="w-4 h-4 sm:w-5 sm:h-5"
     /> */}
     Email
    </button>
  );
}

