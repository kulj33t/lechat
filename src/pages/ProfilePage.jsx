import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Lock,
  Mail,
  User,
  Tag,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import ChangePasswordContainer from "../components/ChangePasswordContainer";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, updatePrivacy } =
    useAuthStore();
  const [showChangePass, setShowChangePass] = useState(false);
  const [privacy, setPrivacy] = useState(authUser?.data.privacy);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  const handleImageUpload = async (e) => {
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
      await updateProfile({ profilePic: base64Image });
    };
  };

  const togglePrivacy = async () => {
    setUpdatingPrivacy(true);
    try {
      await updatePrivacy(!privacy);
      setPrivacy(!privacy);
    } catch (error) {
      toast.error(error?.message);
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  return (
    <div className="h-auto pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={authUser.data.profilePic}
                alt="Profile"
                loading="lazy"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm">
              {isUpdatingProfile
                ? "Uploading..."
                : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.data.fullName}
              </p>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Username
                </div>
                <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                  {authUser?.data.username}
                </p>{" "}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
                {authUser?.data.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowChangePass(!showChangePass)}
            className="w-full bg-base-300 hover:bg-base-300 text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2 ">
              <Lock className="w-4 h-4 text-base-400" />
              Change Password
            </div>
            {showChangePass ? (
              <ChevronUp className="w-4 h-4 text-base-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-base-400" />
            )}
          </button>

          {showChangePass && <ChangePasswordContainer />}
          <div className="flex flex-row items-center bg-base-100 btn no-animation justify-between mt-4">
            <div className="flex gap-2 items-center">
              <span className="text-xs sm:text-lg">Visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm">
                {privacy ? "Private" : "Public"}
              </span>
              <input
                type="checkbox"
                checked={privacy}
                onChange={togglePrivacy}
                className={` ${updatingPrivacy?"loading bg-primary btn btn-primary btn-sm ":"toggle xs:toggle-xs"}`}
              />
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.data.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
