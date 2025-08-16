import React, { useCallback, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
  MessageSquare,
  User,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { axiosInstance } from "../lib/axios";

const useDebounce = (callback, delay) => {
  const [timeoutId, setTimeoutId] = useState(null);

  return useCallback(
    (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      const id = setTimeout(() => callback(...args), delay);
      setTimeoutId(id);
    },
    [callback, delay, timeoutId]
  );
};

const SignUpPage = () => {
  const { signup, isSigningUp } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  // Username validation states
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);

  // Email validation state (only regex)
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Password validation state
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    username: "",
  });

  // Username validation (API call debounced)
  const validateUsername = useDebounce(async (username) => {
    if (!username) {
      setIsUsernameValid(false);
      return;
    }
    try {
      setIsValidatingUsername(true);
      const res = await axiosInstance.get(`/auth/validateUserName/${username}`);
      setIsUsernameValid(res?.data?.status === "success");
    } catch {
      setIsUsernameValid(false);
    } finally {
      setIsValidatingUsername(false);
    }
  }, 1000);

  // Email validation (regex only)
  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    setIsEmailValid(emailRegex.test(email));
  };

  // Password validation (strong password regex)
  const validatePassword = (password) => {
    const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{};:,<.>]).{8,}$/.test(password);
    setIsPasswordValid(isStrong);
  };

  // Handlers for input changes
  const handleUserNameChange = (username) => {
    setFormData((prev) => ({ ...prev, username }));
    validateUsername(username);
  };

  const handleEmailChange = (email) => {
    setFormData((prev) => ({ ...prev, email }));
    validateEmail(email);
  };

  const handlePasswordChange = (password) => {
    setFormData((prev) => ({ ...prev, password }));
    validatePassword(password);
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!isEmailValid) return toast.error("Invalid email format");
    if (!formData.username) return toast.error("Username is required");
    if (!isUsernameValid) return toast.error("Username is not available or invalid");
    if (!formData.password) return toast.error("Password is required");
    if (!isPasswordValid)
      return toast.error(
        "Password must be 8+ chars and include uppercase, lowercase, number & symbol."
      );

    signup(formData);
  };

  // Check if form is valid to enable submit button
  const isFormValid =
    formData.fullName.trim() &&
    isUsernameValid &&
    isEmailValid &&
    isPasswordValid;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 mt-16">
      <div className="flex items-center justify-center flex-col p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="Your Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Username */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) => handleUserNameChange(e.target.value)}
                  />
                  {formData.username !== "" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {isValidatingUsername ? (
                        <Loader className="size-5 animate-spin text-base-content/40" />
                      ) : isUsernameValid ? (
                        <Check className="size-5 text-success" />
                      ) : (
                        <X className="size-5 text-error" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
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
                    className={`input w-full pl-10 ${
                      !isEmailValid && formData.email
                        ? "border border-error"
                        : "input-bordered"
                    }`}
                    placeholder="your@example.com"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                  />
                  {formData.email !== "" && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {isEmailValid ? (
                        <Check className="size-5 text-success" />
                      ) : (
                        <X className="size-5 text-error" />
                      )}
                    </div>
                  )}
                </div>
                {!isEmailValid && formData.email && (
                  <p className="text-xs text-error mt-1">Invalid email format</p>
                )}
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    className={`input w-full pl-10 ${
                      !isPasswordValid && formData.password
                        ? "border border-error"
                        : "input-bordered"
                    }`}
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPass((prev) => !prev)}
                  >
                    {showPass ? (
                      <Eye className="size-5 text-base-content/40" />
                    ) : (
                      <EyeOff className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
                {!isPasswordValid && formData.password && (
                  <p className="text-xs text-error mt-1">
                    Password must be 8+ chars and include uppercase, lowercase,
                    number & symbol.
                  </p>
                )}
              </div>


              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSigningUp || isValidatingUsername || !isFormValid}
              >
                {isSigningUp ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center mt-2">
              <p className="text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends & share moments with your loved ones."
      />
    </div>
  );
};

export default SignUpPage;
