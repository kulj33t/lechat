import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useGroupChatStore } from "./useGroupChatStore";
import { useGroupConfigStore } from "./useGroupConfigStore";
import toast from "react-hot-toast";

export const groupRequestAdminStore = create((set) => ({
  adminGroupRequests: [],
  isGroupRequestsAdminLoading: false,
  showGroupRequestsAdmin: false,

  setShowGroupRequestsAdmin: (data) => {
    set({ showGroupRequestsAdmin: data });
  },

  getGroupRequestsAdmin: async () => {
    const { selectedGroup } = useGroupChatStore.getState();
    set({ isGroupRequestsAdminLoading: true });
    try {
      const res = await axiosInstance.get(
        `/group/request/getRequests/admin/${selectedGroup._id}`
      );
      set({ adminGroupRequests: res?.data?.data });
    } catch (error) {
      set({ adminGroupRequests: [] });
    } finally {
      set({ isGroupRequestsAdminLoading: false });
    }
  },

  sendGroupRequestAdmin: async (userId) => {
    const { connectionsForGroup, setConnectionsForGroup } =
      useGroupConfigStore.getState();
    const { selectedGroup } = useGroupChatStore.getState();

    try {
      const res = await axiosInstance.post("/group/request/send/admin", {
        groupId: selectedGroup._id,
        userId,
      });
      const newList = connectionsForGroup.filter(
        (connection) => connection._id !== userId
      );
      setConnectionsForGroup(newList);
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  },

  reviewGroupRequestAdmin: async (status, reqId) => {
    const { selectedGroup, setSelectedGroup } = useGroupChatStore.getState();

    try {
      const res = await axiosInstance.post(
        `group/request/review/admin/${status}`,
        { reqId, groupId: selectedGroup._id }
      );
      if (status === "accepted") {
        setSelectedGroup(res.data.data);
      }
    } catch (error) {
      console.log(error);
      console.log("he;llo");
      toast.error(error?.response?.data?.message);
    }
  },
}));
