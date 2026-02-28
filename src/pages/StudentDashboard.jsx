import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  IoFileTrayFullOutline, 
  IoAddCircleOutline, 
  IoLogOutOutline, 
  IoSchoolOutline,
  IoTimeOutline,
  IoCheckmarkDoneOutline
} from "react-icons/io5";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/login"); return; }
      try {
        const q = query(
          collection(db, "atktApplications"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <ThemeToggle />

      <nav className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <IoSchoolOutline size={20} />
            </div>
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
              ATKT <span className="text-blue-600">Portal</span>
            </span>
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold p-2 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <IoLogOutOutline size={22} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] shadow-sm border dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl group-hover:bg-blue-600/10 transition-all duration-700"></div>
          
          <div className="text-center lg:text-left relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              Submit Your <br /> 
              <span className="text-blue-600">ATKT Forms</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-md font-medium">
              Easily manage your repeat exam applications. Select your subjects and generate your official PDF instantly.
            </p>
          </div>
          
          <Link 
            to="/student/details" 
            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 py-5 px-10 text-xl font-black rounded-3xl transition-all shadow-xl shadow-blue-200 dark:shadow-none hover:scale-[1.02] active:scale-95 relative z-10"
          >
            <IoAddCircleOutline size={28} />
            New Application
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border dark:border-slate-800 overflow-hidden transition-all hover:shadow-md">
          <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                <IoFileTrayFullOutline size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Application History</h2>
            </div>
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {applications.length} Records
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Fetching your data...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <IoTimeOutline size={48} className="text-slate-200 dark:text-slate-800" />
                <p className="text-slate-400 dark:text-slate-600 font-bold uppercase text-xs tracking-widest">No applications submitted yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase text-slate-500 dark:text-slate-400 font-black tracking-[0.2em] border-b dark:border-slate-700">
                    <th className="px-8 py-5">Process Status</th>
                    <th className="px-8 py-5">Academic Info</th>
                    <th className="px-8 py-5">Exam Details</th>
                    <th className="px-8 py-5 hidden md:table-cell">Subjects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors group">
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${app.status === 'submitted' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'}`}>
                          {app.status === 'submitted' ? <IoTimeOutline size={12}/> : <IoCheckmarkDoneOutline size={12}/>}
                          {app.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-slate-900 dark:text-slate-200 font-black text-sm uppercase">{app.stream}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 tracking-tight">{app.semester} • {app.scheme}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seat Number</div>
                        <div className="font-mono font-black text-blue-600 dark:text-blue-400">{app.seatNo}</div>
                      </td>
                      <td className="px-8 py-6 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {app.subjects?.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                              {s.name}
                            </span>
                          ))}
                          {app.subjects?.length > 2 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-md">
                              +{app.subjects.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}