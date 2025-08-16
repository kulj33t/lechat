import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import Logo from "../../public/Logo.png";
import { LogOut, Settings, User, UserRoundPlusIcon } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupConfigStore } from "../store/useGroupConfigStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
  const {
    userRequests,
    groupRequestsUser,
    subscribeToUserRequests,
    unsubscribeToUserRequests,
  } = useUserStore();
  const totalRequests = userRequests.length + groupRequestsUser.length;
  const {
    setGroupMessages,
    setSelectedGroup,
    setAllGroupMessages,
    setShowInfo,
  } = useGroupChatStore();
  const { setSelectedUser, setMessages, setUnreadCount,setAllMessages } = useChatStore();

  useEffect(() => {
    if (authUser) subscribeToUserRequests();
    return () => {
      if (authUser) unsubscribeToUserRequests();
    };
  });

  return (
    <>
      <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div
              className="flex items-center gap-8"
              onClick={() => {
                setSelectedUser(null);
                setSelectedGroup(null);
                setMessages(null);
                setShowInfo(false);
                setGroupMessages(null);
              }}
            >
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-6 sm:size-10 rounded-lg  flex items-center justify-center">
                  <img
                    className="size-6 sm:size-10 object-cover rounded-full"
                    src={Logo}
                    loading="lazy"
                  />
                </div>
                <h1 className="text-lg font-bold">Le Chat</h1>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className="btn btn-sm gap-2 transition-colors"
              >
                <Settings className="size-4" />
                <span
                  className="hidden sm:inline"
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedGroup(null);
                    setMessages(null);
                    setShowInfo(false);
                    setGroupMessages(null);
                  }}
                >
                  Settings
                </span>
              </Link>

              {authUser && (
                <>
                  <Link to="/profile" className="btn btn-sm gap-2">
                    <User className="size-5" />
                    <span
                      className="hidden sm:inline"
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedGroup(null);
                        setShowInfo(false);
                        setMessages(null);
                        setGroupMessages(null);
                      }}
                    >
                      Profile
                    </span>
                  </Link>
                  <Link
                    to="/requests"
                    className="btn btn-sm gap-2 flex items-center justify-center relative group"
                  >
                    <UserRoundPlusIcon className="size-5" />
                    {totalRequests > 0 && (
                      <span className="absolute top-0 right-0  w-4 h-4 bg-red-500 text-xs text-white  rounded-full flex items-center justify-center">
                        {totalRequests}
                      </span>
                    )}
                    <span
                      className="hidden sm:inline ml-2 text-sm font-medium "
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedGroup(null);
                        setMessages(null);
                        setShowInfo(false);
                        setGroupMessages(null);
                      }}
                    >
                      Requests
                    </span>
                  </Link>

                  <button
                    className="flex gap-2 items-center"
                    onClick={() => setShowLogoutMsg(true)}
                  >
                    <LogOut className="size-5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {showLogoutMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center h-screen z-50">
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg w-4/5 sm:w-1/3 p-6 flex flex-col items-center gap-6">
            <h2 className="text-lg font-semibold  text-center">
              Are you sure you want to logout?
            </h2>
            <div className="flex w-full justify-between gap-4">
              <button
                onClick={() => {
                  logout();
                  setShowLogoutMsg(false);
                  setSelectedUser(null);
                  setSelectedGroup(null);
                  setMessages(null);
                  setShowInfo(false);
                  setGroupMessages(null);
                  setAllGroupMessages([]);
                  setAllMessages([]);
                  setUnreadCount([]);
                }}
                className="btn btn-sm bg-red-500 text-white flex-1 hover:bg-red-600"
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutMsg(false)}
                className="btn btn-sm bg-gray-200 text-gray-800 flex-1 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
