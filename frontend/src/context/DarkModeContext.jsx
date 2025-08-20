import { createContext, useContext, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(
    sessionStorage.getItem("ACCESS_THEME") !== null 
      ? (sessionStorage.getItem("ACCESS_THEME") == "true" ? true : false )
      : getThemeColor()
  );
  const toggleDarkMode = () => {
    sessionStorage.setItem("ACCESS_THEME", darkMode === true ? false : true);
    setDarkMode((prev) => {
      return !prev;
    });
  };

  function getThemeColor() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme : dark)").matches
      ? true
      : false;
  }

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div>{children}</div>
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
