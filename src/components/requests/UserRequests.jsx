import React, { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import toast from "react-hot-toast";

const UserRequests = () => {
  const { userRequests, reviewUserRequest } = useUserStore();
  const [currReq, setCurrReq] = useState(null);
  const [status, setStatus] = useState("");
  if (!userRequests || userRequests.length === 0)
    return (
      <div className="h-screen flex items-center justify-center">
        No user requests at the moment
      </div>
    );

  const handleAccept = async (req) => {
    setCurrReq(req._id);
    setStatus("accepted");
    try {
      await reviewUserRequest("accepted", req._id);
      toast.success("Request accepted successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setCurrReq(null);
      setStatus("");
    }
  };

  const handleReject = async (req) => {
    setStatus("rejected");
    setCurrReq(req._id);
    try {
      await reviewUserRequest("rejected", req._id);
      toast.success("Request rejected successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setCurrReq(null);
      setStatus("");
    }
  };

  return (
    <div className="w-full p-4 overflow-auto scrollbar-hidden ">
      {userRequests.map((request) => (
        <div
          key={request._id}
          className="flex items-center justify-between p-4   rounded-lg shadow-md "
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
              <p className="text-sm ">{request.senderId.email}</p>
            </div>
          </div>

          <div className="flex gap-4 ml-2">
            <button
              className={`btn btn-success btn-sm ${
                currReq === request._id && status === "accepted"
                  ? "loading bg-success"
                  : ""
              }`}
              onClick={() => handleAccept(request)}
            >
              {currReq === request._id && status === "accepted" ? "" : "Accept"}
            </button>
            <button
              className={`btn btn-error btn-sm ${
                currReq === request._id && status === "rejected"
                  ? "loading bg-error"
                  : ""
              }`}
              onClick={() => handleReject(request)}
            >
              { currReq === request._id && status === "rejected" ? "" : "Reject"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserRequests;
