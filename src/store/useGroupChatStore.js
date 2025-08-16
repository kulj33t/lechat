import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import IncomingSound from "../assets/Incoming.mp3";
import toast from "react-hot-toast";

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
      set({ allGroupMessages: res?.data?.data || [] });
    } catch {
      set({ allGroupMessages: [] });
    }
  },

  setAllGroupMessages: (data) => {
    set({ allGroupMessages: data });
  },

  updateGroupReadCount: async (groupId) => {
    try {
      await axiosInstance.put("/group/messages/updateGroupUnread", { groupId });
    } catch (error) {
      console.log(error);
    }
  },

  getUnreadGroupCount: async (groups) => {
    try {
      const unreadCounts = [];
      if (groups.length === 0) return;
      const { allGroupMessages } = get();
      const { authUser } = useAuthStore.getState();

      groups.forEach((group) => {
        const count = allGroupMessages.filter(
          (message) =>
            message.groupId === group._id &&
            message.senderId._id !== authUser.data._id &&
            !message.isRead.includes(authUser.data._id)
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

  setGroupMessages: (data) => set({ groupMessages: data }),

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  setShowInfo: (data) => set({ showInfo: data }),

  setGroups: (data) => set({ groups: data }),

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const { allGroupMessages } = get();
      const messages = allGroupMessages.filter(
        (message) => message.groupId === groupId
      );
      set({ groupMessages: messages });
    } catch {
      set({ groupMessages: [] });
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (data) => {
    try {
      const { selectedGroup, groupMessages, allGroupMessages } = get();
      const res = await axiosInstance.post(
        `/group/messages/send/${selectedGroup._id}`,
        data
      );

      const newMessage = res.data.data;
      set({
        groupMessages: groupMessages.some((msg) => msg._id === newMessage._id)
          ? groupMessages
          : [...groupMessages, newMessage],
        allGroupMessages: allGroupMessages.some(
          (msg) => msg._id === newMessage._id
        )
          ? allGroupMessages
          : [...allGroupMessages, newMessage],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToGroupMessages: () => {
    const { authUser } = useAuthStore.getState();
    const socket = useAuthStore.getState().socket;

    socket.on("newGroupMessage", (newGroupMessage) => {
      const {
        unreadGroupCount,
        selectedGroup,
        groupMessages,
        allGroupMessages,
        setAllGroupMessages,
      } = get();

      const newAllGroupMessages = [...allGroupMessages, newGroupMessage];
      setAllGroupMessages(newAllGroupMessages);

      if (newGroupMessage.groupId !== selectedGroup?._id) {
        const existingCount = unreadGroupCount.find(
          (count) => count.groupId === newGroupMessage.groupId
        );

        if (existingCount) {
          existingCount.count += 1;
        } else {
          unreadGroupCount.push({ groupId: newGroupMessage.groupId, count: 1 });
        }

        set({ unreadGroupCount: [...unreadGroupCount] });
      } else {
        if (newGroupMessage.senderId._id !== authUser.data._id) {
          socket.emit("updateLastGroupMessageIsRead", {
            userId: authUser.data._id,
            messageId: newGroupMessage._id,
          });
        }

        set({ groupMessages: [...groupMessages, newGroupMessage] });

        if (newGroupMessage.senderId._id !== authUser.data._id) {
          const incomingSound = new Audio(IncomingSound);
          incomingSound.play();
        }
      }
    });

    socket.on("removedGroup", (groupId) => {
      const { groups } = get();
      set({
        groups: groups.filter((group) => group._id !== groupId),
        selectedGroup: null,
        showInfo: false,
      });
    });

    socket.on("newGroup", (group) => {
      const { groups } = get();
      if (!groups.some((g) => g._id === group._id)) {
        set({ groups: [...groups, group] });
      }
    });

    socket.on("newMember", ({ groupId, user }) => {
      const { groups, selectedGroup, setSelectedGroup } = get();

      if (selectedGroup) {
        const memberExists = selectedGroup.members.some(
          (member) => member._id === user._id
        );
        const updatedMembers = memberExists
          ? selectedGroup.members
          : [...selectedGroup.members, user];
        setSelectedGroup({ ...selectedGroup, members: updatedMembers });
      }

      set({
        groups: groups.map((group) =>
          group._id === groupId
            ? {
                ...group,
                members: group.members.some((member) => member._id === user._id)
                  ? group.members
                  : [...group.members, user],
              }
            : group
        ),
      });
    });

    socket.on("updatedMembers", ({ groupId, userId }) => {
      const { groups, selectedGroup, setSelectedGroup } = get();
      if (selectedGroup) {
        const updatedMembers = selectedGroup.members.filter(
          (member) => member._id !== userId
        );
        setSelectedGroup({ ...selectedGroup, members: updatedMembers });
      }
      set({
        groups: groups.map((group) =>
          group._id === groupId
            ? {
                ...group,
                members: group.members.filter(
                  (member) => member._id !== userId
                ),
              }
            : group
        ),
      });
    });

    socket.on("updatedGroupData", ({ groupId, group }) => {
      const { groups, selectedGroup, setSelectedGroup } = get();
      if (selectedGroup) {
        setSelectedGroup(group);
      }
      set({
        groups: groups.map((g) => (g._id === groupId ? { ...g, ...group } : g)),
      });
    });
  },

  unSubscribeToGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
    socket.off("removedGroup");
    socket.off("newGroup");
    socket.off("newMember");
    socket.off("updatedMembers");
    socket.off("updatedGroupData");
  },
}));
