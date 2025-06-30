import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";

import Profil from "../util/profils";

export default function DefaultLayout() {
  const { token, isLoading } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  if (!token) {
    return <Navigate to="/pagepublic" />;
  }
  const navItems = [
    { path: "/accueil", name: "Accueil" },
    { path: "/evenement", name: "Evenement" },
    { path: "/apropos", name: "A propos" },
  ];

  return (
    <>
       <header className="w-full mx-auto bg-white shadow-md fixed mt-[-70px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-md shadow-sm">
            <h1 className="text-lg font-bold text-[#336666]">Logo</h1>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-[#336666] text-base font-medium">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="hover:underline hover:text-[#224444] transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Profil/>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 text-[#336666] text-base font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="hover:underline hover:text-[#224444] transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16">
        <Outlet />
      </main>
    </>
  );
}
