import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";
import { generateATKTPdf } from "../utils/generateATKTPdf";
import SignatureCanvas from "react-signature-canvas";
import { 
  IoCloudUploadOutline, 
  IoBrushOutline, 
  IoTrashOutline, 
  IoCheckmarkCircleOutline, 
  IoInformationCircleOutline,
  IoChevronBackOutline,
  IoDocumentTextOutline,
  IoSaveOutline
} from "react-icons/io5";
import ThemeToggle from "../components/ThemeToggle";

export default function StudentForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { stream, semester, nep } = state || {};

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const sigCanvas = useRef(null);
  const [signature, setSignature] = useState(null);
  const [systemSignature, setSystemSignature] = useState(null);

  /* ================= VALIDATION & DATA LOADING (Logic Unchanged) ================= */
  useEffect(() => {
    if (!stream || !semester || !nep) {
      toast.error("Invalid access to ATKT form");
      navigate("/student/dashboard");
    }
  }, [stream, semester, nep, navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/login"); return; }

        const studentSnap = await getDoc(doc(db, "students", user.uid));
        if (!studentSnap.exists()) {
          toast.error("Profile not found");
          navigate("/student/details");
          return;
        }
        setStudentProfile(studentSnap.data());

        const fetchSignatures = async () => {
          try {
            const res = await fetch("https://atkt-backend.onrender.com/api/signatures");
            const data = await res.json();
            setSystemSignature(data);
          } catch (e) { console.error("Signatures not loaded"); }
        };
        fetchSignatures();

        const q = query(
          collection(db, "masterForms"),
          where("stream", "==", stream),
          where("semester", "==", semester),
          where("scheme", "==", nep),
        );
        const snap = await getDocs(q);
        if (snap.empty) {
          toast.error("Form not configured by admin");
        } else {
          setSubjects(snap.docs[0].data().subjects || []);
        }
      } catch (err) {
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [stream, semester, nep, navigate]);

  /* ================= HANDLERS (Logic Unchanged) ================= */
  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignature(null);
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Please provide signature");
      return;
    }
    const base64 = sigCanvas.current.getCanvas().toDataURL("image/png");
    setSignature(base64);
    toast.success("Signature captured");
  };

  const toggleSubject = (name, type) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing) {
        return prev.map((s) => s.name === name ? { ...s, [type]: !s[type] } : s);
      }
      return [...prev, { name, internal: false, theory: false, practical: false, [type]: true }];
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) { toast.error("Photo must be under 200 KB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const COURSE_LETTER = { CS: "S", IT: "T", BAF: "F", BMS: "M" };

  const generateSeatNo = async (stream, rollNo) => {
    const admissionYear = rollNo.toString().substring(1, 3);
    const courseLetter = COURSE_LETTER[stream];
    const counterId = `${admissionYear}_${stream}`;
    const counterRef = doc(db, "seatCounters", counterId);

    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(counterRef);
      let running = 1;
      if (!snap.exists()) {
        tx.set(counterRef, { current: 2 });
      } else {
        running = snap.data().current;
        tx.update(counterRef, { current: running + 1 });
      }
      return `${admissionYear}${courseLetter}${String(running).padStart(3, "0")}`;
    });
  };

  const submitForm = async () => {
    if (!photoBase64 || selected.length === 0 || !signature) {
      toast.error("Please complete all sections (Photo, Subjects, Signature)");
      return;
    }
    setLoading(true);
    try {
      const seatNo = await generateSeatNo(stream, studentProfile.rollNo);
      const formData = {
        student: studentProfile,
        stream, semester, scheme: nep,
        subjects: selected,
        photoBase64, seatNo,
        signatureBase64: signature,
        hodSignatureBase64: systemSignature?.hodSignature || null,
        principalSignatureBase64: systemSignature?.principalSignature || null,
      };

      const pdfBlob = await generateATKTPdf(formData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ATKT_${studentProfile.rollNo}.pdf`;
      link.click();

      await addDoc(collection(db, "atktApplications"), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        studentName: `${studentProfile.surname} ${studentProfile.name}`,
        rollNo: studentProfile.rollNo,
        stream, semester, scheme: nep,
        subjects: selected,
        seatNo,
        createdAt: serverTimestamp(),
        status: "submitted",
      });

      toast.success(`Submitted Successfully! Seat No: ${seatNo}`);
      navigate("/student/dashboard");
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold animate-pulse">PREPARING YOUR FORM...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-8 transition-colors duration-300 pb-20">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <IoChevronBackOutline size={24} className="dark:text-white" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Examination Form</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded uppercase">{stream}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded uppercase">{semester}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">{nep}</span>
              </div>
            </div>
          </div>
          {studentProfile && (
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged in as</p>
              <p className="text-sm font-bold dark:text-white">{studentProfile.name} ({studentProfile.rollNo})</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: PHOTO & SIGNATURE */}
          <div className="lg:col-span-1 space-y-6">
            {/* PHOTO SECTION */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                <IoCloudUploadOutline size={20} />
                <h2 className="font-bold text-sm uppercase tracking-wider">Passport Photo</h2>
              </div>
              <div className="flex flex-col items-center">
                <label className="w-full h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <IoCloudUploadOutline size={32} className="text-slate-300 mb-2" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Upload JPEG/PNG</p>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
                <p className="text-[9px] text-slate-400 mt-3 text-center">Standard passport size, max 200KB</p>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
                <IoBrushOutline size={20} />
                <h2 className="font-bold text-sm uppercase tracking-wider">Digital Signature</h2>
              </div>
              <div className="border dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-white overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: "w-full h-32" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button onClick={clearSignature} className="py-2 text-[10px] font-black uppercase text-slate-500 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Clear
                </button>
                <button onClick={saveSignature} className="py-2 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">
                  Capture
                </button>
              </div>
              {signature && (
                <div className="mt-3 flex items-center justify-center gap-1 text-emerald-500 animate-bounce">
                  <IoCheckmarkCircleOutline size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Signature Verified</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: SUBJECT SELECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <IoDocumentTextOutline className="text-blue-600" />
                <h2 className="font-bold text-sm uppercase tracking-wider text-slate-800 dark:text-white">Failed Subject Selection</h2>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b dark:border-slate-800 flex items-start gap-3">
                <IoInformationCircleOutline className="text-amber-600 mt-0.5" size={18} />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Carefully select the components (Internal, Theory, or Practical) in which you have failed. 
                  Double-check with your marksheet before submitting.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-slate-800">
                      <th className="px-6 py-4">Subject Name</th>
                      <th className="px-4 py-4 text-center">INT</th>
                      <th className="px-4 py-4 text-center">TH</th>
                      <th className="px-4 py-4 text-center">PR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-800">
                    {subjects.map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm">{sub.name}</td>
                        {["internal", "theory", "practical"].map((t) => (
                          <td key={t} className="px-4 py-4 text-center">
                            {sub[t] ? (
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                onChange={() => toggleSubject(sub.name, t)}
                              />
                            ) : (
                              <span className="text-[9px] font-black text-slate-200 dark:text-slate-800 tracking-tighter">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FINAL ACTION */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate(-1)} 
                className="flex-1 py-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl font-black text-slate-500 uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={submitForm} 
                disabled={loading}
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-100 dark:shadow-none hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <IoSaveOutline size={20} />
                {loading ? "PROCESSING..." : "SUBMIT & DOWNLOAD PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}