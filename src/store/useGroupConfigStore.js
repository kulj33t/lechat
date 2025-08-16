import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useGroupChatStore } from "./useGroupChatStore";

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
    const { selectedGroup, setSelectedGroup } = useGroupChatStore.getState();
    set({ isAddingMember: true });
    try {
      const res = await axiosInstance.post("/group/addMember", {
        userId,
        groupId: selectedGroup._id,
      });
      setSelectedGroup(res.data.data);
      const newList = connectionsForGroup.filter(
        (connection) => connection._id !== userId
      );
      set({ connectionsForGroup: newList });
      toast.success("Member added successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add member");
    } finally {
      set({ isAddingMember: false });
    }
  },

  removeMember: async (userId) => {
    set({ isRemovingMember: true });
    const { selectedGroup, setSelectedGroup } = useGroupChatStore.getState();
    try {
      const res = await axiosInstance.post("/group/removeMember", {
        userId,
        groupId: selectedGroup._id,
      });
      setSelectedGroup(res.data.data);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove member");
    } finally {
      set({ isRemovingMember: false });
    }
  },

  updateGroup: async (data) => {
    set({ isUpdatingGroup: true });
    const { selectedGroup, setSelectedGroup } = useGroupChatStore.getState();
    try {
      const res = await axiosInstance.patch(
        `/group/updateGroup/${selectedGroup._id}`,
        data
      );
      setSelectedGroup(res.data.data);
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update group");
    } finally {
      set({ isUpdatingGroup: false });
    }
  },

  deleteGroup: async () => {
    set({ isDeletingGroup: true });
    const { selectedGroup, setSelectedGroup, setGroups, groups } =
      useGroupChatStore.getState();
    const deletedGroup = selectedGroup;
    try {
      await axiosInstance.delete("/group/deleteGroup", {
        data: { groupId: selectedGroup._id },
      });
      const newGroups = groups.filter(
        (group) => group._id !== deletedGroup._id
      );
      setGroups(newGroups);
      setSelectedGroup(null);
      toast.success("Group deleted successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete group");
    } finally {
      set({ isDeletingGroup: false });
    }
  },

  exitGroup: async () => {
    set({ isExitingGroup: true });
    const { selectedGroup, setSelectedGroup, setGroups } =
      useGroupChatStore.getState();
    try {
      const res = await axiosInstance.post("/group/exitGroup", {
        groupId: selectedGroup._id,
      });
      setSelectedGroup(null);
      setGroups(res.data.data);
      toast.success("Group left successfully");
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Failed to exit group");
    } finally {
      set({ isExitingGroup: false });
    }
  },

  joinGroup: async (groupId) => {
    const { setGroups, groups } = useGroupChatStore.getState();
    try {
      const res = await axiosInstance.post("/group/joinGroup", { groupId });
      setGroups([...groups, res.data.data]);
      toast.success("Joined group successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to join group");
    }
  },

  createGroup: async (name) => {
    const { setSelectedGroup, setGroups, groups } =
      useGroupChatStore.getState();

    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/group/create", { name });
      setSelectedGroup(res.data.data);
      setGroups([...groups, res.data.data]);
      toast.success("Group created successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create group");
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  updateGroupDp: async (newPhoto) => {
    set({ isUpdatingGroup: true });
    const { selectedGroup, setSelectedGroup } = useGroupChatStore.getState();
    try {
      const res = await axiosInstance.put(
        `/group/updateGroupPhoto/${selectedGroup._id}`,
        { newPhoto }
      );
      setSelectedGroup(res.data.data);
      toast.success("Group photo updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update photo");
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
