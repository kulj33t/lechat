import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const ForgotPass = () => {
  const { sendVerificationMail, isSendingMail } = useAuthStore();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Invalid email format");
    sendVerificationMail(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">Forgot Password</h1>
            <p className="text-base-content/60">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSendingMail}
            >
              {isSendingMail ? (
                <>
                  <Loader className="size-5 animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Verification Link"
              )}
            </button>
          </form>

          <div className="text-center mt-2">
            <p className="text-base-content/60">
              Remember your password?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
