import React, { useEffect, useState } from "react";
import { useGroupConfigStore } from "../../store/useGroupConfigStore";
import { useChatStore } from "../../store/useChatStore";
import { UserPlus2, Lock, X } from "lucide-react";
import { groupRequestAdminStore } from "../../store/useGroupRequestAdminStore";

const AddMembers = () => {
  const {
    getMembersForAdding,
    addMember,
    connectionsForGroup,
    setShowAddUsers,
  } = useGroupConfigStore();

  const { sendGroupRequestAdmin } = groupRequestAdminStore();
  const { users } = useChatStore();
  const [currUser, setCurrUser] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      await getMembersForAdding(users);
      setIsLoadingUsers(false);
    };

    fetchUsers();
  }, [users, getMembersForAdding]);

  const handleAddUser = async (id) => {
    setCurrUser(id);
    try {
      await addMember(id);
    } catch (error) {
      console.log(error);
    } finally {
      setCurrUser(null);
    }
  };

  const handleInviteUser = async (id) => {
    setCurrUser(id);
    try {
      await sendGroupRequestAdmin(id);
    } catch (error) {
      console.log(error);
    } finally {
      setCurrUser(null);
    }
  };

  return (
    <div className="fixed inset-0 overflow-auto scrollbar-hidden bg-black bg-opacity-60 z-40 flex justify-center items-center">
      <div className="relative bg-base-100 p-6 rounded-xl max-w-lg w-full shadow-lg">
        <button
          onClick={() => setShowAddUsers(false)}
          className="absolute top-2 right-2"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-center text-lg font-bold mb-4">Add Connections</h2>
        <div className="space-y-4">
          {isLoadingUsers ? (
            <div className="flex items-center h-10 justify-center">
              <div className="loading bg-primary"></div>
            </div>
          ) : connectionsForGroup.length > 0 ? (
            <div className="max-h-[50vh] scrollbar-hidden  overflow-y-auto">
              {connectionsForGroup.map((connection) => (
                <div
                  key={connection._id}
                  className="flex justify-between items-center p-4 mb-2 border-b border-base-200"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={connection.profilePic}
                      alt={connection.fullName}
                      loading="lazy"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">
                      {connection.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {connection.privacy ? (
                      <button
                        className={`btn btn-secondary text-sm ${
                          currUser === connection._id
                            ? "loading bg-primary"
                            : ""
                        }`}
                        onClick={() => handleInviteUser(connection._id)}
                      >
                        {currUser !== connection._id && (
                          <>
                            <Lock className="w-4 h-4" />
                            <p>Invite</p>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className={`btn btn-primary text-sm ${
                          currUser === connection._id
                            ? "loading bg-primary"
                            : ""
                        }`}
                        onClick={() => handleAddUser(connection._id)}
                      >
                        {currUser !== connection._id && (
                          <>
                            <UserPlus2 className="w-4 h-4" />
                            <p>Add</p>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm">No connections available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMembers;
