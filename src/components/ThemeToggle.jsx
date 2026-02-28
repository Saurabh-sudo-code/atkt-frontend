// Reusable Glass Toggle Component
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";

const ThemeToggle = () => {
  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full z-50 transition-all 
                 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 
                 dark:border-white/10 shadow-lg hover:scale-110 active:scale-95"
    >
      <div className="text-slate-800 dark:text-yellow-400">
        <IoMoonOutline className="hidden dark:block" size={24} />
        <IoSunnyOutline className="block dark:hidden" size={24} />
      </div>
    </button>
  );
};
export default ThemeToggle;