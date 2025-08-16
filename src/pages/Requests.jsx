import React, { useState } from "react";
import { GroupRequests, UserRequests } from "../components";
import { useUserStore } from "../store/useUserStore";

const Requests = () => {
  const [showUserRequests, setShowUserRequests] = useState(true);
  const { userRequests, groupRequestsUser } = useUserStore();

  return (
    <div className="flex flex-col items-center justify-start mt-16 pt-4 h-screen">
      <div className="flex gap-4 mb-4 w-4/5 mx-5">
        <button
          onClick={() => setShowUserRequests(true)}
          className={`w-1/2 whitespace-nowrap ${
            showUserRequests
              ? "bg-primary text-base-300"
              : "bg-base-200 text-base-content"
          } py-2  px-4 rounded-lg transition-all`}
        >
          User Requests{" "}
          {userRequests.length > 0 && <>({userRequests.length})</>}
        </button>
        <button
          onClick={() => setShowUserRequests(false)}
          className={`w-1/2 ${
            !showUserRequests
              ? "bg-primary text-base-300"
              : "bg-base-200  text-base-content"
          } py-2 whitespace-nowrap px-4 rounded-lg transition-all`}
        >
          Group Requests{" "}
          {groupRequestsUser.length > 0 && <>({groupRequestsUser.length})</>}
        </button>
      </div>

      {showUserRequests ? <UserRequests /> : <GroupRequests />}
    </div>
  );
};

export default Requests;
