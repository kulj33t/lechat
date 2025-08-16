import React, { useState } from "react";
import { useUserStore } from "../../store/useUserStore";

const GroupRequests = () => {
  const { groupRequestsUser, reviewGroupRequestUser } = useUserStore();
  const [currReq, setCurrReq] = useState(null);
  const [status, setStatus] = useState("");

  const handleAccept = async (req) => {
    setCurrReq(req._id);
    setStatus("accepted");
    try {
      await reviewGroupRequestUser("accepted", req._id, req.groupId._id);
    } catch (error) {
      console.log(error);
    } finally {
      setCurrReq(null);
      setStatus("");
    }
  };

  const handleReject = async (req) => {
    setCurrReq(req._id);
    setStatus("rejected");
    try {
      await reviewGroupRequestUser("rejected", req._id, req.groupId._id);
    } catch (error) {
      console.log(error);
    } finally {
      setCurrReq(null);
      setStatus("");
    }
  };

  if (!groupRequestsUser || groupRequestsUser.length === 0)
    return (
      <div className="h-screen flex items-center justify-center">
        No group requests at the moment
      </div>
    );

  return (
    <div className="w-full p-5  overflow-auto scrollbar-hidden">
      {groupRequestsUser.map((request) => (
        <div
          key={request._id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-md mb-4"
        >
          <div className="flex items-center gap-4">
            <img
              src={request.senderId.profilePic}
              alt={request.senderId.fullName}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{request.senderId.fullName}</p>
              <p className="text-sm">invited you to join their group</p>
            </div>
          </div>

          <div className="flex items-center text-center gap-4 mt-4 sm:mt-0">
            <p className="font-medium">{request.groupId.name}</p>
          </div>

          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              className={`btn btn-success btn-sm ${
                currReq === request._id && status === "accepted"
                  ? "loading bg-success"
                  : ""
              }`}
              onClick={() => handleAccept(request)}
              disabled={status === "accepted" || status === "rejected"}
            >
              {currReq === request._id && status === "accepted" ? "" : "Accept"}
            </button>
            <button
              className={`btn btn-error btn-sm ${
                currReq === request._id && status === "rejected" ? "loading bg-error" : ""
              }`}
              onClick={() => handleReject(request)}
              disabled={status === "accepted" || status === "rejected"}
            >
              {currReq === request._id && status === "rejected" ? "" : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupRequests;
