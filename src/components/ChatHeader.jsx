import { Info, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupChatStore } from "../store/useGroupChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedGroup, setSelectedGroup, setShowInfo, showInfo } =
    useGroupChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 ml-4 sm:ml-0 rounded-full relative">
              {selectedUser && (
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.fullName}
                  loading="lazy"
                />
              )}
              {selectedGroup && (
                <img
                  src={selectedGroup.photo}
                  alt={selectedGroup.name}
                  loading="lazy"
                />
              )}
            </div>
          </div>

          <div>
            {selectedUser && (
              <h3 className="font-medium">{selectedUser.fullName}</h3>
            )}
            {selectedGroup && (
              <h3 className="font-medium">{selectedGroup.name}</h3>
            )}
            {selectedUser && (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-10 justify-between">
          <div>
            {selectedGroup && (
              <button onClick={() => setShowInfo(!showInfo)}>
                <Info />
              </button>
            )}
          </div>
          <div>
            {selectedUser && (
              <button onClick={() => setSelectedUser(null)}>
                <X />
              </button>
            )}
            {selectedGroup && (
              <button onClick={() => setSelectedGroup(null)}>
                <X />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
