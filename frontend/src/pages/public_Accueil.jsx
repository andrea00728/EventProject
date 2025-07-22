import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NosService from "../util/nosService";
import ButtonConnexion from "../util/buttonconnexion";

const images = [
  "/images/music-7238254_1280.jpg",
  "/images/birthday.jpeg",
  "/images/little-girl-6746693_1280.jpg",
  "/images/play-5134828_1280.jpg",
  "/images/couple-443600_1280.jpg",
];


const Public_Accueil = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(0);
  const accueilRef = useRef(null);
  const serviceRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#service" && serviceRef.current) {
      serviceRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (hash === "#contact" && contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      next();
    }, 2000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const prev = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const next = () =>
    setCurrent((prev) => (prev + 1) % images.length);

  const goTo = (index) => setCurrent(index);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
  };

  return (
    <>
      <section id="pagepublic" ref={accueilRef}>
        <div
          className="relative w-full h-screen overflow-hidden"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative h-full rounded-lg">
            <AnimatePresence>
              <motion.img
                key={images[current]}
                src={images[current]}
                alt={`Slide ${current + 1}`}
                className="absolute top-1/2 left-1/2 w-full h-screen blur-[3px] opacity-40 bg-black bg-cover object-cover transform -translate-x-1/2 -translate-y-1/2 rounded-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              />
            </AnimatePresence>
          </div>

          {/* Texte & boutons */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <h1 className="text-white text-4xl font-bold mb-4">
              Bienvenue à l'événement
            </h1>
            <p className="text-white text-lg mb-6">
              Découvrez une expérience unique !
            </p>
            <br />
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <button className="bg-gradient-to-r from-[#333446] to-[#22223b] text-white px-7 py-3 w-full h-[50px] sm:w-50 rounded-full hover:from-[#222] hover:to-[#333446] transition-all duration-200 shadow-lg text-base font-semibold tracking-wide">
                Inscription
              </button>
              {/* <button onClick={logiin} className="bg-gradient-to-r from-[#333446] to-[#22223b] text-white px-7 py-3 w-[90%] h-[50px] sm:w-50 rounded-full hover:from-[#222] hover:to-[#333446] transition-all duration-200 shadow-lg text-base font-semibold tracking-wide">
                Connexion
              </button> */}
              <ButtonConnexion/>
            </div>
          </div>

          {/* Indicateurs */}
          <div className="absolute bottom-5 left-1/2 flex space-x-3 -translate-x-1/2 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === current ? "bg-white scale-125" : "bg-gray-500 opacity-70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Contrôles */}
          <button
            onClick={prev}
            className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </section>

      <section id="service" ref={serviceRef}>
        <NosService />
      </section>

      <section id="contact" ref={contactRef}>
        contact
      </section>
    </>
  );
};

export default Public_Accueil;
