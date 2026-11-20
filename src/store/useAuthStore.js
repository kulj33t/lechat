import { create } from "zustand";
import { axiosInstance, SOCKET_BASE_URL } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const getUserFacingError = (error, fallback) => {
  const status = error?.response?.status;
  if (!status || status === 401 || status >= 500) return fallback;
  const message = error.response.data?.message;
  if (!message || /\b(cors|origin|network|internal server|exception)\b/i.test(message)) {
    return fallback;
  }
  return message;
};


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  authCheckError: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingPassword: false,
  isUpdatingProfile: false,
  isSendingMail: false,
  onlineUsers: [],
  socket: null,
  isSocketConnecting: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true, authCheckError: null });
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 404) {
        set({ authUser: null, authCheckError: null });
        get().disconnectSocket();
      } else {
        set({
          authCheckError: "Unable to verify your session. Check your connection and try again.",
        });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await axiosInstance.post("/auth/signup", data);
      const session = await axiosInstance.get("/auth/check");
      set({ authUser: session.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to create your account right now. Please try again.")
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      await axiosInstance.post("/auth/login", data);
      const session = await axiosInstance.get("/auth/check");
      set({ authUser: session.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to log in right now. Please try again.")
      );
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to log out right now. Please try again.")
      );
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to update your profile right now. Please try again.")
      );
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updatePassword: async (data) => {
    set({ isUpdatingPassword: true });
    try {
      const res = await axiosInstance.patch("/auth/update-password", data);
      toast.success("Password updated successfully");
      set({ authUser: res.data });
      return res;
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to update your password right now. Please try again.")
      );
      return null;
    } finally {
      set({ isUpdatingPassword: false });
    }
  },

  sendVerificationMail: async (email) => {
    set({ isSendingMail: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password/mail", {
        email,
      });
      toast.success("Verification mail sent");
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to send the email right now. Please try again.")
      );
    } finally {
      set({ isSendingMail: false });
    }
  },

  verifyAndReset: async (email, token, newPass) => {
    try {
      const res = await axiosInstance.post("/auth/forgot-password/verify", {
        email,
        token,
        newPass,
      });
      toast.success("Password updated");
      return res;
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to reset your password right now. Please try again.")
      );
      return error?.response || null;
    }
  },

  updatePrivacy: async (privacy) => {
    try {
      await axiosInstance.put("/auth/updatePrivacy", { privacy});
      toast.success("Privacy updated successfully");
    } catch (error) {
      toast.error(
        getUserFacingError(error, "Unable to update your privacy setting right now. Please try again.")
      );
    }
  },

  connectSocket: async () => {
    const { authUser, socket, isSocketConnecting } = get();
    if (!authUser || socket || isSocketConnecting) return;
    set({ isSocketConnecting: true });
    try {
      const response = await axiosInstance.get("/auth/socket-token");
      if (!get().authUser) return;
      const nextSocket = io(SOCKET_BASE_URL, {
        auth: { token: response.data.token },
        withCredentials: true,
      });
      nextSocket.on("getOnlineUsers", (userIds) => {
        set({ onlineUsers: userIds });
      });
      nextSocket.on("connect_error", () => {
        set({ onlineUsers: [] });
      });
      set({ socket: nextSocket });
    } catch {
      set({ onlineUsers: [] });
    } finally {
      set({ isSocketConnecting: false });
    }
  },

  disconnectSocket: () => {
    get().socket?.disconnect();
    set({ socket: null, onlineUsers: [], isSocketConnecting: false });
  },

}));

