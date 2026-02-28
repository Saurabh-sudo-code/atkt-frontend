import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { 
  IoPencilOutline, 
  IoTrashOutline, 
  IoAddCircleOutline, 
  IoCloseOutline, 
  IoBookOutline,
  IoChevronBackOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function AdminMasterList() {
  const [forms, setForms] = useState([]);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const fetchForms = async () => {
    const snap = await getDocs(collection(db, "masterForms"));
    setForms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  /* ================= LOGIC (UNCHANGED) ================= */
  const deleteForm = async (id) => {
    if (!confirm("Delete this master ATKT form?")) return;
    await deleteDoc(doc(db, "masterForms", id));
    toast.success("Master form deleted");
    fetchForms();
  };

  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, "masterForms", editing.id), {
        subjects: editing.subjects
      });
      toast.success("Master form updated");
      setEditing(null);
      fetchForms();
    } catch {
      toast.error("Update failed");
    }
  };

  const addSubject = () => {
    setEditing({
      ...editing,
      subjects: [
        ...editing.subjects,
        { name: "", internal: false, theory: false, practical: false }
      ]
    });
  };

  const removeSubject = (index) => {
    const copy = [...editing.subjects];
    copy.splice(index, 1);
    setEditing({ ...editing, subjects: copy });
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/admin/dashboard")} 
              className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300"
            >
              <IoChevronBackOutline size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Master Course List</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Configure subjects and structure for ATKT forms</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/admin/master")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
          >
            <IoAddCircleOutline size={22} /> Add New Course
          </button>
        </div>

        {/* LIST TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Stream / Course</th>
                  <th className="px-6 py-4">Semester</th>
                  <th className="px-6 py-4">Scheme</th>
                  <th className="px-6 py-4 text-center">Subjects</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {forms.map(f => (
                  <tr key={f.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                          <IoBookOutline size={18} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{f.stream}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{f.semester}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border ${
                        f.scheme === "NEP" 
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800" 
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                      }`}>
                        {f.scheme}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                        {f.subjects.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(f)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                          title="Edit Subjects"
                        >
                          <IoPencilOutline size={18} />
                        </button>
                        <button
                          onClick={() => deleteForm(f.id)}
                          className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                          title="Delete Course"
                        >
                          <IoTrashOutline size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL (Glassmorphism) */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Edit Course Structure</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {editing.stream} • {editing.semester} ({editing.scheme})
                </p>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <button
                onClick={addSubject}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 dark:shadow-none"
              >
                <IoAddCircleOutline size={20} /> Add New Subject
              </button>

              <div className="space-y-3 mt-4">
                {editing.subjects.map((s, i) => (
                  <div
                    key={i}
                    className="group bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-all hover:border-blue-400"
                  >
                    <div className="md:col-span-6">
                      <input
                        className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject Name (e.g. Applied Mathematics)"
                        value={s.name}
                        onChange={(e) => {
                          const copy = [...editing.subjects];
                          copy[i].name = e.target.value;
                          setEditing({ ...editing, subjects: copy });
                        }}
                      />
                    </div>

                    <div className="md:col-span-5 flex justify-around">
                      {["internal", "theory", "practical"].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer group/check">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={s[type]}
                            onChange={(e) => {
                              const copy = [...editing.subjects];
                              copy[i][type] = e.target.checked;
                              setEditing({ ...editing, subjects: copy });
                            }}
                          />
                          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 group-hover/check:text-blue-500">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="md:col-span-1 text-right">
                      <button
                        onClick={() => removeSubject(i)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove Subject"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-6 py-2.5 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={saveEdit}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}