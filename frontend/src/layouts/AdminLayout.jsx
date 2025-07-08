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
import { motion } from "framer-motion";

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
        duration: 0.5,
      },
    },
    open: {
      transition: {
        type: "spring",
        duration: 0.5,
      },
    },
  };

  const [isHover, setIsHover] = useState(false);
  return (
    <>
      <div className="flex">
        <div className="top-0 fixed h-full py-1">
          <motion.header
            className=" text-black transition-all ease-in duration-initial h-full bg-[#cfc6c4]  rounded-4xl items-start ml-2 p-4"
            onMouseLeave={() => {
              setIsHover(false);
            }}
            onMouseEnter={() => {
              setIsHover(true);
            }}
            animate={isHover ? "open" : "closed"}
            variants={navVariants}
          >
            <motion.h1
              animate={
                isHover && {
                  opacity: 1,
                  transition: { duration: 0.5, ease: "easeIn", type: "spring" },
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
        </div>
        <div className={`px-2 ${isHover ? "ml-[42vh]" : "ml-[15vh]"} flex-4/5`}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
