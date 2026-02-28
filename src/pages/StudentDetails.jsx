import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";
import { 
  IoPersonOutline, 
  IoCallOutline, 
  IoHomeOutline, 
  IoArrowForwardOutline,
  IoChevronBackOutline,
  IoFingerPrintOutline
} from "react-icons/io5";
import ThemeToggle from "../components/ThemeToggle";

export default function StudentDetails() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    surname: "",
    name: "",
    fatherName: "",
    motherName: "",
    gender: "",
    rollNo: "",
    mobile: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Validation (logic unchanged)
    if (
      !form.surname || !form.name || !form.fatherName || 
      !form.motherName || !form.gender || !form.rollNo || 
      !form.mobile || !form.address
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const uid = auth.currentUser.uid;
      await setDoc(doc(db, "students", uid), {
        ...form,
        uid,
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
      }, { merge: true });

      toast.success("Details saved successfully");
      navigate("/student/apply");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save details");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <ThemeToggle />
      
      <div className="max-w-3xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Personal Information</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Step 1: Complete your student profile</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-[2rem] border dark:border-slate-800 overflow-hidden">
          <div className="p-6 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION: FULL NAME */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-widest">
                  <IoPersonOutline size={18} />
                  <span>Identity Details</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input
                      name="surname"
                      placeholder="Surname"
                      value={form.surname}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      name="name"
                      placeholder="First Name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      name="fatherName"
                      placeholder="Father's Name"
                      value={form.fatherName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <input
                      name="motherName"
                      placeholder="Mother's Name"
                      value={form.motherName}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: COLLEGE & GENDER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                    <IoFingerPrintOutline /> Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">
                    <IoFingerPrintOutline /> College Roll Number
                  </label>
                  <input
                    name="rollNo"
                    placeholder="Enter Roll No"
                    value={form.rollNo}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono font-bold"
                  />
                </div>
              </div>

              {/* SECTION: CONTACT */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs tracking-widest">
                  <IoCallOutline size={18} />
                  <span>Contact Information</span>
                </div>
                
                <input
                  name="mobile"
                  placeholder="Mobile Number (10 digits)"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                  maxLength={10}
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 px-1">
                    <IoHomeOutline size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Residential Address</span>
                  </div>
                  <textarea
                    name="address"
                    placeholder="Enter your full home address..."
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                    rows={3}
                  />
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto float-right flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98]"
                >
                  Save & Continue
                  <IoArrowForwardOutline size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}