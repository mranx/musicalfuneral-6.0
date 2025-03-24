"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

const ThemeTogglerSwitch = () => {
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);
  const handleChange = () => {
    localStorage.theme = localStorage.theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div
      className={` cursor-pointer relative inline-flex justify-between items-center w-12 h-6 transition-colors  duration-300 rounded-full bg-[#081254] dark:bg-white `}
      onClick={handleChange}
    >
      <div
        className={`absolute flex justify-center items-center top-0.5 left-0.5 w-5 h-5   rounded-full shadow-md transform transition-transform duration-300 translate-x-0 bg-white dark:translate-x-6 dark:bg-[#081254]  `}
      >
        <Sun size={16} className="inline-block dark:hidden" color="#081254" />
        <Moon size={16} className="hidden dark:inline-block" color="#fff" />
      </div>
    </div>
  );
};

export default ThemeTogglerSwitch;
