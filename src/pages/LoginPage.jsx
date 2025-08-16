import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader, Lock, Mail, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";

const LoginPage = () => {
  const { login, isLoggingIn } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");

    if (!formData.password) return toast.error("Password is required");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validData = validateForm();
    if (validData === true) login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 mt-16">
      <div className="flex items-center justify-center flex-col p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Sign in</h1>
              <p className="text-base-content/60">
                Access your account and stay connected
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
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
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
                    className="input input-bordered w-full pl-10"
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? (
                      <Eye className="size-5 text-base-content/40" />
                    ) : (
                      <EyeOff className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <Link
                to="/reset-password"
                className="text-sm text-primary mt-2 block text-left hover:underline"
              >
                Forgot password?
              </Link>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader className="size-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center mt-2">
              <p className="text-base-content/60">
                Don't have an account?{" "}
                <Link to="/signup" className="link link-primary">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <AuthImagePattern
        title="Welcome back!"
        subtitle="Log in to continue exploring and sharing with your friends."
      />
    </div>
  );
};

export default LoginPage;
