import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useGroupChatStore } from "./useGroupChatStore";
import { useUserStore } from "./useUserStore";
import { sameId } from "../lib/utils";

const syncGroupInStore = (group) => {
  if (!group?._id) return;
  useGroupChatStore.setState((state) => ({
    selectedGroup: sameId(state.selectedGroup?._id, group._id)
      ? group
      : state.selectedGroup,
    groups: state.groups.map((existingGroup) =>
      sameId(existingGroup._id, group._id) ? group : existingGroup
    ),
  }));
};

export const useGroupConfigStore = create((set, get) => ({
  isAddingMember: false,
  isUpdatingGroup: false,
  isRemovingMember: false,
  isExitingGroup: false,
  isDeletingGroup: false,
  isCreatingGroup: false,
  connectionsForGroup: [],
  showAddUsers: false,

  setConnectionsForGroup: (data) => set({ connectionsForGroup: data }),

  setShowAddUsers: (data) => set({ showAddUsers: data }),

  addMember: async (userId) => {
    const { connectionsForGroup } = get();
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }
    set({ isAddingMember: true });
    try {
      const res = await axiosInstance.post("/group/addMember", {
        userId,
        groupId: selectedGroup._id,
      });
      syncGroupInStore(res.data.data);
      const newList = connectionsForGroup.filter(
        (connection) => !sameId(connection._id, userId)
      );
      set({ connectionsForGroup: newList });
      toast.success("Member added successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add member");
      return false;
    } finally {
      set({ isAddingMember: false });
    }
  },

  removeMember: async (userId) => {
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }
    set({ isRemovingMember: true });
    try {
      const res = await axiosInstance.post("/group/removeMember", {
        userId,
        groupId: selectedGroup._id,
      });
      syncGroupInStore(res.data.data);
      toast.success("Member removed successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
      return false;
    } finally {
      set({ isRemovingMember: false });
    }
  },

  updateGroup: async (data) => {
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.patch(
        `/group/updateGroup/${selectedGroup._id}`,
        data
      );
      syncGroupInStore(res.data.data);
      toast.success("Group updated successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update group");
      return false;
    } finally {
      set({ isUpdatingGroup: false });
    }
  },

  deleteGroup: async () => {
    set({ isDeletingGroup: true });
    const { selectedGroup } =
      useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      set({ isDeletingGroup: false });
      return false;
    }
    const deletedGroup = selectedGroup;
    try {
      await axiosInstance.delete("/group/deleteGroup", {
        data: { groupId: selectedGroup._id },
      });
      useGroupChatStore.setState((state) => ({
        groups: state.groups.filter((group) => !sameId(group._id, deletedGroup._id)),
        selectedGroup: sameId(state.selectedGroup?._id, deletedGroup._id)
          ? null
          : state.selectedGroup,
        groupMessages: sameId(state.selectedGroup?._id, deletedGroup._id)
          ? []
          : state.groupMessages,
      }));
      const groupStore = useGroupChatStore.getState();
      groupStore.setAllGroupMessages(
        groupStore.allGroupMessages.filter(
          (message) => !sameId(message.groupId, deletedGroup._id)
        )
      );
      groupStore.setUnreadGroupCount(
        groupStore.unreadGroupCount.filter(
          (count) => !sameId(count.groupId, deletedGroup._id)
        )
      );
      toast.success("Group deleted successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete group");
      return false;
    } finally {
      set({ isDeletingGroup: false });
    }
  },

  exitGroup: async () => {
    set({ isExitingGroup: true });
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      set({ isExitingGroup: false });
      return false;
    }
    const exitedGroupId = selectedGroup._id;
    try {
      await axiosInstance.post("/group/exitGroup", {
        groupId: exitedGroupId,
      });
      useGroupChatStore.setState((state) => ({
        groups: state.groups.filter((group) => !sameId(group._id, exitedGroupId)),
        selectedGroup: sameId(state.selectedGroup?._id, exitedGroupId)
          ? null
          : state.selectedGroup,
        groupMessages: sameId(state.selectedGroup?._id, exitedGroupId)
          ? []
          : state.groupMessages,
      }));
      const groupStore = useGroupChatStore.getState();
      groupStore.setAllGroupMessages(
        groupStore.allGroupMessages.filter(
          (message) => !sameId(message.groupId, exitedGroupId)
        )
      );
      groupStore.setUnreadGroupCount(
        groupStore.unreadGroupCount.filter(
          (count) => !sameId(count.groupId, exitedGroupId)
        )
      );
      toast.success("Group left successfully");
      return true;
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to exit group");
      return false;
    } finally {
      set({ isExitingGroup: false });
    }
  },

  joinGroup: async (groupId) => {
    try {
      const res = await axiosInstance.post("/group/joinGroup", { groupId });
      const joinedGroup = res.data.data;
      useGroupChatStore.setState((state) => ({
        groups: state.groups.some((group) => sameId(group._id, joinedGroup._id))
          ? state.groups
          : [...state.groups, joinedGroup],
      }));
      useUserStore.setState((state) => ({
        exploreGroups: state.exploreGroups.filter(
          (group) => !sameId(group._id, groupId)
        ),
      }));
      toast.success("Joined group successfully");
      return joinedGroup;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to join group");
      return null;
    }
  },

  createGroup: async (name) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/group/create", { name });
      const createdGroup = res.data.data;
      useGroupChatStore.setState((state) => ({
        selectedGroup: createdGroup,
        groupMessages: [],
        showInfo: false,
        groups: state.groups.some((group) => sameId(group._id, createdGroup._id))
          ? state.groups
          : [...state.groups, createdGroup],
      }));
      toast.success("Group created successfully");
      return createdGroup;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create group");
      return null;
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  updateGroupDp: async (newPhoto) => {
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }
    set({ isUpdatingGroup: true });
    try {
      const res = await axiosInstance.put(
        `/group/updateGroupPhoto/${selectedGroup._id}`,
        { newPhoto }
      );
      syncGroupInStore(res.data.data);
      toast.success("Group photo updated successfully");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update photo");
      return false;
    } finally {
      set({ isUpdatingGroup: false });
    }
  },

  getMembersForAdding: async (connections) => {
    const { selectedGroup } = useGroupChatStore.getState();
    try {
      const groupId = selectedGroup._id;
      const res = await axiosInstance.get(
        `/group/connectionForGroup/${groupId}`,
        {
          params: {
            connections: JSON.stringify(connections),
          },
        }
      );
      set({ connectionsForGroup: res.data.data });
    } catch (error) {
      set({ connectionsForGroup: [] });
    }
  },
}));
