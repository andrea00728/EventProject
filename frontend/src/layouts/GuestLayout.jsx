import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";

export default function GuestLayout() {
  const { token } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  console.log("GuestLayout rendu, token :", token); // Log pour déboguer

  if (token) {
    return <Navigate to="/accueil" replace />;
  }

  const navItems = [
    { path: "/inscription", name: "Inscription" },
  ];

  return (
    <>
      <header className="w-full mx-auto bg-white shadow-md fixed">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-md shadow-sm">
            <h1 className="text-lg font-bold text-[#336666]">Logo</h1>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-[#336666] text-base font-medium">
          </div>
          <div className="flex items-center gap-3 ">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <button className="flex items-center justify-center gap-2 text-white bg-[#333446] font-bold text-sm sm:text-base w-[100px] sm:w-[120px] h-9 sm:h-10 rounded-full hover:bg-[#224444] transition">
                  <span>{item.name}</span>
                </button>
              </Link>
            ))}
            <button
              className="md:hidden text-[#336666] focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                />
              </svg>
            </button>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </>
  );
}