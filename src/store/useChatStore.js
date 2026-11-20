import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import IncomingSound from "../assets/Incoming.mp3";
import { sameId } from "../lib/utils";

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

      if (!authUser?.data?._id || !Array.isArray(users)) {
        set({ unreadCount: [] });
        return;
      }

      users.forEach((user) => {
        const count = allMessages.filter(
          (message) =>
            sameId(message.senderId, user._id) &&
            sameId(message.receiverId, authUser.data._id) &&
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
      const { authUser } = useAuthStore.getState();
      set((state) => {
        const markRead = (message) =>
          sameId(message.senderId, userId) &&
          sameId(message.receiverId, authUser?.data?._id)
            ? { ...message, isRead: true }
            : message;
        return {
          allMessages: state.allMessages.map(markRead),
          messages: state.messages.map(markRead),
          unreadCount: state.unreadCount.filter(
            (count) => !sameId(count.userId, userId)
          ),
        };
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getAllMessages: async () => {
    try {
      const res = await axiosInstance.get("/messages/getAllMessages");
      get().setAllMessages(res?.data?.data || []);
    } catch {
      get().setAllMessages([]);
    }
  },

  setAllMessages: (data) => {
    set((state) => ({
      allMessages: data,
      messages: state.selectedUser
        ? data.filter(
            (message) =>
              sameId(message.senderId, state.selectedUser._id) ||
              sameId(message.receiverId, state.selectedUser._id)
          )
        : state.messages,
    }));
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
          sameId(message.senderId, userId) ||
          sameId(message.receiverId, userId)
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
    set({ messages: Array.isArray(data) ? data : [] });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const { authUser } = useAuthStore.getState();
      const isSelectedConversation = sameId(
        newMessage.senderId,
        get().selectedUser?._id
      );
      set((state) => {
        const alreadyExists = state.allMessages.some((message) =>
          sameId(message._id, newMessage._id)
        );
        const allMessages = alreadyExists
          ? state.allMessages
          : [...state.allMessages, newMessage];
        if (!isSelectedConversation) {
          if (alreadyExists) return state;
          const count = state.unreadCount.find((item) =>
            sameId(item.userId, newMessage.senderId)
          );
          return {
            allMessages,
            unreadCount: count
              ? state.unreadCount.map((item) =>
                  sameId(item.userId, newMessage.senderId)
                    ? { ...item, count: item.count + 1 }
                    : item
                )
              : [...state.unreadCount, { userId: String(newMessage.senderId), count: 1 }],
          };
        }
        return {
          allMessages,
          messages: state.messages.some((message) =>
            sameId(message._id, newMessage._id)
          )
            ? state.messages
            : [...state.messages, newMessage],
        };
      });

      if (isSelectedConversation && !sameId(newMessage.senderId, authUser?.data?._id)) {
        socket.emit("updateLastMessageIsRead", {
          userId: authUser?.data?._id,
          messageId: newMessage._id,
        });
        const incomingSound = new Audio(IncomingSound);
        incomingSound.play().catch(() => {});
      }
    });

    socket.on("updateRead", ({ userId } = {}) => {
      const { authUser } = useAuthStore.getState();
      if (!userId || !authUser?.data?._id) return;
      set((state) => {
        const markRead = (message) =>
          sameId(message.senderId, authUser.data._id) &&
          sameId(message.receiverId, userId)
            ? { ...message, isRead: true }
            : message;
        return {
          messages: state.messages.map(markRead),
          allMessages: state.allMessages.map(markRead),
        };
      });
    });
  },

  unSubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("updateRead");
  },

  setSelectedUser: (user) => {
    set((state) => ({
      selectedUser: user,
      messages:
        user && sameId(state.selectedUser?._id, user._id) ? state.messages : [],
    }));
  },

  sendMessage: async (data) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) {
      toast.error("Select a connection before sending a message");
      return null;
    }
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        data
      );
      const sentMessage = res.data.data;
      set((state) => ({
        messages: sameId(state.selectedUser?._id, selectedUser._id)
          ? state.messages.some((message) => sameId(message._id, sentMessage._id))
            ? state.messages
            : [...state.messages, sentMessage]
          : state.messages,
        allMessages: state.allMessages.some((message) =>
          sameId(message._id, sentMessage._id)
        )
          ? state.allMessages
          : [...state.allMessages, sentMessage],
      }));
      return sentMessage;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return null;
    }
  },
}));
