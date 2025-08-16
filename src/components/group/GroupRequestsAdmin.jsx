import React, { useEffect, useState } from "react";
import { groupRequestAdminStore } from "../../store/useGroupRequestAdminStore";
import { UserPlus2, X } from "lucide-react";
import toast from "react-hot-toast";

const GroupRequestsAdmin = () => {
  const {
    setShowGroupRequestsAdmin,
    adminGroupRequests,
    reviewGroupRequestAdmin,
    isGroupRequestsAdminLoading,
  } = groupRequestAdminStore();

  const [currUser, setCurrUser] = useState(null);
  const [currOperation, setCurrOperation] = useState("");

  const handleAccept = async (id) => {
    setCurrUser(id);
    setCurrOperation("accepted");
    try {
      await reviewGroupRequestAdmin("accepted", id);
      toast.success("Request accepted successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setCurrUser(null);
      setCurrOperation("");
    }
  };

  const handleReject = async (id) => {
    setCurrOperation("rejected");
    setCurrUser(id);
    try {
      await reviewGroupRequestAdmin("rejected", id);
      toast.success("Request rejected successfully");
    } catch (error) {
      console.log(error);
    } finally {
      setCurrUser(null);
      setCurrOperation("");
    }
  };

  return (
    <div className="fixed inset-0 bg-base-300 bg-opacity-50 z-40 flex justify-center items-center">
      <div className="relative bg-base-100 p-6 rounded-xl max-w-lg w-full shadow-lg">
        <button
          onClick={() => setShowGroupRequestsAdmin(false)}
          className="absolute top-2 right-2 hover:text-error"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-center text-lg font-bold mb-6">Group Requests</h2>
        <div className="space-y-6">
          {isGroupRequestsAdminLoading ? (
            <div className="flex items-center justify-center h-16">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : adminGroupRequests.length > 0 ? (
            adminGroupRequests.map((request) => (
              <div
                key={request._id}
                className="flex justify-between items-center p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={request.senderId.profilePic}
                    alt={request.senderId.fullName}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border border-base-300"
                  />
                  <span className="text-sm font-medium text-base-content">
                    {request.senderId.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`btn btn-success btn-sm ${
                      currUser === request._id && currOperation === "accepted"
                        ? "loading bg-success"
                        : ""
                    }`}
                    onClick={() => handleAccept(request._id)}
                  >
                    {currUser === request._id &&
                    currOperation === "accepted" ? (
                      ""
                    ) : (
                      <>
                        <UserPlus2 className="w-4 h-4" />
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    className={`btn btn-error btn-sm ${
                      currUser === request._id && currOperation === "rejected"
                        ? "loading bg-error"
                        : ""
                    }`}
                    onClick={() => handleReject(request._id)}
                  >
                    {currUser === request._id && currOperation === "rejected"
                      ? ""
                      : "Reject"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-base-content">
              No requests at the moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupRequestsAdmin;
