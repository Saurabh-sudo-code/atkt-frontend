import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  IoLayersOutline, 
  IoLibraryOutline, 
  IoCalendarOutline, 
  IoArrowForwardOutline,
  IoChevronBackOutline 
} from "react-icons/io5";
import ThemeToggle from "../components/ThemeToggle";

export default function Step1Select() {
  const navigate = useNavigate();

  const [stream, setStream] = useState("");
  const [semester, setSemester] = useState("");
  const [nep, setNep] = useState("NEP");

  const handleNext = () => {
    if (!stream || !semester) {
      toast.error("Please select stream and semester");
      return;
    }

    navigate("/student/form", {
      state: { stream, semester, nep }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <ThemeToggle />

      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <IoChevronBackOutline size={18} />
          Go Back
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border dark:border-slate-800 p-8 sm:p-10">
          <header className="mb-8 text-center">
            <div className="inline-flex p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
              <IoLibraryOutline size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              Academic Selection
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Step 2: Select your course and semester
            </p>
          </header>

          <div className="space-y-6">
            {/* STREAM SELECT */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <IoLibraryOutline size={14} className="text-blue-500" />
                Stream / Course
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                value={stream}
                onChange={(e) => setStream(e.target.value)}
              >
                <option value="">Select Stream</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="BMS">BMS</option>
                <option value="BAF">BAF</option>
              </select>
            </div>

            {/* SEMESTER SELECT */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <IoCalendarOutline size={14} className="text-indigo-500" />
                Current Semester
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                <option>SEM 1</option>
                <option>SEM 2</option>
                <option>SEM 3</option>
                <option>SEM 4</option>
                <option>SEM 5</option>
                <option>SEM 6</option>
              </select>
            </div>

            {/* SCHEME SELECT */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                <IoLayersOutline size={14} className="text-emerald-500" />
                Education Scheme
              </label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none"
                value={nep}
                onChange={(e) => setNep(e.target.value)}
              >
                <option value="NEP">NEP (New Policy)</option>
                <option value="NON-NEP">NON-NEP (Old Scheme)</option>
              </select>
            </div>

            {/* NEXT BUTTON */}
            <button
              onClick={handleNext}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-95"
            >
              Continue to Form
              <IoArrowForwardOutline size={20} />
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-tighter">
          Please ensure selection matches your hall ticket
        </p>
      </div>
    </div>
  );
}