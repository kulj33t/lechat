import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import {
  SignUpPage,
  LoginPage,
  ProfilePage,
  ForgotPass,
  ResetVerification,
  Requests,
  HomePage,
  Error,
} from "./pages/index";

import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";
import { useUserStore } from "./store/useUserStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, authCheckError } = useAuthStore();
  const {
    getUserRequests,
    getGroupRequestsUser,
    isUserRequestsLoading,
    isGroupRequestsLoading,
  } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) {
      getUserRequests();
      getGroupRequestsUser();
    }
  }, [authUser, getUserRequests, getGroupRequestsUser]);

  const { theme } = useThemeStore();

  if (authCheckError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">{authCheckError}</p>
        <button className="btn btn-primary" onClick={checkAuth}>
          Retry
        </button>
      </div>
    );
  }

  if (
    (isCheckingAuth && !authUser) ||
    isUserRequestsLoading ||
    isGroupRequestsLoading
  )
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/requests"
          element={authUser ? <Requests /> : <Navigate to="/login" />}
        />
        <Route
          path="/reset-password"
          element={authUser ? <Navigate to="/" /> : <ForgotPass />}
        />
        <Route
          path="/reset-password/verify"
          element={authUser ? <Navigate to="/" /> : <ResetVerification />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Error />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
