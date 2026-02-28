import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { 
  IoChevronBackOutline, 
  IoFilterOutline, 
  IoStatsChartOutline, 
  IoPeopleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoBookOutline
} from "react-icons/io5";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b", "#7c3aed"];

export default function AdminATKTAnalytics() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState({ course: true, semester: false, subject: false });
  const [selectedFilter, setSelectedFilter] = useState({ type: "", value: "" });

  useEffect(() => {
    setIsClient(true);
    const loadData = async () => {
      const snap = await getDocs(collection(db, "atktApplications"));
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    loadData();
  }, []);

  /* ================= ANALYTICS LOGIC ================= */
  const courseStats = useMemo(() => {
    const map = {};
    applications.forEach((a) => { map[a.stream] = (map[a.stream] || 0) + 1; });
    return map;
  }, [applications]);

  const semesterStats = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      const key = `${a.stream} ${a.semester}`;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [applications]);

  const subjectStats = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      a.subjects?.forEach((s) => {
        const key = s.name;
        map[key] = (map[key] || 0) + 1;
      });
    });
    return map;
  }, [applications]);

  const filteredStudents = useMemo(() => {
    if (!selectedFilter.type) return [];
    return applications.filter((a) => {
      if (selectedFilter.type === "course") return a.stream === selectedFilter.value;
      if (selectedFilter.type === "semester") return `${a.stream} ${a.semester}` === selectedFilter.value;
      if (selectedFilter.type === "subject") return a.subjects?.some((s) => s.name === selectedFilter.value);
      return false;
    });
  }, [applications, selectedFilter]);

  /* ================= AUTO-SHRINK LOGIC ================= */
  const handleFilterSelection = (type, value) => {
    setSelectedFilter({ type, value });
    setTimeout(() => {
      setOpen(prev => ({ ...prev, [type]: false }));
    }, 1500);
  };

  const DropdownBox = ({ title, data, type }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 overflow-hidden">
      <div
        className="cursor-pointer p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        onClick={() => setOpen({ ...open, [type]: !open[type] })}
      >
        <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-widest">
          <IoFilterOutline className="text-blue-500" /> {title}
        </span>
        <span className="text-slate-400">{open[type] ? <IoChevronUpOutline /> : <IoChevronDownOutline />}</span>
      </div>
      {open[type] && (
        <div className="max-h-48 overflow-y-auto border-t dark:border-slate-800 p-2 space-y-1">
          {Object.entries(data).map(([key, count]) => (
            <div
              key={key}
              onClick={() => handleFilterSelection(type, key)}
              className={`flex justify-between items-center p-3 cursor-pointer rounded-xl transition-all ${
                selectedFilter.value === key ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              <span className="text-xs font-semibold">{key}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedFilter.value === key ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:scale-110 transition-all">
              <IoChevronBackOutline size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">ATKT Analytics</h1>
          </div>
        </header>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DropdownBox title="Course-wise" data={courseStats} type="course" />
          <DropdownBox title="Semester-wise" data={semesterStats} type="semester" />
          <DropdownBox title="Subject-wise" data={subjectStats} type="subject" />
        </div>

        {/* DATA SECTION (TABLE RE-ORDERED TO TOP) */}
        {selectedFilter.value && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="lg:col-span-1 bg-blue-600 dark:bg-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-center">
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Selected Segment</p>
              <h4 className="text-lg font-bold truncate mt-1">{selectedFilter.value}</h4>
              <div className="mt-6">
                <span className="text-4xl font-black">{filteredStudents.length}</span>
                <p className="text-blue-200 text-xs font-bold uppercase mt-1 tracking-widest">Students</p>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-10 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Roll No</th>
                      <th className="px-6 py-4">Seat No</th>
                      <th className="px-6 py-4">Sem</th>
                      <th className="px-6 py-4 text-center">Scheme</th>
                      <th className="px-6 py-4">KT Subjects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {filteredStudents.map((a) => (
                      <tr key={a.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{a.studentName}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">{a.rollNo}</td>
                        <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{a.seatNo}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{a.semester}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${a.scheme === 'NEP' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200'}`}>
                            {a.scheme}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {a.subjects?.map(s => s.name).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS (BOTTOM) */}
        {isClient && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Course Enrollment</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(courseStats).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Subject Impact</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(subjectStats).map(([name, value]) => ({ name, value }))} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {Object.entries(subjectStats).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}