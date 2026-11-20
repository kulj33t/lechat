import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "./useChatStore";
import { useGroupChatStore } from "./useGroupChatStore";
import { sameId } from "../lib/utils";

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
      const res = await axiosInstance.post(`/user/request/review/${status}`, {
        reqId,
      });
      set((state) => ({
        userRequests: state.userRequests.filter((req) => !sameId(req._id, reqId)),
      }));
      if (status === "accepted") {
        const connectedUser = res.data.data.senderId;
        const { users, setUsers } = useChatStore.getState();
        if (!users.some((user) => sameId(user._id, connectedUser._id))) {
          setUsers([...users, connectedUser]);
        }
      }
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to review request. Please try again.");
      return false;
    }
  },

  setShowSearch: (data) => {
    set({ showSearch: data });
  },

  removeConnections: async (userId) => {
    try {
      await axiosInstance.post("/user/request/remove", { userId });
      const {
        users,
        allMessages,
        unreadCount,
        setUsers,
        selectedUser,
        setSelectedUser,
        setMessages,
        setAllMessages,
        setUnreadCount,
      } = useChatStore.getState();
      setUsers(users.filter((user) => !sameId(user._id, userId)));
      if (sameId(selectedUser?._id, userId)) {
        setSelectedUser(null);
        setMessages([]);
      }
      setAllMessages(
        allMessages.filter(
          (message) =>
            !sameId(message.senderId, userId) &&
            !sameId(message.receiverId, userId)
        )
      );
      setUnreadCount(
        unreadCount.filter((count) => !sameId(count.userId, userId))
      );
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to remove connection. Please try again.");
      return false;
    }
  },

  sendUserRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/user/request/send", { userId });
      set((state) => ({
        exploreUsers: state.exploreUsers.filter(
          (user) => !sameId(user._id, userId)
        ),
      }));
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send request. Please try again.");
      return null;
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
      set((state) => ({
        exploreGroups: state.exploreGroups.filter(
          (group) => !sameId(group._id, groupId)
        ),
      }));
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send group request. Please try again.");
      return null;
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
    try {
      const res = await axiosInstance.post(
        `/group/request/review/user/${status}`,
        { groupId, reqId }
      );
      set((state) => ({
        groupRequestsUser: state.groupRequestsUser.filter(
          (req) => !sameId(req._id, reqId)
        ),
      }));
      if (status === "accepted") {
        const { groups, setGroups } = useGroupChatStore.getState();
        if (!groups.some((group) => sameId(group._id, res.data.data._id))) {
          setGroups([...groups, res.data.data]);
        }
      }
      toast.success(`Request ${status} successfully`);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to review group request. Please try again.");
      return false;
    }
  },

  fetchExploreGroups: async () => {
    try {
      const res = await axiosInstance.get("/group/exploreGroups");
      set({ exploreGroups: res?.data?.data || [] });
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
    if (!socket) return;

    socket.on("newUserRequest", (data) => {
      const { userRequests } = get();
      if (!userRequests.some((request) => sameId(request._id, data._id))) {
        set({ userRequests: [...userRequests, data] });
      }
    });

    socket.on("newConnection", (data) => {
      const { users, setUsers } = useChatStore.getState();
      const newUserId = String(data._id || data.id);
      const userExists = users.some((user) =>
        sameId(user._id || user.id, newUserId)
      );
      if (!userExists) {
        setUsers([...users, data]);
      }
    });

    socket.on("removedConnection", (userId) => {
      const {
        users,
        allMessages,
        unreadCount,
        selectedUser,
        setUsers,
        setSelectedUser,
        setMessages,
        setAllMessages,
        setUnreadCount,
      } = useChatStore.getState();
      const newConnections = users.filter(
        (user) => !sameId(user._id, userId)
      );
      setUsers(newConnections);
      setAllMessages(
        allMessages.filter(
          (message) =>
            !sameId(message.senderId, userId) &&
            !sameId(message.receiverId, userId)
        )
      );
      setUnreadCount(
        unreadCount.filter((count) => !sameId(count.userId, userId))
      );
      if (sameId(selectedUser?._id, userId)) {
        setSelectedUser(null);
        setMessages([]);
      }
    });

    socket.on("newGroupRequest", (newRequest) => {
      const { groupRequestsUser } = get();
      if (!groupRequestsUser.some((request) => sameId(request._id, newRequest._id))) {
        set({ groupRequestsUser: [...groupRequestsUser, newRequest] });
      }
    });
  },

  unsubscribeToUserRequests: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
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
    } catch (error) {
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },
}));
