import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import imageCompression from "browser-image-compression";
import {
  BellPlusIcon,
  Camera,
  LogOut,
  LucideTrash2,
  MoreVertical,
  Settings,
  Trash2Icon,
  UserPlus2,
} from "lucide-react";
import { useGroupConfigStore } from "../store/useGroupConfigStore";
import { AddMembers, GroupRequestsAdmin } from "../components";
import { groupRequestAdminStore } from "../store/useGroupRequestAdminStore";
import { useGroupChatStore } from "../store/useGroupChatStore";

const GroupInfo = () => {
  const {
    setShowGroupRequestsAdmin,
    getGroupRequestsAdmin,
    adminGroupRequests,
    showGroupRequestsAdmin,
  } = groupRequestAdminStore();
  const {
    removeMember,
    isRemovingMember,
    updateGroup,
    exitGroup,
    updateGroupDp,
    showAddUsers,
    setShowAddUsers,
    deleteGroup,
    isDeletingGroup,
    isExitingGroup,
  } = useGroupConfigStore();

  const { groups, selectedGroup } = useGroupChatStore();
  const [group, setGroup] = useState(selectedGroup);

  const admin = selectedGroup.admin;

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  useEffect(() => {
    setGroup(selectedGroup);
    getGroupRequestsAdmin();
  }, [groups, selectedGroup]);

  const { authUser } = useAuthStore();

  const [showAdminOptions, setShowAdminOptions] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    newName: group.name,
    visibility: group.visibility,
    description: group.description || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const validateSave =
    formData?.newName?.trim() !== group.name.trim() ||
    formData?.visibility !== group.visibility ||
    (formData?.description?.trim() || "") !== (group.description?.trim() || "");

  const handleImageUpload = async (e) => {
    setImageUploading(true);
    const file = e.target.files[0];
    if (!file) return;

    const compressedFile = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      initialQuality: 0.9,
      useWebWorker: true,
    });

    const reader = new FileReader();
    reader.readAsDataURL(compressedFile);

    reader.onload = async () => {
      const base64Image = reader.result;
      await updateGroupDp(base64Image);
    };
    setImageUploading(false);
  };

  const handleGroupInfoUpdate = async () => {
    setIsLoading(true);
    await updateGroup(formData);
    setIsLoading(false);
  };

  const handleVisibilityToggle = () => {
    setFormData({
      ...formData,
      visibility: formData.visibility === "private" ? "public" : "private",
    });
  };

  const handleRemoveMember = async (userId) => {
    await removeMember(userId);
  };

  const toggleAdminOptions = (id) => {
    showAdminOptions === id
      ? setShowAdminOptions(null)
      : setShowAdminOptions(id);
  };

  const handleConfirmDelete = async () => {
    await deleteGroup();
  };

  const handleExitGroup = async () => {
    await exitGroup();
  };

  return (
    <div className="min-h-screen bg-base-100 relative">
      {imageUploading && (
        <div className="absolute inset-0 bg-opacity-80 bg-black flex h-screen items-center justify-center">
          <div className="loading bg-primary w-12 h-12 rounded-full"></div>
        </div>
      )}
      {showAddUsers && <AddMembers />}
      {showGroupRequestsAdmin && <GroupRequestsAdmin />}

      {showDeleteWarning && (
        <>
          <div className="fixed inset-0 bg-base-300 bg-opacity-50 z-40 flex justify-center items-center">
            <div className="  relative bg-base-100 flex flex-col p-6 rounded-xl max-w-lg w-full shadow-lg">
              <p className="text-center">
                Deleting this group will remove all the members and the
                chats.Are you sure you want to delete?
              </p>
              <div className="flex items-center justify-between m-5">
                <button
                  onClick={handleConfirmDelete}
                  className={`btn btn-error bg-error ${
                    isDeletingGroup ? "loading" : ""
                  }`}
                >
                  {isDeletingGroup ? "" : "Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteWarning(false)}
                  className="btn btn-secondary bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showExitWarning && (
        <>
          <div className="fixed inset-0 bg-base-300 bg-opacity-50 z-40 flex justify-center items-center">
            <div className="  relative bg-base-100 flex flex-col p-6 rounded-xl max-w-lg w-full shadow-lg">
              <p className="text-center">
                Are you sure, you want to leave this group ?
              </p>
              <div className="flex items-center justify-between m-5">
                <button
                  onClick={handleExitGroup}
                  className={`btn btn-error bg-error ${
                    isExitingGroup ? "loading" : ""
                  }`}
                >
                  {isExitingGroup ? "" : "Leave"}
                </button>
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="btn btn-secondary bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="mt-2 text-sm ">{group.description}</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <img
                src={group.photo}
                alt="Group"
                loading="lazy"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4"
              />

              {authUser.data._id === group.admin && (
                <label
                  htmlFor="group-image-upload"
                  className="absolute -bottom-1 -right-1 bg-base-content hover:scale-110 p-2 rounded-full cursor-pointer transition-transform duration-300"
                >
                  <Camera className="w-5 h-5 text-base-200" />
                  <input
                    type="file"
                    id="group-image-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {authUser.data._id !== group.admin && (
              <span className="text-sm">
                Create by {admin.fullName} at{" "}
                {new Date(group.createdAt).toISOString().split("T")[0]}
              </span>
            )}

            {authUser.data._id === group.admin && (
              <p className="text-sm text-center">
                {imageUploading
                  ? "Uploading..."
                  : "Click the camera icon to update group photo"}
              </p>
            )}
          </div>

          {authUser.data._id === group.admin && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-6 items-center">
                <button
                  onClick={() => {
                    setShowAddUsers(true);
                  }}
                  className="btn btn-sm btn-primary"
                >
                  <UserPlus2 />
                  <span className="hidden lg:block">Add member</span>
                </button>
                <button
                  onClick={(e) => setIsUpdating(!isUpdating)}
                  className="btn btn-sm btn-primary "
                >
                  <Settings />
                  <span className="hidden lg:block">Settings</span>
                </button>
                <button
                  onClick={(e) => setShowGroupRequestsAdmin(true)}
                  className="relative flex items-center gap-2 btn btn-sm btn-primary"
                >
                  <div className="relative">
                    <BellPlusIcon />
                    {adminGroupRequests.length > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {adminGroupRequests.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:block">Requests</span>
                </button>
                <button
                  onClick={() => {
                    setShowDeleteWarning(true);
                  }}
                  className="btn btn-error  btn-sm"
                >
                  <LucideTrash2 />
                  <span className="hidden lg:block">Delete group</span>
                </button>
              </div>

              {isUpdating && (
                <div className="form-control space-y-4 mt-6">
                  <input
                    type="text"
                    value={formData.newName}
                    onChange={(e) =>
                      setFormData({ ...formData, newName: e.target.value })
                    }
                    className="input input-bordered w-full"
                    placeholder="Group Name"
                  />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input input-bordered w-full"
                    placeholder="Group Description"
                  />
                  <div className="flex flex-row items-center bg-base-100 btn no-animation justify-between mt-4">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs sm:text-lg">Visibility</span>
                      <p className="text-xs hidden lg:block">
                        (In private groups, only the admin can send and accept
                        requests to users.)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm">
                        {formData.visibility === "private"
                          ? "Private"
                          : "Public"}
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.visibility === "private"}
                        onChange={handleVisibilityToggle}
                        className="toggle xs:toggle-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 sm:mt-4 mt-8">
                    <button
                      onClick={() => setIsUpdating(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGroupInfoUpdate}
                      disabled={!validateSave}
                      className={`btn btn-primary ${
                        isLoading ? "loading bg-primary" : ""
                      }`}
                    >
                      {!isLoading && <span>Save</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {authUser.data._id !== group.admin &&
            group.visibility === "public" && (
              <div className="space-y-2r">
                <div className="flex justify-center gap-4 items-center">
                  <button
                    onClick={() => {
                      setShowAddUsers(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <UserPlus2 />
                    <span className="hidden lg:block">Add member</span>
                  </button>
                  <button
                    className={`btn btn-error btn-sm `}
                    onClick={() => {
                      setShowExitWarning(true);
                    }}
                  >
                    <LogOut />
                    <span className="hidden lg:block">Leave</span>
                  </button>
                </div>
              </div>
            )}

          {authUser.data._id !== group.admin &&
            group.visibility === "private" && (
              <div className="flex items-center justify-center">
                <button
                  className={` btn btn-error btn-sm `}
                  onClick={() => {
                    setShowExitWarning(true);
                  }}
                >
                  <LogOut />
                  <span className="hidden lg:block">Leave</span>
                </button>
              </div>
            )}

          <div className="border-t-2 border-base-100">
            <h2 className="text-lg font-medium mb-4 mt-8">
              Members ({group.members.length})
            </h2>
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member._id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.profilePic}
                      alt={member.fullName}
                      loading="lazy"
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <span className="text-sm font-medium">
                      {member.fullName}
                    </span>
                  </div>
                  {authUser.data._id === group.admin &&
                    member._id !== group.admin && (
                      <div className="flex relative">
                        {showAdminOptions === member._id && (
                          <button
                            className={`absolute right-10 top-2 sm:right-16 sm:top-2 btn btn-error btn-sm ${
                              isRemovingMember ? "loading bg-error" : ""
                            }`}
                            onClick={() => handleRemoveMember(member._id)}
                          >
                            {!isRemovingMember ? (
                              <>
                                <span className="hidden sm:block"> Remove</span>
                                <Trash2Icon className="block sm:hidden"/>
                              </>
                            ) : (
                              ""
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            toggleAdminOptions(member._id);
                          }}
                          className="btn  btn-ghost p-2"
                        >
                          <MoreVertical className="w-5 h-5 relative" />
                        </button>
                      </div>
                    )}

                  {authUser.data._id !== group.admin &&
                    member._id === group.admin && (
                      <span className="text-sm text-primary/90">Admin</span>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
