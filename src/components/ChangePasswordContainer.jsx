import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ChangePasswordContainer = () => {
  const { isUpdatingPassword, updatePassword } = useAuthStore();
  const [showContainer, setShowContainer] = useState(true);
  const [formData, setFormData] = useState({
    currPass: "",
    newPass: "",
    confirmPass: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currPass: false,
    newPass: false,
    confirmPass: false,
  });

  const handlePasswordChange = async () => {
    if (formData.newPass !== formData.confirmPass) {
      toast.error("Passwords do not match.");
      return;
    }
    const res = await updatePassword({
      currPass: formData.currPass,
      newPass: formData.newPass,
    });
    console.log("Password", res);
    if (res.status === 200) {
      setShowContainer(false);
      setFormData({
        currPass: "",
        newPass: "",
        confirmPass: "",
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  if (!showContainer) return null;

  return (
    <div className="space-y-5 mt-4">
      <div className="relative">
        <input
          type={passwordVisibility.currPass ? "text" : "password"}
          className="px-4 py-3 bg-base-200 rounded-lg border w-full"
          placeholder="Existing Password"
          value={formData.currPass}
          onChange={(e) =>
            setFormData({ ...formData, currPass: e.target.value })
          }
        />
        <div
          className="absolute right-4 top-3 cursor-pointer"
          onClick={() => togglePasswordVisibility("currPass")}
        >
          {passwordVisibility.currPass ? <Eye /> : <EyeOff />}
        </div>
      </div>

      <div className="relative">
        <input
          type={passwordVisibility.newPass ? "text" : "password"}
          className="px-4 py-3 bg-base-200 rounded-lg border w-full"
          placeholder="New Password"
          value={formData.newPass}
          onChange={(e) =>
            setFormData({ ...formData, newPass: e.target.value })
          }
        />
        <div
          className="absolute right-4 top-3 cursor-pointer"
          onClick={() => togglePasswordVisibility("newPass")}
        >
          {passwordVisibility.newPass ? <Eye /> : <EyeOff />}
        </div>
      </div>

      <div className="relative">
        <input
          type={passwordVisibility.confirmPass ? "text" : "password"}
          className="px-4 py-3 bg-base-200 rounded-lg border w-full"
          placeholder="Confirm New Password"
          value={formData.confirmPass}
          onChange={(e) =>
            setFormData({ ...formData, confirmPass: e.target.value })
          }
        />
        <div
          className="absolute right-4 top-3 cursor-pointer"
          onClick={() => togglePasswordVisibility("confirmPass")}
        >
          {passwordVisibility.confirmPass ? <Eye /> : <EyeOff />}
        </div>
      </div>

      <button
        className="btn btn-primary px-6 py-3 rounded-lg mt-6 flex items-center justify-center w-full"
        onClick={handlePasswordChange}
        disabled={isUpdatingPassword}
      >
        {isUpdatingPassword ? (
          <>
            <Loader className="animate-spin w-4 h-4 mr-2" />
            Saving...
          </>
        ) : (
          "Change Password"
        )}
      </button>
    </div>
  );
};

export default ChangePasswordContainer;
