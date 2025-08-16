import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { CreateGroup, SideBarSkeleton } from "../components";
import { ChevronLeft, ChevronRight, Plus, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useGroupConfigStore } from "../store/useGroupConfigStore";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setMessages,
    setSelectedUser,
    isUsersLoading,
    getUnreadCount,
    unreadCount,
    setUnreadCount,
    getAllMessages,
    updateReadCount,
    showSideBar,
    setShowSideBar,
  } = useChatStore();

  const {  setConnectionsForGroup } = useGroupConfigStore();
  const {
    getGroups,
    groups,
    selectedGroup,
    setSelectedGroup,
    isGroupsLoading,
    setShowInfo,
    setGroupMessages,
    getUnreadGroupCount,
    unreadGroupCount,
    setUnreadGroupCount,
    getAllGroupMessages,
    updateGroupReadCount,
  } = useGroupChatStore();

  const filterUnreadCount = (id) => {
    const newCount = unreadCount.filter((count) => count.userId !== id);
    setUnreadCount(newCount);
  };

  const filterUnreadGroupCount = (id) => {
    const newCount = unreadGroupCount.filter((count) => count.groupId !== id);
    setUnreadGroupCount(newCount);
  };

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showContacts, setShowContacts] = useState(true);
  const [showGroups, setShowGroups] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
    getAllMessages();
    getAllGroupMessages();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      getUnreadCount(users);
    }
  }, [users]);

  useEffect(() => {
    if (groups.length > 0) {
      getUnreadGroupCount(groups);
    }
  }, [groups]);

  if (isUsersLoading || isGroupsLoading) return <SideBarSkeleton />;

  const sortedUsers =
    users &&
    [...users].sort((a, b) => {
      const isAOnline = onlineUsers.includes(a._id);
      const isBOnline = onlineUsers.includes(b._id);
      if (isAOnline === isBOnline) return 0;
      return isAOnline ? -1 : 1;
    });

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  return (
    <div className="relative">
      <div className="absolute left-1 top-2 z-50  cursor-pointer sm:hidden">
        {showSideBar && (
          <div onClick={() => setShowSideBar(false)}>
            <ChevronLeft />
          </div>
        )}
        {!showSideBar && (
          <div onClick={() => setShowSideBar(true)}>
            <ChevronRight />
          </div>
        )}
      </div>
      {showSideBar && (
        <>
          {showCreateGroup && (
            <CreateGroup onClose={() => setShowCreateGroup(false)} />
          )}
          <aside className="h-full w-28 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200  scrollbar-hidden">
            <div className="border-b border-base-300 w-full p-5">
              <div className="flex items-center justify-between   gap-2 ">
                <button
                  className={`flex relative items-center gap-2 p-2 rounded-md ${
                    showContacts ? "btn" : ""
                  }`}
                  onClick={() => {
                    setShowContacts(true);
                    setSelectedGroup(null);
                    setGroupMessages([]);
                    setShowGroups(false);
                    setShowInfo(false);
                  }}
                >
                  <User className="size-6" />
                  <span className="font-medium hidden pb- lg:block">
                    Contacts
                  </span>
                  {showGroups && unreadCount.length > 0 && (
                    <span className="absolute -top-2 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>

                <button
                  className={`flex relative items-center mr-2 gap-2 p-2 rounded-md ${
                    showGroups ? "btn" : ""
                  }`}
                  onClick={() => {
                    setShowContacts(false);
                    setSelectedUser(null);
                    setMessages([]);
                    setShowGroups(true);
                  }}
                >
                  <Users className="size-6" />
                  <span className="font-medium hidden lg:block">Groups</span>
                  {showContacts && unreadGroupCount.length > 0 && (
                    <span className="absolute -top-2 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  )}
                </button>
              </div>
            </div>

            {showContacts && (
              <>
                {!users || users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <Users className="text-blue-500 size-8" />
                    <Link
                      to="/"
                      className="text-blue-500 hover:underline font-medium text-lg lg:text-base"
                    >
                      Explore People
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 ml-3 hidden lg:flex items-center gap-2">
                      <label className="cursor-pointer flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showOnlineOnly}
                          onChange={(e) => setShowOnlineOnly(e.target.checked)}
                          className="checkbox checkbox-sm"
                        />
                        <span className="text-sm">Show online only</span>
                      </label>
                    </div>
                    {!showOnlineOnly && (
                      <div className="overflow-y-auto w-full py-3">
                        {sortedUsers.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => {
                              setSelectedUser(user);
                              updateReadCount(user._id);
                              filterUnreadCount(user._id);
                              setSelectedGroup(null);
                              setGroupMessages([]);
                              setShowGroups(false);
                              setShowInfo(false);
                            }}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                              selectedUser?._id === user._id
                                ? "bg-base-300 ring-1 ring-base-300"
                                : ""
                            }`}
                          >
                            <div className="relative mx-auto lg:mx-0">
                              <img
                                src={user.profilePic}
                                alt={user.fullName}
                                loading="lazy"
                                className="size-12 object-cover rounded-full"
                              />
                              {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                              )}
                              {unreadCount.find(
                                (count) => count.userId === user._id
                              )?.count && (
                                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                                  {
                                    unreadCount.find(
                                      (count) => count.userId === user._id
                                    ).count
                                  }
                                </span>
                              )}
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                              <div className="font-medium truncate">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-zinc-400">
                                {onlineUsers.includes(user._id)
                                  ? "Online"
                                  : "Offline"}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showOnlineOnly && (
                      <div className="overflow-y-auto w-full py-3">
                        {filteredUsers.map((user) => (
                          <button
                            key={user._id}
                            onClick={() => {
                              setSelectedUser(user);
                              updateReadCount(user._id);
                              filterUnreadCount(user._id);
                              setSelectedGroup(null);
                              setGroupMessages([]);
                              setShowGroups(false);
                              setShowInfo(false);
                            }}
                            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                              selectedUser?._id === user._id
                                ? "bg-base-300 ring-1 ring-base-300"
                                : ""
                            }`}
                          >
                            <div className="relative mx-auto lg:mx-0">
                              <img
                                src={user.profilePic}
                                alt={user.fullName}
                                loading="lazy"
                                className="size-12 object-cover rounded-full"
                              />
                              {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                              )}
                              {unreadCount.find(
                                (count) => count.userId === user._id
                              )?.count && (
                                <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                                  {
                                    unreadCount.find(
                                      (count) => count.userId === user._id
                                    ).count
                                  }
                                </span>
                              )}
                            </div>
                            <div className="hidden lg:block text-left min-w-0">
                              <div className="font-medium truncate">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-zinc-400">
                                {onlineUsers.includes(user._id)
                                  ? "Online"
                                  : "Offline"}
                              </div>
                            </div>
                          </button>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div className="text-center text-zinc-500 py-4">
                            No online users
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {showGroups && (
              <>
                <div className="mt-2 flex items-center justify-center mb-2">
                  <button
                    className="btn btn-primary flex items-center justify-center text-sm py-2 px-4 rounded-lg"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <Plus />
                    <span className="hidden lg:block">Create new group</span>
                    <span className="block lg:hidden">Create</span>
                  </button>
                </div>
                <div className="overflow-y-auto w-full py-3 border-t border-base-300">
                  {groups.map((group) => (
                    <button
                      key={group._id}
                      onClick={() => {
                        filterUnreadGroupCount(group._id);
                        setSelectedGroup(group);
                        updateGroupReadCount(group._id);
                        setConnectionsForGroup([]);
                        setMessages([]);
                        setShowInfo(false);
                      }}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                        selectedGroup?._id === group._id
                          ? "bg-base-300 ring-1 ring-base-300"
                          : ""
                      }`}
                    >
                      <div className="relative mx-auto lg:mx-0">
                        <img
                          src={group.photo}
                          alt={group.name}
                          
                          className="size-12 object-cover rounded-full"
                        />
                        {unreadGroupCount.find(
                          (count) => count.groupId === group._id
                        )?.count && (
                          <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                            {
                              unreadGroupCount.find(
                                (count) => count.groupId === group._id
                              ).count
                            }
                          </span>
                        )}
                      </div>
                      <div className="hidden lg:block text-left min-w-0">
                        <div className="font-medium truncate">{group.name}</div>
                        <div className="text-sm text-zinc-400">
                          {group.members?.length} members
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
};

export default Sidebar;
