import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const sendOtp = async () => {
    if (!email) return toast.error("Enter email");

    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("OTP sent to email");
      setStep(2);
    } else {
      toast.error(data.error);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPass || !confirmPass)
      return toast.error("Fill all fields");

    if (newPass !== confirmPass)
      return toast.error("Passwords do not match");

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        otp,
        newPassword: newPass,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Password updated successfully");
      setStep(1);
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">

        <h2 className="text-xl font-semibold mb-6 text-center">
          Forgot Password
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-2 mb-4"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={sendOtp}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border p-2 mb-3"
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-2 mb-3"
              onChange={(e) => setNewPass(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-2 mb-4"
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <button
              onClick={resetPassword}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}