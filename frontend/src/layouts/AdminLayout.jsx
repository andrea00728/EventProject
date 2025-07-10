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
} from "react-icons/md";
import { delay, motion, AnimatePresence } from "framer-motion";

export default function AdminLayout() {
  const choixItems = [
    { path: "/AdminAccueil", name: "Tableau de bord", icon: <MdDashboard /> },
    { path: "/AdminEvenement", name: "Evénements", icon: <MdCalendarToday /> },
    { path: "/AdminOrganisateur", name: "Organisateurs", icon: <FaUsers /> },
    { path: "/LocationSalle", name: "Gérer salles et localitsation", icon: <MdRoom /> },
    { path: "/AdminParametre", name: "Paramètres", icon: <FaGears /> },
  ];
  const navVariants = {
    closed: {
      // Compact state: only icons
      transition: {
        type: "spring", // Use spring physics for a more natural feel
        duration: 3,
        bounce:0.4
      },
      scale: 0.8,  
    },
    open: {
      scale: 1,
      transition: {
        type: "spring",
        duration: 3,
        bounce:0.4,
      },
    },
  };

  const [isHover, setIsHover] = useState(false);
  return (
    <>
      <div className="flex justify-center items-center">
        <AnimatePresence>
          <motion.header
            className=" text-black h-[99vh] bg-[#cfc6c4]  rounded-4xl items-start ml-2 p-4"
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
            <motion.h1
              initial={isHover && {
                  opacity: 0,
                  transition: { duration: 3,x:-100, type: "spring" },
                }}
              animate={
                isHover && {
                  opacity: 1,
                  transition: { duration: 3,x:0, type: "spring" },
                }
              }

              className="text-2xl text-center transition-all duration-500"
              style={{ fontFamily: "cursive", fontStyle: "italic" }}
            >
              {isHover ? "Master Table" : "MT"}
            </motion.h1>
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
          </motion.header>
        </AnimatePresence>
        <div className={`px-2 flex-4/5 h-full`}>
          <Outlet/>
        </div>
      </div>
    </>
  );
}
