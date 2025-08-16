import React, { useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { X } from "lucide-react";

const SearchUser = () => {
  const {
    setShowSearch,
    searchUser,
    reviewUserRequest,
    sendUserRequest,
    exploreUsers,
    setExploreUsers,
  } = useUserStore();
  const { authUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState([]);
  const [username, setUsername] = useState("");
  const [requestAccepting, setRequestAccepting] = useState(false);
  const [requestRejecting, setRequestRejecting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [requestSending, setRequestSending] = useState(false);

  const handleConnect = async (id) => {
    const newExploreUsers = exploreUsers.filter((user) => user._id !== id);
    setExploreUsers(newExploreUsers);
    setRequestSending(true);
    try {
      await sendUserRequest(id);
      toast.success("Request sent successfully");
      setUser([]);
      setUsername("");
    } catch (error) {
      console.log(error);
    } finally {
      setRequestSending(false);
    }
  };

  const handleAccept = async (reqId) => {
    setRequestAccepting(true);
    try {
      await reviewUserRequest("accepted", reqId);
      toast.success("Request accepted successfully");
      setUser([]);
      setUsername("");
    } catch {
    } finally {
      setRequestAccepting(false);
    }
  };

  const handleReject = async (reqId) => {
    setRequestRejecting(true);
    try {
      await reviewUserRequest("rejected", reqId);
      toast.success("Request rejected successfully");
      setUser([]);
      setUsername("");
    } catch {
    } finally {
      setRequestRejecting(false);
    }
  };

  const validateUsername = () => {
    const name = username.trim();
    if (!name) {
      toast.error("Username is required");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast.error("Username contains invalid characters");
      return false;
    }
    if (name.length < 4) {
      toast.error("Username must be at least 4 characters long");
      return false;
    }
    if (name.length > 18) {
      toast.error("Username cannot be more than 18 characters");
      return false;
    }
    if (name === authUser?.data?.username) {
      toast.error("Cannot search yourself in the search bar");
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    if (!validateUsername()) {
      return;
    }
    setLoading(true);
    try {
      const res = await searchUser(username.trim());
      setUser(res);
      if (!res) {
        toast.error("User not found");
        setShowError(true);
        return;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-base-300 bg-opacity-50 z-40 flex justify-center items-center">
      <div className="relative bg-base-100 p-6 rounded-xl max-w-lg w-full shadow-lg">
        <button
          onClick={() => setShowSearch(false)}
          className="absolute top-2 right-2"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-center text-lg font-bold mb-4">
          Search User by Username
        </h2>
        <form
          className="form-control"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            type="text"
            placeholder="Enter username"
            className="input input-bordered w-full mb-4"
            readOnly={loading}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setShowError(false);
            }}
          />
          <button
            type="submit"
            className={`btn btn-info w-full`}
            disabled={loading}
          >
            Search
          </button>
        </form>

        {loading && (
          <div className="h-20 flex justify-center items-center">
            <div className="loading bg-primary w-10 h-10 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && user && user.length !== 0 && (
          <div className="mt-6 p-6 rounded-lg shadow-md w-full max-w-sm mx-auto flex flex-col items-center">
            <img
              src={user.data.data.profilePic}
              alt={user.data.data.fullName}
              loading="lazy"
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary"
            />
            <p className="text-lg font-semibold mb-2 text-center">
              {user.data.data.fullName}
            </p>
            <p className="text-sm mb-2 text-center">
              {user.data.data.username}
            </p>
            {user.data.req ? (
              user.data.req.status === "pending" ? (
                user.data.req.senderId === authUser.data._id ? (
                  <div className="btn btn-secondary px-6 py-2">Pending</div>
                ) : user.data.req.receiverId === authUser.data._id ? (
                  <div className="flex flex-col gap-4 mt-2">
                    <p className="text-sm text-center">
                      {user.data.data.fullName} has already sent you a request
                    </p>
                    <div className="flex items-center justify-between">
                      <button
                        className={`btn btn-success px-6 py-2 ${
                          requestAccepting ? "loading bg-success" : ""
                        }`}
                        onClick={() => handleAccept(user.data.req._id)}
                      >
                        {requestAccepting ? "" : "Accept"}
                      </button>
                      <button
                        className={`btn btn-error px-6 py-2 ${
                          requestRejecting ? "loading bg-error" : ""
                        }`}
                        onClick={() => handleReject(user.data.req._id)}
                      >
                        {requestRejecting ? "" : "Reject"}
                      </button>
                    </div>
                  </div>
                ) : null
              ) : user.data.req.status === "accepted" ? (
                <div className="btn btn-primary px-6 py-2">Connected</div>
              ) : null
            ) : (
              <button
                className={`mt-2 btn btn-primary ${
                  requestSending ? "loading" : ""
                }`}
                onClick={() => handleConnect(user.data.data._id)}
              >
                {requestSending ? "" : "Connect"}
              </button>
            )}
          </div>
        )}

        {showError && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium text-error">
              User not found. Please provide a correct username.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUser;
