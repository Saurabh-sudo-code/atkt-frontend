import { useState } from "react";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  IoChevronBackOutline, 
  IoCloudUploadOutline, 
  IoShieldCheckmarkOutline, 
  IoImageOutline,
  IoSaveOutline 
} from "react-icons/io5";

// Centralizing the API URL
const API_URL = import.meta.env.VITE_API_URL;

export default function AdminSignatures() {
  const navigate = useNavigate();
  const [hodSig, setHodSig] = useState(null);
  const [principalSig, setPrincipalSig] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes("png")) {
      toast.error("Only transparent PNG files allowed for signatures");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "hod") setHodSig(reader.result);
      else setPrincipalSig(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadSignatures = async () => {
    if (!hodSig && !principalSig) {
      toast.error("Please select at least one signature to upload");
      return;
    }

    try {
      setLoading(true);
      
      // Get the admin's token for authorization
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      // 🔥 FIXED: Using Dynamic API URL for Live Render Backend
      const res = await fetch(`${API_URL}/api/signatures/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hodSignature: hodSig,
          principalSignature: principalSig,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload signatures");

      toast.success("Signatures updated successfully");
    } catch (err) {
      console.error("Signature Upload Error:", err);
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/dashboard")} 
            className="p-2 bg-white dark:bg-slate-900 rounded-full border dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">System Signatures</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage official seals for PDF generation</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-blue-600" size={20} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">Authorization Setup</h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* HOD SECTION */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Position</span>
                  <span className="text-sm font-bold dark:text-white">Head of Department (HOD)</span>
                </div>
                
                <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all overflow-hidden">
                  {hodSig ? (
                    <img src={hodSig} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" alt="HOD Preview" />
                  ) : (
                    <div className="text-center">
                      <IoImageOutline className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={40} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload HOD PNG</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png" onChange={(e) => handleFile(e, "hod")} />
                </label>
              </div>

              {/* PRINCIPAL SECTION */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Position</span>
                  <span className="text-sm font-bold dark:text-white">College Principal</span>
                </div>

                <label className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all overflow-hidden">
                  {principalSig ? (
                    <img src={principalSig} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105" alt="Principal Preview" />
                  ) : (
                    <div className="text-center">
                      <IoImageOutline className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={40} />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload Principal PNG</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/png" onChange={(e) => handleFile(e, "principal")} />
                </label>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
              <IoShieldCheckmarkOutline className="text-amber-600 mt-1 flex-shrink-0" size={18} />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                <strong>Important:</strong> Please use high-quality <strong>transparent PNG</strong> files. These signatures will be placed on the digital ATKT forms. Ensure there is no white background around the signature for a professional look on the PDF.
              </p>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={uploadSignatures}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <IoSaveOutline size={20} />
              {loading ? "PROCESSING UPLOAD..." : "Save System Signatures"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}