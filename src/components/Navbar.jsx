import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import Logo from "../../public/Logo.png";
import { LogOut, Settings, User, UserRoundPlusIcon } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useChatStore } from "../store/useChatStore";
import { useGroupConfigStore } from "../store/useGroupConfigStore";
import { THEMES } from "../themeConstant";
import { useThemeStore } from "../store/useThemeStore";


const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [showLogoutMsg, setShowLogoutMsg] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
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
  const { setSelectedUser, setMessages, setUnreadCount, setAllMessages } =
    useChatStore();

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
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="btn btn-sm gap-2 transition-colors"
              >
                <Settings className="size-4" />
                <span className="hidden sm:inline">Theme</span>
              </button>

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

      {isThemeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-base-100 w-11/12 sm:w-1/2 max-w-md p-6 rounded-lg shadow-xl border border-base-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Choose Theme</h2>
              <button
                onClick={() => setIsThemeModalOpen(false)}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setIsThemeModalOpen(false);
                  }}
                  className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors ${
                    theme === t ? "bg-base-200" : "hover:bg-base-200/50"
                  }`}
                >
                  <div
                    className="relative h-8 w-full rounded-md overflow-hidden"
                    data-theme={t}
                  >
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium truncate w-full text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;