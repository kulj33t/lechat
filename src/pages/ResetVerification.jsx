import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Loader, Lock, MessageSquare, X } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ResetVerification = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const { verifyAndReset } = useAuthStore();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showResendMail, setShowResendMail] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const email = queryParams.get("email");
    const token = queryParams.get("token");
    setEmail(email);
    setToken(token);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirmNewPass) {
      toast.error("Passwords do not match.");
      return;
    }
    const decodedEmail = decodeURIComponent(email);
    const decodedToken = decodeURIComponent(token);
    setIsVerifying(true);
    const response = await verifyAndReset(email, token, newPass);
    console.log(response);
    setIsVerifying(false);
    if (response?.status === 200) {
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setShowResendMail(true);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 space-y-6">
      <div className="flex items-center justify-center flex-col p-6 sm:p-12">
        {showResendMail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="relative bg-base-100 p-8 rounded-lg shadow-lg w-80 max-w-sm">
              <button
                onClick={() => setShowResendMail(false)}
                className="absolute top-2 right-2"
              >
                <X className="size-6 text-primary" />
              </button>
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Resend Verification Email
                </h2>
                <p className="text-base-content/90 mb-4">
                  The verification link may have expired or isn't working. Click
                  below to resend the link.
                </p>
                <Link
                  to="/reset-password"
                  className="btn btn-primary w-full mb-4"
                >
                  Resend Verification Link
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
              <p className="text-base-content/60">
                Set a password that is easy for you to remember
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-2 space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showNewPass ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="********"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPass(!showNewPass)}
                  >
                    {showNewPass ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Confirm New Password
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="********"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                  >
                    {showConfirmPass ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </form>

            <div className="text-center mt-2">
              <p className="text-base-content/60">
                Back to{" "}
                <Link to="/login" className="link link-primary">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Remember Your New Password"
        subtitle="Please create a new password that you can easily remember for future access."
      />
    </div>
  );
};

export default ResetVerification;
