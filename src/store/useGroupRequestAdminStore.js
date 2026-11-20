import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useGroupChatStore } from "./useGroupChatStore";
import { useGroupConfigStore } from "./useGroupConfigStore";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { sameId } from "../lib/utils";

export const groupRequestAdminStore = create((set) => ({
  adminGroupRequests: [],
  isGroupRequestsAdminLoading: false,
  showGroupRequestsAdmin: false,

  setShowGroupRequestsAdmin: (data) => {
    set({ showGroupRequestsAdmin: data });
  },

  getGroupRequestsAdmin: async () => {
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      set({ adminGroupRequests: [] });
      return;
    }
    set({ isGroupRequestsAdminLoading: true });
    try {
      const res = await axiosInstance.get(
        `/group/request/getRequests/admin/${selectedGroup._id}`
      );
      set({ adminGroupRequests: res?.data?.data || [] });
    } catch (error) {
      set({ adminGroupRequests: [] });
    } finally {
      set({ isGroupRequestsAdminLoading: false });
    }
  },

  subscribeToAdminGroupRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newGroupAdminRequest");
    socket.on("newGroupAdminRequest", (request) => {
      const { selectedGroup } = useGroupChatStore.getState();
      if (!sameId(selectedGroup?._id, request.groupId)) return;
      set((state) =>
        state.adminGroupRequests.some((item) => sameId(item._id, request._id))
          ? state
          : { adminGroupRequests: [...state.adminGroupRequests, request] }
      );
    });
  },

  unsubscribeFromAdminGroupRequests: () => {
    useAuthStore.getState().socket?.off("newGroupAdminRequest");
  },

  sendGroupRequestAdmin: async (userId) => {
    const { connectionsForGroup, setConnectionsForGroup } =
      useGroupConfigStore.getState();
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }

    try {
      const res = await axiosInstance.post("/group/request/send/admin", {
        groupId: selectedGroup._id,
        userId,
      });
      const newList = connectionsForGroup.filter(
        (connection) => !sameId(connection._id, userId)
      );
      setConnectionsForGroup(newList);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send group invite");
      return false;
    }
  },

  reviewGroupRequestAdmin: async (status, reqId) => {
    const { selectedGroup } = useGroupChatStore.getState();
    if (!selectedGroup?._id) {
      toast.error("Select a group first");
      return false;
    }

    try {
      const res = await axiosInstance.post(
        `/group/request/review/admin/${status}`,
        { reqId, groupId: selectedGroup._id }
      );
      set((state) => ({
        adminGroupRequests: state.adminGroupRequests.filter(
          (request) => !sameId(request._id, reqId)
        ),
      }));
      if (status === "accepted") {
        useGroupChatStore.setState((state) => ({
          selectedGroup: sameId(state.selectedGroup?._id, res.data.data._id)
            ? res.data.data
            : state.selectedGroup,
          groups: state.groups.map((group) =>
            sameId(group._id, res.data.data._id) ? res.data.data : group
          ),
        }));
      }
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to review group request");
      return false;
    }
  },
}));
