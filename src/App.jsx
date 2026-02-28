// frontend/src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import Step1Select from "./pages/Step1Select";
import StudentForm from "./pages/StudentForm";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMaster from "./pages/AdminMaster";
import AdminMasterList from "./pages/AdminMasterList";
import StudentDetails from "./pages/StudentDetails";
import AdminUploadATKTForm from "./pages/AdminUploadATKTForm";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminAddStudent from "./pages/AdminAddStudent";
import ForgotPassword from "./pages/ForgotPassword";
import AdminSignatures from "./pages/AdminSignatures";

export default function App() {
  useEffect(() => {
    // Initial theme check
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/signatures" element={<AdminSignatures />} />
        
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/apply" element={<Step1Select />} />
        <Route path="/student/form" element={<StudentForm />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/master" element={<AdminMaster />} />
        <Route path="/admin/master/list" element={<AdminMasterList />} />
        <Route path="/student/details" element={<StudentDetails />} />
        <Route path="/admin/upload-atkt-form" element={<AdminUploadATKTForm />}/>
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/add-student" element={<AdminAddStudent />} />
      </Routes>
    </BrowserRouter>
  );
}