import React, { useState } from "react";
import { Inbox, User, UserRoundCheckIcon, Users } from "lucide-react";
import { Connections, GroupExplore, UserExplore } from "../components";
import { ChatPage } from "./index";
import { useGroupChatStore } from "../store/useGroupChatStore";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const [currentContainer, setCurrentContainer] = useState("inbox");
  const { setSelectedUser } = useChatStore();
  const { setSelectedGroup } = useGroupChatStore();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {currentContainer === "users" && <UserExplore />}
        {currentContainer === "groups" && <GroupExplore />}
        {currentContainer === "inbox" && <ChatPage />}
        {currentContainer === "connections" && <Connections />}
      </div>
      <div className="bottom-1  inset-x-0 sm:inset-x-20 h-12  border-t rounded-t-md border-b border-base-300 fixed w-full  z-40 backdrop-blur-lg bg-base-100/20 flex ">
        <button
          className={`flex-1 flex flex-col rounded-md items-center justify-center gap-1   transition duration-300 hover:bg-base-200 ${
            currentContainer === "inbox"
              ? "bg-primary-content text-primary"
              : ""
          }`}
          onClick={() => {
            setCurrentContainer("inbox");
            setSelectedGroup(null);
          }}
        >
          <Inbox size={20} />
          <span className="text-xs lg:text-sm">Inbox</span>
        </button>
        <button
          className={`flex-1 flex flex-col rounded-md items-center justify-center gap-1 transition duration-300 hover:bg-base-200 ${
            currentContainer === "users"
              ? "bg-primary-content text-primary"
              : ""
          }`}
          onClick={() => {
            setCurrentContainer("users");
            setSelectedGroup(null);
          }}
        >
          <User size={20} />
          <span className="text-xs lg:text-sm">Explore People</span>
        </button>
        <button
          className={`flex-1 flex flex-col rounded-md items-center justify-center gap-1  transition duration-300 hover:bg-base-200 ${
            currentContainer === "groups"
              ? "bg-primary-content text-primary"
              : ""
          }`}
          onClick={() => {
            setCurrentContainer("groups");
            setSelectedGroup(null);
          }}
        >
          <Users size={20} />
          <span className="text-xs lg:text-sm">Explore Groups</span>
        </button>
        <button
          className={`flex-1 flex flex-col rounded-md items-center justify-center gap-1  transition duration-300 hover:bg-base-200 ${
            currentContainer === "connections"
              ? "bg-primary-content text-primary"
              : ""
          }`}
          onClick={() => {
            setCurrentContainer("connections");
            setSelectedGroup(null);
            setSelectedUser(null);
          }}
        >
          <UserRoundCheckIcon size={20} />
          <span className="text-xs lg:text-sm">Connections</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
