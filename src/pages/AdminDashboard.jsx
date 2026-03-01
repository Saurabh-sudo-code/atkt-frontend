import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoLayersOutline,
  IoStatsChartOutline,
  IoAddCircleOutline,
  IoSettingsOutline,
  IoCloudUploadOutline,
  IoMoonOutline,
  IoSunnyOutline,
} from "react-icons/io5";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    atktStudents: 0,
    forms: 0,
    courses: 0,
  });
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    seat: "",
    course: "",
    sem: "",
    subject: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const usersSnap = await getDocs(
        query(collection(db, "users"), where("role", "==", "student")),
      );
      const formsSnap = await getDocs(collection(db, "atktApplications"));
      const apps = formsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const coursesSnap = await getDocs(collection(db, "masterForms"));
      setApplications(apps);
      setStats({
        students: usersSnap.size,
        atktStudents: apps.length,
        forms: apps.length,
        courses: coursesSnap.size,
      });
    };
    loadData();
  }, []);

  const exportToExcel = () => {
    if (!applications.length) {
      alert("No records available to export");
      return;
    }

    let exportData = [];
    let srNo = 1;

    applications.forEach((app) => {
      app.subjects?.forEach((sub) => {
        // Internal
        if (sub.internal) {
          exportData.push({
            "Sr. No": srNo++,
            "Student Name": app.studentName,
            "Seat No": app.seatNo,
            "Roll No": app.rollNo,
            Subject: sub.name,
            "Exam Type": "Internal",
            Scheme: app.scheme || "NON-NEP",
          });
        }

        // Theory
        if (sub.theory) {
          exportData.push({
            "Sr. No": srNo++,
            "Student Name": app.studentName,
            "Seat No": app.seatNo,
            "Roll No": app.rollNo,
            Subject: sub.name,
            "Exam Type": "Theory",
            Scheme: app.scheme || "NON-NEP",
          });
        }

        // Practical
        if (sub.practical) {
          exportData.push({
            "Sr. No": srNo++,
            "Student Name": app.studentName,
            "Seat No": app.seatNo,
            "Roll No": app.rollNo,
            Subject: sub.name,
            "Exam Type": "Practical",
            Scheme: app.scheme || "NON-NEP",
          });
        }
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ATKT Records");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "ATKT_Applications.xlsx");
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      const subjectText = a.subjects?.map((s) => s.name).join(" ");
      return (
        (!filters.name ||
          a.studentName?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.seat || a.seatNo?.includes(filters.seat)) &&
        (!filters.course || a.stream === filters.course) &&
        (!filters.sem || a.semester === filters.sem) &&
        (!filters.subject ||
          subjectText?.toLowerCase().includes(filters.subject.toLowerCase()))
      );
    });
  }, [applications, filters]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Manage ATKT applications and records
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 shadow-sm transition-all hover:scale-110"
            >
              <IoMoonOutline
                className="block dark:hidden text-slate-600"
                size={20}
              />
              <IoSunnyOutline
                className="hidden dark:block text-yellow-400"
                size={20}
              />
            </button>
            <button
              onClick={() => navigate("/admin/master")}
              className="btn-primary flex-1 sm:flex-none h-12 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <IoAddCircleOutline size={22} /> Add Course
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.students}
            icon={IoPeopleOutline}
            color="bg-blue-600"
          />
          <StatCard
            title="ATKT Students"
            value={stats.atktStudents}
            icon={IoStatsChartOutline}
            color="bg-indigo-600"
          />
          <StatCard
            title="Forms Filed"
            value={stats.forms}
            icon={IoDocumentTextOutline}
            color="bg-emerald-600"
          />
          <StatCard
            title="Active Courses"
            value={stats.courses}
            icon={IoLayersOutline}
            color="bg-violet-600"
          />
        </div>

        {/* RECORDS SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              Student ATKT Records
            </h2>
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold transition"
            >
              Export All to Excel
            </button>
          </div>

          {/* FILTERS */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50/50 dark:bg-slate-800/30 border-b dark:border-slate-800">
            {["name", "seat", "course", "sem", "subject"].map((key) => (
              <input
                key={key}
                placeholder={`Filter by ${key}...`}
                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-blue-500"
                value={filters[key]}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
              />
            ))}
          </div>

          {/* CLEAN TABLE (No Whitespace Error) */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll No</th>
                  <th className="px-6 py-4">Course/Sem</th>
                  <th className="px-6 py-4 text-center">Scheme</th>
                  <th className="px-6 py-4">KT Subjects</th>
                  <th className="px-6 py-4 text-right">Seat No</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                        {a.studentName}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {a.rollNo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {a.stream}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">
                          {a.semester}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${a.scheme === "NEP" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}
                        >
                          {a.scheme || "NON-NEP"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {a.subjects?.map((s) => s.name).join(", ")}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        {a.seatNo}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-20 text-slate-400 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESTORED MANAGEMENT CARDS */}
        <div className="space-y-4 pb-10">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white px-2">
            Management Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ActionCard
              title="Manage Courses"
              desc="Add or update subjects and course structures."
              icon={IoSettingsOutline}
              onClick={() => navigate("/admin/master/list")}
            />
            <ActionCard
              title="Add Students"
              desc="Batch import students using Excel files."
              icon={IoCloudUploadOutline}
              onClick={() => navigate("/admin/add-student")}
            />
            <ActionCard
              title="View Analytics"
              desc="Detailed insights by Course, Semester & Subjects."
              icon={IoStatsChartOutline}
              onClick={() => navigate("/admin/analytics")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */
function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border dark:border-slate-800 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div className={`p-4 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {value}
        </h2>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm rounded-2xl p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon
          className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
          size={24}
        />
      </div>
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
        {title}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
