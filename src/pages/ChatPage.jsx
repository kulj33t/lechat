import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { NoChatSelected, SideBar, ChatContainer } from "../components";
import { useGroupChatStore } from "../store/useGroupChatStore";

const ChatPage = () => {
  const { selectedUser, subscribeToMessages, unSubscribeToMessages } =
    useChatStore();
  const {
    selectedGroup,
    subscribeToGroupMessages,
    unSubscribeToGroupMessages,
  } = useGroupChatStore();

  useEffect(() => {
    subscribeToMessages();
    subscribeToGroupMessages();

    return () => {
      unSubscribeToMessages();
      unSubscribeToGroupMessages();
    };
  }, [
    subscribeToMessages,
    subscribeToGroupMessages,
    unSubscribeToMessages,
    unSubscribeToGroupMessages,
  ]);

  return (
    <div className="bg-base-200 h-screen">
      <div className="flex items-center justify-center pt-20 px-2">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-7xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SideBar />
            {!selectedUser && !selectedGroup ? (
              <NoChatSelected />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
