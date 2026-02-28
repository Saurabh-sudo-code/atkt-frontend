import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  IoCloudUploadOutline, 
  IoTrashOutline, 
  IoCheckmarkCircleOutline, 
  IoAlertCircleOutline, 
  IoCloseCircleOutline,
  IoChevronBackOutline,
  IoPeopleOutline,
  IoMailOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// Centralizing the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:10000";

export default function AdminAddStudent() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const eventSourceRef = useRef(null);
  const navigate = useNavigate();

  /* ================= LOAD STUDENTS ================= */
  const loadStudents = async () => {
    try {
      const snap = await getDocs(collection(db, "students"));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStudents(data);
    } catch (err) {
      toast.error("Failed to load student list");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  /* ================= FILE UPLOAD (SSE VERSION) ================= */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(0);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 🔥 FIXED: Using Dynamic API URL
      const response = await fetch(`${API_URL}/upload-students`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const { uploadId } = await response.json();

      // 🔥 FIXED: SSE Connection using Dynamic API URL
      const eventSource = new EventSource(
        `${API_URL}/upload-progress/${uploadId}`
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data.progress);

        if (data.completed) {
          setSummary({
            success: data.added,
            skipped: data.skipped,
            failed: data.failed,
          });

          setLoading(false);
          eventSource.close();
          loadStudents();
          toast.success("Batch upload completed successfully!");
        }
      };

      eventSource.onerror = () => {
        toast.error("Upload connection lost");
        setLoading(false);
        eventSource.close();
      };

    } catch (err) {
      toast.error(err.message || "Upload failed");
      setLoading(false);
    }
  };

  const handleCancelUpload = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setLoading(false);
    setProgress(0);
    toast("Upload Cancelled", { icon: "⚠️" });
  };

  /* ================= DELETE BATCH ================= */
  const handleDelete = async () => {
    if (!filterCourse || !filterYear) {
      toast.error("Select course & year to delete a batch");
      return;
    }

    if (!confirm(`Are you sure you want to delete all students for ${filterYear} ${filterCourse}?`)) return;

    try {
      // 🔥 FIXED: Using Dynamic API URL
      const res = await fetch(`${API_URL}/delete-students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: filterCourse,
          year: filterYear,
        }),
      });

      const result = await res.json();
      toast.success(`${result.deleted} students deleted`);
      loadStudents();
    } catch (err) {
      toast.error("Delete operation failed");
    }
  };

  /* ================= FILTER & ROLL NO SORTING ================= */
  const filtered = students
    .filter((s) => {
      return (
        (!filterCourse || s.course === filterCourse) &&
        (!filterYear || s.year === filterYear)
      );
    })
    .sort((a, b) => {
      const rollA = parseInt(a.rollNo) || 0;
      const rollB = parseInt(b.rollNo) || 0;
      return rollA - rollB;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Student Enrollment</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide">Manage bulk uploads and numerical records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* UPLOAD SECTION */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border dark:border-slate-800 h-fit">
              <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                <IoCloudUploadOutline size={24} />
                <h2 className="text-lg font-bold">Import Batch</h2>
              </div>

              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Required Columns</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  FullName, CourseName, Gender, RollNumber, MobileNumber, EmailId
                </p>
              </div>

              <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <IoCloudUploadOutline className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase">Click to upload Excel</p>
                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} disabled={loading} />
              </label>

              {loading && (
                <div className="mt-6 space-y-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden border dark:border-slate-700">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-500" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <button onClick={handleCancelUpload} className="w-full py-2 text-[10px] font-black uppercase text-red-500 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                    Cancel Upload
                  </button>
                </div>
              )}

              {summary && (
                <div className="mt-6 space-y-3 animate-in fade-in duration-500">
                  <SummaryItem icon={<IoCheckmarkCircleOutline className="text-emerald-500" />} label="Added" count={summary.success} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />
                  <SummaryItem icon={<IoAlertCircleOutline className="text-amber-500" />} label="Skipped" count={summary.skipped} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-900/20" />
                  <SummaryItem icon={<IoCloseCircleOutline className="text-red-500" />} label="Failed" count={summary.failed} color="text-red-600" bg="bg-red-50 dark:bg-red-900/20" />
                </div>
              )}
            </div>
          </div>

          {/* MANAGEMENT SECTION */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border dark:border-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b dark:border-slate-800">
              <div className="flex items-center gap-2">
                <IoPeopleOutline size={24} className="text-indigo-500" />
                <h2 className="text-lg font-bold dark:text-white">Batch Management</h2>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFilterCourse(e.target.value)}
                >
                  <option value="">Course</option>
                  {["BAF", "BMS", "CS", "IT"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFilterYear(e.target.value)}
                >
                  <option value="">Year</option>
                  {["FY", "SY", "TY"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={handleDelete} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                  <IoTrashOutline size={20} />
                </button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-2xl border dark:border-slate-800">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 border-b dark:border-slate-700">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {filtered.length > 0 ? filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{s.rollNo}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{s.fullName}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <IoMailOutline className="text-slate-300 dark:text-slate-600" />
                          {s.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-black uppercase">{s.course}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-500">{s.year}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No students found matching your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon, label, count, color, bg }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border border-transparent ${bg}`}>
      {icon}
      <div>
        <p className={`text-[10px] font-black uppercase ${color}`}>{label}</p>
        <p className="text-sm font-bold dark:text-white">{count}</p>
      </div>
    </div>
  );
}