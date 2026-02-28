import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function AdminAddStudent() {
  const [students, setStudents] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState(null);

  /* ================= LOAD STUDENTS ================= */

  const loadStudents = async () => {
    const snap = await getDocs(collection(db, "students"));
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  /* ================= UPLOAD ================= */

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setProgress(10);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:5000/upload-students",
        {
          method: "POST",
          body: formData,
        }
      );

      setProgress(60);

      const result = await response.json();

      setProgress(100);

      setSummary({
        success: result.added || 0,
        skipped: result.skipped || 0,
        failed: result.failed || 0,
      });

      toast.success("Students uploaded successfully");
      loadStudents();
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async () => {
    if (!filterCourse || !filterYear) {
      toast.error("Select course & year");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete all ${filterYear} ${filterCourse} students?`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/delete-students",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course: filterCourse,
            year: filterYear,
          }),
        }
      );

      const result = await response.json();

      toast.success(`${result.deleted} students deleted`);
      loadStudents();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */

  const filteredStudents = students.filter((s) => {
    return (
      (!filterCourse || s.course === filterCourse) &&
      (!filterYear || s.year === filterYear)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ================= UPLOAD SECTION ================= */}

        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-xl font-semibold mb-4">
            Upload Students (Excel)
          </h1>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={loading}
          />

          {/* Progress Bar */}
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded h-6 overflow-hidden">
                <div
                  className="bg-blue-600 h-6 text-xs text-white flex items-center justify-center transition-all duration-300"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="mt-4 bg-gray-50 p-4 rounded text-sm border">
              <p className="text-green-600">
                ✅ Added: {summary.success}
              </p>
              <p className="text-yellow-600">
                ⚠ Skipped: {summary.skipped}
              </p>
              <p className="text-red-600">
                ❌ Failed: {summary.failed}
              </p>
            </div>
          )}
        </div>

        {/* ================= MANAGE SECTION ================= */}

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            Manage Students
          </h2>

          <div className="flex gap-4 mb-6">
            <select
              className="border p-2 rounded"
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              <option value="BAF">BAF</option>
              <option value="BMS">BMS</option>
              <option value="CS">CS</option>
              <option value="IT">IT</option>
            </select>

            <select
              className="border p-2 rounded"
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="FY">FY</option>
              <option value="SY">SY</option>
              <option value="TY">TY</option>
            </select>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Delete Batch
            </button>
          </div>

          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Course</th>
                  <th className="border p-2">Year</th>
                  <th className="border p-2">Roll</th>
                  <th className="border p-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="border p-2">{student.fullName}</td>
                    <td className="border p-2">{student.course}</td>
                    <td className="border p-2 font-semibold">
                      {student.year}
                    </td>
                    <td className="border p-2">{student.rollNo}</td>
                    <td className="border p-2">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
