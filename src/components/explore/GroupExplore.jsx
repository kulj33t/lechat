import React, { useEffect, useState } from "react";
import { GroupSkeleton } from "../skeletons/Explore";
import { useUserStore } from "../../store/useUserStore";
import { Lock, UserPlus } from "lucide-react";
import { useGroupConfigStore } from "../../store/useGroupConfigStore";
import toast from "react-hot-toast";

const GroupExplore = () => {
  const { exploreGroups, fetchExploreGroups, sendGroupRequestUser } =
    useUserStore();
  const { joinGroup } = useGroupConfigStore();

  const [isLoading, setIsLoading] = useState(true);
  const [requestSending, setRequestSending] = useState(null);
  const [isJoiningGroup, setIsJoiningGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchExploreGroups();
      setIsLoading(false);
    };
    fetchData();
  }, [fetchExploreGroups]);

  useEffect(() => {
    setGroups(exploreGroups);
  }, [exploreGroups]);

  const handleGroupRequest = async (id) => {
    setRequestSending(id);
    try {
      await sendGroupRequestUser(id);
      setGroups((prev) => prev.filter((group) => group._id !== id));
      toast.success("Request Sent successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setRequestSending(null);
    }
  };

  const handleJoinGroup = async (id) => {
    setIsJoiningGroup(id);
    try {
      await joinGroup(id);
      setGroups((prev) => prev.filter((group) => group._id !== id));
    } catch (error) {
      toast.error("Failed to join group");
    } finally {
      setIsJoiningGroup(null);
    }
  };

  if (isLoading) return <GroupSkeleton />;

  if (!groups || groups.length === 0)
    return (
      <p className="h-screen flex justify-center items-center  text-lg font-medium">
        No groups found
      </p>
    );

  return (
    <div className="py-8 mt-20 px-4 max-w-7xl mx-auto">
      <p className="text-2xl md:text-3xl font-semibold text-center sm:text-left mb-5">
        Explore Groups
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
        {groups.map((group) => (
          <div
            key={group._id}
            className="flex flex-col items-center space-y-4  shadow-inherit hover:shadow-xl p-6 rounded-lg transition duration-300 ease-in-out transform "
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden">
              <img
                src={group.photo}
                alt={group.name}
                loading="lazy"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="text-center text-sm md:text-lg font-semibold">
              {group.name.length > 10
                ? group.name.slice(0, 10).trim() + "..."
                : group.name}
            </div>
            {group.visibility === "private" ? (
              <div className="text-center space-y-4">
                <Lock className="w-6 h-6 mx-auto" />
                <button
                  className={`btn btn-primary ${
                    requestSending === group._id ? "loading bg-primary" : ""
                  }`}
                  disabled={requestSending === group._id}
                  onClick={() => handleGroupRequest(group._id)}
                >
                  {requestSending === group._id ? "" : "Request"}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <UserPlus className="w-6 h-6 mx-auto" />
                <button
                  className={`btn btn-primary ${
                    isJoiningGroup === group._id ? "loading bg-primary" : ""
                  }`}
                  disabled={isJoiningGroup === group._id}
                  onClick={() => handleJoinGroup(group._id)}
                >
                  {isJoiningGroup === group._id ? "" : "Join Group"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupExplore;
