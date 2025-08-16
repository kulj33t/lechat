import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageInput, MessageSkeleton, ChatHeader } from "../components";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useGroupChatStore } from "../store/useGroupChatStore.js";
import GroupInfo from "./GroupInfo.jsx";

const ChatContainer = () => {
  const { authUser } = useAuthStore();

  const messagEndRef = useRef(null);
  const { messages, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();

  const {
    groupMessages,
    getGroupMessages,
    isGroupMessagesLoading,
    selectedGroup,
    showInfo,
  } = useGroupChatStore();

  const uniqueGroupMessages = [
    ...new Map(
      groupMessages?.map((message) => [message._id, message])
    ).values(),
  ];

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
    if (selectedGroup) getGroupMessages(selectedGroup._id);

    return () => {};
  }, [selectedUser?._id, selectedGroup?._id, getMessages, getGroupMessages]);

  useEffect(() => {
    if (messagEndRef.current && (messages || groupMessages)) {
      messagEndRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [messages, groupMessages]);

  if (isMessagesLoading || isGroupMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto  scrollbar-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 ml-2 flex flex-col overflow-auto  scrollbar-hidden">
      <ChatHeader />
      {!showInfo && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages &&
            messages.length > 0 &&
            messages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId === authUser.data._id
                    ? "chat-end"
                    : "chat-start"
                }`}
                ref={messagEndRef}
              >
                <div className="chat-header mb-1">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div
                  className={`${
                    message.senderId === authUser.data._id
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content"
                  } chat-bubble relative flex flex-col text-base sm:text-sm`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      loading="lazy"
                      alt="Attachment"
                      className="sm:max-w-[200px] max-w-[150px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}

                  {message.senderId === authUser.data._id && (
                    <div className="absolute -bottom-1 -right-0 my-1  flex flex-col items-center ">
                      {message.isRead ? (
                        <>
                          <svg
                            width="20px"
                            height="20px"
                            viewBox="-2.4 -2.4 28.80 28.80"
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon flat-line mt-2 text-primary-content"
                            style={{ color: "currentColor" }}
                          >
                            <g strokeWidth="0"></g>
                            <g strokeLinecap="round" strokeLinejoin="round"></g>
                            <g>
                              <line
                                x1="13.22"
                                y1="16.5"
                                x2="21"
                                y2="7.5"
                                style={{
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                }}
                              />
                              <polyline
                                points="3 11.88 7 16.5 14.78 7.5"
                                style={{
                                  fill: "none",
                                  stroke: "currentColor",
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                }}
                              />
                            </g>
                          </svg>
                        </>
                      ) : (
                        <svg
                          width="18px"
                          height="18px"
                          viewBox="-2.4 -2.4 28.80 28.80"
                          xmlns="http://www.w3.org/2000/svg"
                          className="icon flat-line text-primary-content"
                          style={{ color: "currentColor" }}
                        >
                          <g strokeWidth="0"></g>
                          <g strokeLinecap="round" strokeLinejoin="round"></g>
                          <g>
                            <polyline
                              points="4 12 9 17 20 6"
                              style={{
                                fill: "none",
                                stroke: "currentColor",
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                              }}
                            />
                          </g>
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          {uniqueGroupMessages &&
            uniqueGroupMessages.length > 0 &&
            uniqueGroupMessages.map((message) => (
              <div
                key={message._id}
                className={`chat ${
                  message.senderId._id === authUser.data._id
                    ? "chat-end"
                    : "chat-start"
                }`}
                ref={messagEndRef}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        message.senderId._id === authUser.data._id
                          ? authUser.data.profilePic
                          : message.senderId.profilePic
                      }
                      loading="lazy"
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1 mr-3">
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div
                  className={`${
                    message.senderId._id === authUser.data._id
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content"
                  } chat-bubble flex flex-col relative text-base sm:text-sm`}
                >
                  {message.senderId._id !== authUser.data._id && (
                    <p className="absolute top-[-1.5rem] left-10 text-sm">
                      ~{message.senderId.fullName.split(" ")[0]}
                    </p>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      loading="lazy"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            ))}
        </div>
      )}
      {showInfo && <GroupInfo />}
      {!showInfo && <MessageInput />}
    </div>
  );
};
export default ChatContainer;
