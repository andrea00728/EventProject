import React, { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { FaGears, FaUsers, FaUser } from "react-icons/fa6";
import {
  MdDashboard,
  MdCalendarToday,
  MdOutlineCalendarMonth,
  MdOutlineCalendarToday,
  MdVerifiedUser,
  MdAttachMoney,
  MdSearch,
  MdRoom,
  MdLogout,
} from "react-icons/md";
import { delay, motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const choixItems = [
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <MdDashboard /> },
    { path: "/AdminEvenement", name: "Evénements", icon: <MdCalendarToday /> },
    { path: "/AdminOrganisateur", name: "Organisateurs", icon: <FaUsers /> },
    {
      path: "/LocationSalle",
      name: "Gérer salles et localitsation",
      icon: <MdRoom />,
    },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaGears /> },
  ];
  const navVariants = {
    closed: {
      // Compact state: only icons
      transition: {
        type: "spring", // Use spring physics for a more natural feel
        duration: 3,
        bounce: 0.4,
      },
      scale: 0.8,
    },
    open: {
      scale: 1,
      transition: {
        type: "spring",
        duration: 3,
        bounce: 0.4,
      },
    },
  };

  const [isHover, setIsHover] = useState(false);
  return (
    <>
      <div className="flex justify-center items-center overflow-hidden">
        <AnimatePresence>
          <motion.header
            className=" text-black h-[99vh] bg-[#cfc6c4] flex flex-col rounded-4xl ml-2 p-3 shadow-2xl"
            onMouseLeave={() => {
              setIsHover(false);
            }}
            onMouseEnter={() => {
              setIsHover(true);
            }}
            initial={isHover && "closed"}
            animate={isHover && "open"}
            variants={navVariants}
            exit={!isHover && "closed"}
          >
            <motion.div
              initial={
                isHover && {
                  opacity: 0,
                  transition: { duration: 3, x: -100, type: "spring" },
                }
              }
              animate={
                isHover && {
                  opacity: 1,
                  transition: { duration: 3, x: 0, type: "spring" },
                }
              }
              className={`text-center flex ${isHover ? "justify-start gap-3" : "justify-center"}  items-center border-b border-gray-300 pb-4`}
            >
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Admin"
                className="w-12 h-12 rounded-full "
              />

              <span
                className="font-semibold italic tracking-wide transition-all duration-300"
                style={{
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
              >
                {isHover && "Alan Walker"}
              </span>
            </motion.div>
            <nav>
              <ul>
                {choixItems.map((value, key) => (
                  <li key={key}>
                    <Link
                      to={value.path}
                      className={`flex ${
                        isHover ? "hover:justify-start" : "justify-center"
                      }  ease-in text-[16px] font-semibold items-center gap-3  text-start mt-6 hover:underline cursor-pointer`}
                    >
                      <span>{value.icon}</span>
                      {isHover && (
                        <motion.span
                          className="transition-all duration-500 ease-in"
                          initial={{ opacity: 0 }}
                          animate={
                            isHover && {
                              opacity: 1,
                              transition: {
                                duration: 1,
                                ease: "easeIn",
                                type: "spring",
                              },
                            }
                          }
                          exit={{ opacity: 0 }}
                        >
                          {value.name}
                        </motion.span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Déconnexion */}
            <div className={`flex ${isHover ? "justify-start" : "justify-center"} mt-auto pt-6 border-t border-gray-300 pt-6 `}>
              <button
                onClick={() => alert('Vous êtes déconnetés')} // Remplace par ta logique de déconnexion
                className={`flex justify-between items-center gap-3 text-red-700 hover:text-red-900 font-semibold text-[16px]`}
              >
                <MdLogout />
                {isHover && <span>Déconnexion</span>}
              </button>
            </div>
          </motion.header>
        </AnimatePresence>
        <div
          className={`flex-1 overflow-auto bg-white rounded-2xl shadow-2xl ml-4`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
}
