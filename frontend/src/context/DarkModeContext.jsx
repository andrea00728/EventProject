import { createContext, useContext, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : getThemeColor());
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem('theme', !prev)
      return !prev
    });
  } 

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div>
        {children}
      </div>
    </DarkModeContext.Provider>
  );
}

function getThemeColor(){
  return window.matchMedia && window.matchMedia('(prefers-color-scheme : dark)').matches? false : true ;
}

export const useDarkMode = () => useContext(DarkModeContext);
