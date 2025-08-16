import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Trash2 } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import toast from "react-hot-toast";

const Connections = () => {
  const { users, setUsers } = useChatStore();
  const { removeConnections } = useUserStore();
  const [removing, setRemoving] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const removeConnection = async (id) => {
    setRemoving(id);
    setLoading(true);
    try {
      await removeConnections(id);
      toast.success("Connection removed successfully");
      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      toast.error("Failed to remove connection");
      console.error(error);
    } finally {
      setRemoving(null);
      setSelectedUserId(null);
      setLoading(false);
    }
  };

  if (users.length === 0)
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <p className="text-lg">
          No connections yet. Explore people from the Explore page and make
          connections.
        </p>
      </div>
    );

  return (
    <div className="p-4 mt-16">
      <h1 className="text-xl font-bold m-5">Connections ({users.length})</h1>
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between w-full bg-base-200 p-4 rounded-lg shadow-md mb-4"
        >
          <div className="flex items-center">
            <img
              src={user.profilePic}
              alt={user.fullName}
              loading="lazy"
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <p className="text-base font-medium">{user.fullName}</p>
          </div>
          <button
            className={`btn btn-error btn-sm flex items-center gap-2`}
            onClick={() => setSelectedUserId(user._id)}
          >
            {removing !== user._id && (
              <>
                <span>Remove</span>
                <Trash2 />
              </>
            )}
          </button>
        </div>
      ))}

      {selectedUserId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className=" p-6 rounded-lg bg-base-100 shadow-lg w-80">
            <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
            <p className="mb-6">
              Are you sure you want to remove this connection? All chats will
              also be deleted.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedUserId(null)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-error btn-sm ${loading ? "loading bg-error":""}`}
                onClick={() => removeConnection(selectedUserId)}
              >
                {loading ? "":"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
