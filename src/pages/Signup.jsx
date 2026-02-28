import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiShield } from "react-icons/fi";
import { IoArrowBackOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [adminCode, setAdminCode] = useState(""); // State for the secret code
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const SECRET_ADMIN_CODE = "COLLEGE_ADMIN_2026";

  const handleSignup = async (e) => {
    e.preventDefault();

    // 🔒 Security Check
    if (role === "admin" && adminCode !== SECRET_ADMIN_CODE) {
      toast.error("Invalid Admin Authorization Code");
      return;
    }

    if (!email || !password) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        email,
        role,
        createdAt: new Date(),
      });

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <ThemeToggle />
      
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border dark:border-slate-800">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Join the <span className="text-blue-600">Portal</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Create your credentials to continue</p>
          </header>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 border dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <FiMail className="text-slate-400" />
                <input
                  type="email"
                  className="w-full p-3 outline-none bg-transparent dark:text-white text-sm"
                  placeholder="student@college.edu"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Secure Password</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 border dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <FiLock className="text-slate-400" />
                <input
                  type="password"
                  className="w-full p-3 outline-none bg-transparent dark:text-white text-sm"
                  placeholder="Minimum 6 characters"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Account Type Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Account Type</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 border dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <FiUser className="text-slate-400" />
                <select
                  className="w-full p-3 outline-none bg-transparent dark:text-white text-sm appearance-none cursor-pointer"
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                >
                  <option value="student" className="dark:bg-slate-900">Student</option>
                  <option value="admin" className="dark:bg-slate-900">Administrator</option>
                </select>
              </div>
            </div>

            {/* Conditional Admin Secret Code Input */}
            {role === "admin" && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-red-500 px-1 flex items-center gap-1">
                  <FiShield /> Admin Authorization Code
                </label>
                <div className="flex items-center bg-red-50 dark:bg-red-900/10 rounded-2xl px-4 border border-red-200 dark:border-red-900/30 focus-within:ring-2 focus-within:ring-red-500 transition-all">
                  <FiLock className="text-red-400" />
                  <input
                    type="password"
                    className="w-full p-3 outline-none bg-transparent dark:text-white text-sm"
                    placeholder="Enter Secret Admin Key"
                    onChange={(e) => setAdminCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-200 dark:shadow-none disabled:opacity-60 active:scale-95"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="pt-2 text-center">
              <Link to="/login" className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center gap-1">
                <IoArrowBackOutline /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}