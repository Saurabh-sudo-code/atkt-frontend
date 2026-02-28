import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { 
  IoAddCircleOutline, 
  IoSaveOutline, 
  IoTrashOutline, 
  IoSchoolOutline, 
  IoBookOutline,
  IoChevronBackOutline 
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function AdminMaster() {
  const [stream, setStream] = useState("");
  const [semester, setSemester] = useState("");
  const [scheme, setScheme] = useState("NEP");
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  /* ================= LOGIC (UNCHANGED) ================= */
  const addSubject = () => {
    setSubjects([
      ...subjects,
      { name: "", internal: false, theory: false, practical: false }
    ]);
  };

  const updateSubject = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const removeSubject = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  const saveMasterForm = async () => {
    if (!stream || !semester || subjects.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await addDoc(collection(db, "masterForms"), {
        stream,
        semester,
        scheme,
        subjects,
        createdAt: serverTimestamp(),
      });

      toast.success("Master form saved successfully");
      setStream("");
      setSemester("");
      setScheme("NEP");
      setSubjects([]);
    } catch (err) {
      toast.error("Failed to save master form");
    }
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">ATKT Form Setup</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Create master structures for specific streams and semesters</p>
          </div>
        </div>

        {/* MAIN CONFIG CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-800 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400">
            <IoSchoolOutline size={24} />
            <h2 className="text-lg font-bold">Course Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Stream</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
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

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Semester</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={`SEM ${num}`}>SEM {num}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Scheme</label>
              <select
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
              >
                <option value="NEP">NEP (National Education Policy)</option>
                <option value="NON-NEP">NON-NEP (Traditional)</option>
              </select>
            </div>
          </div>

          {/* SUBJECTS SECTION */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <IoBookOutline size={20} />
                <h2 className="font-bold">Subject List</h2>
              </div>
              <button
                onClick={addSubject}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                <IoAddCircleOutline size={18} /> Add Subject
              </button>
            </div>

            {subjects.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-sm text-slate-400 italic">No subjects added yet. Click the button above to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjects.map((sub, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group animate-in slide-in-from-left-2 duration-300"
                  >
                    <div className="md:col-span-6">
                      <input
                        type="text"
                        placeholder="Enter Subject Name"
                        className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                        value={sub.name}
                        onChange={(e) => updateSubject(index, "name", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-around">
                      {["internal", "theory", "practical"].map((field) => (
                        <label key={field} className="flex items-center gap-2 cursor-pointer group/check">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={sub[field]}
                            onChange={(e) => updateSubject(index, field, e.target.checked)}
                          />
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 group-hover/check:text-blue-500 transition-colors">
                            {field}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="md:col-span-1 text-right">
                      <button 
                        onClick={() => removeSubject(index)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={saveMasterForm}
            className="mt-10 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-[0.98]"
          >
            <IoSaveOutline size={20} /> Save Master Configuration
          </button>
        </div>
      </div>
    </div>
  );
}