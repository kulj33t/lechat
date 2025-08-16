import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import IncomingSound from "../assets/Incoming.mp3";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  allMessages: [],
  unreadCount: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  showSideBar: true,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/user/request/connections");
      set({ users: res.data.data });
    } catch {
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  setShowSideBar: (data) => {
    set({ showSideBar: data });
  },

  getUnreadCount: async (users) => {
    try {
      const unreadCounts = [];
      const { allMessages } = get();
      const { authUser } = useAuthStore.getState();

      users.forEach((user) => {
        const count = allMessages.filter(
          (message) =>
            message.senderId === user._id &&
            message.receiverId === authUser.data._id &&
            !message.isRead
        ).length;
        if (count > 0) {
          unreadCounts.push({ userId: user._id, count });
        }
      });

      set({ unreadCount: unreadCounts });
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  },

  updateReadCount: async (userId) => {
    try {
      await axiosInstance.put("/messages/updateRead", { userId });
    } catch (error) {
      console.log(error);
    }
  },

  getAllMessages: async () => {
    try {
      const res = await axiosInstance.get("/messages/getAllMessages");
      set({ allMessages: res?.data?.data || [] });
    } catch {
      set({ allMessages: [] });
    }
  },

  setAllMessages: (data) => {
    set({ allMessages: data });
  },

  setUnreadCount: (data) => {
    set({ unreadCount: data });
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    const { allMessages } = get();
    try {
      const filteredMessages = allMessages.filter(
        (message) =>
          message.senderId === userId || message.receiverId === userId
      );
      set({ messages: filteredMessages });
    } catch {
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setUsers: (data) => {
    set({ users: data });
  },

  setMessages: (data) => {
    set({ messages: data });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, unreadCount, setAllMessages, allMessages } = get();

      const newAllMessages = [...allMessages, newMessage];
      setAllMessages(newAllMessages);

      if (newMessage.senderId !== selectedUser?._id) {
        const existingCount = unreadCount.find(
          (count) => count.userId === newMessage.senderId
        );
        if (existingCount) {
          existingCount.count += 1;
        } else {
          unreadCount.push({ userId: newMessage.senderId, count: 1 });
        }

        set({ unreadCount: [...unreadCount] });
      } else {
        socket.emit("updateLastMessageIsRead", {
          userId: selectedUser._id,
          messageId: newMessage._id,
        });
        set({ messages: [...get().messages, newMessage] });
        const incomingSound = new Audio(IncomingSound);
        incomingSound.play();
      }
    });

    socket.on("updateRead", () => {
      const { messages } = get();
      const { authUser } = useAuthStore.getState();
      const updatedMessages = messages.map((message) =>
        message.senderId === authUser.data._id
          ? { ...message, isRead: true }
          : message
      );
      set({ messages: updatedMessages });
    });
  },

  unSubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("updateRead");
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  sendMessage: async (data) => {
    const { selectedUser, messages, allMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        data
      );
      set({ messages: [...messages, res.data.data] });
      set({ allMessages: [...allMessages, res.data.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },
}));
