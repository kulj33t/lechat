import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import IncomingSound from "../assets/Incoming.mp3";
import toast from "react-hot-toast";
import { idOf, sameId } from "../lib/utils";

export const useGroupChatStore = create((set, get) => ({
  groups: [],
  allGroupMessages: [],
  groupMessages: [],
  unreadGroupCount: [],
  selectedGroup: null,
  isGroupsLoading: false,
  isGroupMessagesLoading: false,
  showInfo: false,

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/group/findMyGroups");
      set({ groups: res.data.data });
    } catch {
      set({ groups: [] });
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getAllGroupMessages: async () => {
    try {
      const res = await axiosInstance.get("/group/messages/getAllMessages");
      get().setAllGroupMessages(res?.data?.data || []);
    } catch {
      get().setAllGroupMessages([]);
    }
  },

  setAllGroupMessages: (data) => {
    set((state) => ({
      allGroupMessages: data,
      groupMessages: state.selectedGroup
        ? data.filter((message) => sameId(message.groupId, state.selectedGroup._id))
        : state.groupMessages,
    }));
  },

  updateGroupReadCount: async (groupId) => {
    try {
      await axiosInstance.put("/group/messages/updateGroupUnread", { groupId });
      const { authUser } = useAuthStore.getState();
      set((state) => {
        const markRead = (message) => {
          if (
            !sameId(message.groupId, groupId) ||
            sameId(message.senderId, authUser?.data?._id)
          ) {
            return message;
          }
          const readBy = Array.isArray(message.isRead) ? message.isRead : [];
          return {
            ...message,
            isRead: readBy.some((userId) => sameId(userId, authUser?.data?._id))
              ? readBy
              : [...readBy, authUser?.data?._id],
          };
        };
        return {
          allGroupMessages: state.allGroupMessages.map(markRead),
          groupMessages: state.groupMessages.map(markRead),
          unreadGroupCount: state.unreadGroupCount.filter(
            (count) => !sameId(count.groupId, groupId)
          ),
        };
      });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },

  getUnreadGroupCount: async (groups) => {
    try {
      const unreadCounts = [];
      if (!Array.isArray(groups) || groups.length === 0) {
        set({ unreadGroupCount: [] });
        return;
      }
      const { allGroupMessages } = get();
      const { authUser } = useAuthStore.getState();
      if (!authUser?.data?._id) {
        set({ unreadGroupCount: [] });
        return;
      }

      groups.forEach((group) => {
        const count = allGroupMessages.filter(
          (message) =>
            sameId(message.groupId, group._id) &&
            !sameId(message.senderId, authUser.data._id) &&
            !message.isRead?.some((userId) => sameId(userId, authUser.data._id))
        ).length;

        if (count > 0) {
          unreadCounts.push({ groupId: group._id, count });
        }
      });

      set({ unreadGroupCount: unreadCounts });
    } catch {
      set({ unreadGroupCount: [] });
    }
  },

  setUnreadGroupCount: (data) => set({ unreadGroupCount: data }),

  setGroupMessages: (data) =>
    set({ groupMessages: Array.isArray(data) ? data : [] }),

  setSelectedGroup: (group) =>
    set((state) => {
      const sameGroup = group && sameId(state.selectedGroup?._id, group._id);
      return {
        selectedGroup: group,
        groupMessages: sameGroup ? state.groupMessages : [],
        showInfo: sameGroup ? state.showInfo : false,
      };
    }),

  setShowInfo: (data) => set({ showInfo: data }),

  setGroups: (data) => set({ groups: Array.isArray(data) ? data : [] }),

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const { allGroupMessages } = get();
      const messages = allGroupMessages.filter((message) =>
        sameId(message.groupId, groupId)
      );
      set({ groupMessages: messages });
    } catch {
      set({ groupMessages: [] });
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (data) => {
    const { selectedGroup } = get();
    if (!selectedGroup?._id) {
      toast.error("Select a group before sending a message");
      return null;
    }
    try {
      const res = await axiosInstance.post(
        `/group/messages/send/${selectedGroup._id}`,
        data
      );

      const newMessage = res.data.data;
      set((state) => ({
        groupMessages: sameId(state.selectedGroup?._id, selectedGroup._id)
          ? state.groupMessages.some((message) => sameId(message._id, newMessage._id))
            ? state.groupMessages
            : [...state.groupMessages, newMessage]
          : state.groupMessages,
        allGroupMessages: state.allGroupMessages.some((message) =>
          sameId(message._id, newMessage._id)
        )
          ? state.allGroupMessages
          : [...state.allGroupMessages, newMessage],
      }));
      return newMessage;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return null;
    }
  },

  subscribeToGroupMessages: () => {
    const { authUser } = useAuthStore.getState();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newGroupMessage", (newGroupMessage) => {
      const messageGroupId = idOf(newGroupMessage.groupId);
      const isSelectedGroup = sameId(get().selectedGroup?._id, messageGroupId);
      const isOwnMessage = sameId(newGroupMessage.senderId, authUser?.data?._id);

      set((state) => {
        const alreadyExists = state.allGroupMessages.some((message) =>
          sameId(message._id, newGroupMessage._id)
        );
        const allGroupMessages = alreadyExists
          ? state.allGroupMessages
          : [...state.allGroupMessages, newGroupMessage];

        if (isSelectedGroup) {
          return {
            allGroupMessages,
            groupMessages: state.groupMessages.some((message) =>
              sameId(message._id, newGroupMessage._id)
            )
              ? state.groupMessages
              : [...state.groupMessages, newGroupMessage],
          };
        }
        if (alreadyExists) return state;
        if (isOwnMessage) return { allGroupMessages };

        const existingCount = state.unreadGroupCount.find((count) =>
          sameId(count.groupId, messageGroupId)
        );
        return {
          allGroupMessages,
          unreadGroupCount: existingCount
            ? state.unreadGroupCount.map((count) =>
                sameId(count.groupId, messageGroupId)
                  ? { ...count, count: count.count + 1 }
                  : count
              )
            : [...state.unreadGroupCount, { groupId: messageGroupId, count: 1 }],
        };
      });

      if (isSelectedGroup) {
        if (!isOwnMessage) {
          socket.emit("updateLastGroupMessageIsRead", {
            userId: authUser.data._id,
            messageId: newGroupMessage._id,
          });
        }
        if (!isOwnMessage) {
          const incomingSound = new Audio(IncomingSound);
          incomingSound.play().catch(() => {});
        }
      }
    });

    socket.on("removedGroup", (groupId) => {
      set((state) => ({
        groups: state.groups.filter((group) => !sameId(group._id, groupId)),
        allGroupMessages: state.allGroupMessages.filter(
          (message) => !sameId(message.groupId, groupId)
        ),
        unreadGroupCount: state.unreadGroupCount.filter(
          (count) => !sameId(count.groupId, groupId)
        ),
        selectedGroup: sameId(state.selectedGroup?._id, groupId)
          ? null
          : state.selectedGroup,
        groupMessages: sameId(state.selectedGroup?._id, groupId)
          ? []
          : state.groupMessages,
        showInfo: sameId(state.selectedGroup?._id, groupId)
          ? false
          : state.showInfo,
      }));
    });

    socket.on("newGroup", (group) => {
      set((state) =>
        state.groups.some((item) => sameId(item._id, group._id))
          ? state
          : { groups: [...state.groups, group] }
      );
    });

    socket.on("newMember", ({ groupId, user }) => {
      set((state) => ({
        selectedGroup: sameId(state.selectedGroup?._id, groupId)
          ? {
              ...state.selectedGroup,
              members: (state.selectedGroup.members || []).some((member) =>
                sameId(member._id, user._id)
              )
                ? state.selectedGroup.members
                : [...(state.selectedGroup.members || []), user],
            }
          : state.selectedGroup,
        groups: state.groups.map((group) =>
          sameId(group._id, groupId)
            ? {
                ...group,
                members: (group.members || []).some((member) => sameId(member._id, user._id))
                  ? group.members
                  : [...(group.members || []), user],
              }
            : group
        ),
      }));
    });

    socket.on("updatedMembers", ({ groupId, userId }) => {
      set((state) => ({
        selectedGroup: sameId(state.selectedGroup?._id, groupId)
          ? {
              ...state.selectedGroup,
              members: (state.selectedGroup.members || []).filter(
                (member) => !sameId(member._id, userId)
              ),
            }
          : state.selectedGroup,
        groups: state.groups.map((group) =>
          sameId(group._id, groupId)
            ? {
                ...group,
                members: (group.members || []).filter(
                  (member) => !sameId(member._id, userId)
                ),
              }
            : group
        ),
      }));
    });

    socket.on("updatedGroupData", ({ groupId, group }) => {
      set((state) => ({
        selectedGroup: sameId(state.selectedGroup?._id, groupId)
          ? { ...state.selectedGroup, ...group }
          : state.selectedGroup,
        groups: state.groups.map((item) =>
          sameId(item._id, groupId) ? { ...item, ...group } : item
        ),
      }));
    });
  },

  unSubscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newGroupMessage");
    socket.off("removedGroup");
    socket.off("newGroup");
    socket.off("newMember");
    socket.off("updatedMembers");
    socket.off("updatedGroupData");
  },
}));
