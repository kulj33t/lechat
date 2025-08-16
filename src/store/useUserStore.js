import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "./useChatStore";

export const useUserStore = create((set, get) => ({
  isConnectionsLoading: false,
  userRequests: [],
  isUserRequestsLoading: false,
  groupRequestsUser: [],
  exploreGroups: [],
  exploreUsers: [],
  isGroupRequestsLoading: false,
  showSearch: false,

  reviewUserRequest: async (status, reqId) => {
    try {
      const { userRequests } = get();
      const res = await axiosInstance.post(`/user/request/review/${status}`, {
        reqId,
      });
      const filteredUserRequests = userRequests.filter(
        (req) => req._id !== reqId
      );
      set({ userRequests: filteredUserRequests });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  setShowSearch: (data) => {
    set({ showSearch: data });
  },

  removeConnections: async (userId) => {
    try {
      await axiosInstance.post("/user/request/remove", { userId });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  sendUserRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/user/request/send", { userId });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  getUserRequests: async () => {
    set({ isUserRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/user/request/fetch");
      set({ userRequests: res.data.data });
    } catch (error) {
      set({ userRequests: [] });
    } finally {
      set({ isUserRequestsLoading: false });
    }
  },

  sendGroupRequestUser: async (groupId) => {
    try {
      const res = await axiosInstance.post("/group/request/send/user", {
        groupId,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  getGroupRequestsUser: async () => {
    set({ isGroupRequestsLoading: true });
    try {
      const res = await axiosInstance.get("/group/request/getRequests/user");
      set({ groupRequestsUser: res.data.data });
    } catch (error) {
      set({ groupRequestsUser: [] });
    } finally {
      set({ isGroupRequestsLoading: false });
    }
  },

  reviewGroupRequestUser: async (status, reqId, groupId) => {
    const { groupRequestsUser } = get();
    try {
      const res = await axiosInstance.post(
        `/group/request/review/user/${status}`,
        { groupId, reqId }
      );
      const filteredGroupRequests = groupRequestsUser.filter(
        (req) => req._id !== reqId
      );
      set({ groupRequestsUser: filteredGroupRequests });
      toast.success(`Request ${status} successfully`);
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message);
    }
  },

  fetchExploreGroups: async () => {
    try {
      const res = await axiosInstance.get("/group/exploreGroups");
      set({ exploreGroups: res?.data?.data });
    } catch (error) {
      set({ exploreGroups: [] });
    }
  },

  setExploreUsers: (data) => {
    set({ exploreUsers: data });
  },

  fetchExploreUsers: async () => {
    try {
      const res = await axiosInstance.get("/user/request/exploreUsers");
      set({ exploreUsers: res.data.data });
    } catch (error) {
      set({ exploreUsers: [] });
    }
  },

  subscribeToUserRequests: () => {
    const { socket } = useAuthStore.getState();

    socket.on("newUserRequest", (data) => {
      const { userRequests } = get();
      set({ userRequests: [...userRequests, data] });
    });

    socket.on("newConnection", (data) => {
      const { users, setUsers } = useChatStore.getState();
      const userExists = users.some((user) => user.id === data.id);
      if (!userExists) {
        setUsers([...users, data]);
      }
    });

    socket.on("removedConnection", (userId) => {
      const { users, setUsers, setSelectedUser } = useChatStore.getState();
      const newConnections = users.filter((user) => user._id !== userId);
      setUsers(newConnections);
      setSelectedUser(null);
    });

    socket.on("newGroupRequest", (newRequest) => {
      const { groupRequestsUser } = get();
      set({ groupRequestsUser: [...groupRequestsUser, newRequest] });
    });
  },

  unsubscribeToUserRequests: () => {
    const { socket } = useAuthStore.getState();
    socket.off("newUserRequest");
    socket.off("newConnection");
    socket.off("removedConnection");
    socket.off("newGroupRequest");
  },

  subscribeToGroupRequests: () => {},

  unsubscribeToGroupRequests: () => {},

  searchUser: async (username) => {
    try {
      const user = await axiosInstance.get(`/user/request/search/${username}`);
      return user;
    } catch {}
  },
}));
