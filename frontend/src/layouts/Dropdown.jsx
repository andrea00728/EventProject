import React, { useState, useEffect, forwardRef } from "react";
import { useDarkMode } from "../context/DarkModeContext";

const Dropdown = forwardRef(({ show, setShow, icon, label, count, items }, ref) => {
  const { darkMode } = useDarkMode();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        }`}
        aria-label={label}
      >
        <div className="relative">
          {React.cloneElement(icon, { className: "w-5 h-5" })}
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </div>
      </button>

      {show && (
        <div
          className={`fixed sm:absolute mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] overflow-y-auto rounded-xl shadow-xl border ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-gray-200"
              : "bg-white border-gray-200 text-gray-900"
          } z-50 transition-all duration-200 ${
            isMobile ? "left-4 right-4" : "right-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            {React.cloneElement(icon, { className: "w-5 h-5" })}
            <h4
              className={`font-semibold text-sm sm:text-base ${
                darkMode ? "text-purple-300" : "text-purple-600"
              }`}
            >
              {label}
            </h4>
            {count > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length ? (
              items.map((item, i) => (
                <div
                  key={i}
                  className={`p-3 transition-colors duration-150 border-b ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-700"
                      : "border-gray-200 hover:bg-gray-50"
                  } cursor-pointer`}
                >
                  <p className="text-sm line-clamp-2">
                    {typeof item === "object"
                      ? `${item.from}: ${item.text}`
                      : item}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Il y a {Math.floor(Math.random() * 60)} min
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Aucun {label.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default Dropdown;
