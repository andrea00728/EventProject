import React, { useState } from "react";
import { useStateContext } from "../context/ContextProvider";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/LogoMaster.png"
import ChatWidget from "../pages/ChatWidget";

export default function GuestLayout() {
  const { token,role,user } = useStateContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
   const navItems = [
    { path: "#pagepublic", name: "Accueil" },
    { path: "#service", name: "Service" },
    { path: "#contact", name: "Contact" }
  ];
  // if (token) {
  //   if(role==="organisateur"){
  //      return <Navigate to="/accueil" replace />;
  //   }
  //   if(role==="accueil"){
  //     return <Navigate to="/personnelAccueil" replace/>
  //   }
  //   if(role==="caissier"){
  //     return <Navigate to="/personnelCaisse" replace/>
  //   }
  //   if(role==="cuisinier"){
  //     return <Navigate to="/personnelCuisine" replace/>
  //   }
  // }

  if(token){
    if(user?.isInPersonnel){
      return <Navigate to="/choix-role" replace/>
    }

     if(role==="organisateur"){
      return <Navigate to="/accueil" replace />;
     }
  }

  // const navItems = [
  //   { path: "/inscription", name: "Inscription" },
  // ];

  const menuVariants = {
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
  };

   return (
        <>
          <header className="w-full bg-white shadow-2xl fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-indigo-100 flex items-center justify-center rounded-xl shadow-lg border-4 border-indigo-200">
              <img src={Logo} className="text-3xl font-extrabold text-indigo-700 tracking-tight"/>
            </div>
            <span className="ml-2 text-2xl font-bold text-indigo-700 tracking-wide hidden sm:block"></span>
          </div>

        <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-indigo-900 font-medium text-base">
  {navItems.map((item) => (
    <motion.div key={item.name} className="relative group">
      {item.path.startsWith("#") ? (
       <a
        href={item.path}
        onClick={e => {
        if (item.path.startsWith("#")) {
        e.preventDefault();
        const id = item.path.substring(1);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }}
  className="..."
>
  {item.name}
        </a>

      ) : (
        // Routes classiques React Router
        <Link
          to={item.path}
          className="px-4 py-2 hover:text-indigo-600 transition-colors duration-300 relative z-10 font-semibold tracking-wide"
        >
          {item.name}
        </Link>
      )}
    </motion.div>
  ))}
</nav>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </header>
      <main >
            <Outlet/>
      </main>
      </>
    );
}