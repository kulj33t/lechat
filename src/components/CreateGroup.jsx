import { Loader, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useGroupConfigStore } from "../store/useGroupConfigStore";
import { useGroupChatStore } from "../store/useGroupChatStore";

const CreateGroup = ({ onClose }) => {
  const [name, setName] = useState("");
  const [creationLoading, setCreationLoading] = useState(false);
  const { createGroup } = useGroupConfigStore();
  const { setShowInfo } = useGroupChatStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreationLoading(true);
    if (!name.trim()) {
      setCreationLoading(false);
      return toast.error("Group name is required");
    }
    if (name.length > 15) {
      setCreationLoading(false);
      return toast.error("Group name cannot be greater than 15 characters");
    }
    try {
      await createGroup(name);
      setName("");
      onClose();
      setShowInfo(false);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setCreationLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black opacity-50 z-10"></div>

      <div className="fixed inset-0 z-20 flex items-center justify-center">
        <div className="bg-base-300 p-6 rounded-lg shadow-lg w-96 relative">
          <button
            className="absolute top-2 right-2 btn btn-ghost btn-circle"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text">Group Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Enter group name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!name.trim() || creationLoading}
            >
              {creationLoading ? (
                <>
                  <Loader className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateGroup;
