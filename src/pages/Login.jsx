// frontend/src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { IoMailOutline, IoLockClosedOutline } from "react-icons/io5"; // Ionicons
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      let snap = await getDoc(doc(db, "users", res.user.uid));
      if (!snap.exists()) {
        snap = await getDoc(doc(db, "students", res.user.uid));
      }
      if (!snap.exists()) {
        toast.error("User profile not found");
        return;
      }
      const { role } = snap.data();
      toast.success("Login successful");
      if (role === "admin") navigate("/admin/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">College Portal</h2>
          <p className="text-slate-500 mt-2">Sign in to manage your ATKT applications</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">College Email</label>
            <div className="relative flex items-center group">
              <IoMailOutline className="absolute left-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="email"
                className="input pl-10 h-12"
                placeholder="name@college.edu"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" size="sm" className="text-sm text-blue-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center group">
              <IoLockClosedOutline className="absolute left-3 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="password"
                className="input pl-10 h-12"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button disabled={loading} className="w-full btn-primary h-12 text-lg">
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        
      </div>
    </div>
  );
}