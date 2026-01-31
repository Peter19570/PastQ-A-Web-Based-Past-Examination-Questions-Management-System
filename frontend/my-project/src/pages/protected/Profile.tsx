import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Award,
  Upload as UploadIcon,
  Download,
  Edit2,
  Key,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth";
import { useToast } from "../../components/Common/Toast";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";
import { Modal } from "../../components/Common/Modal";

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
}

interface PasswordForm {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  const newPassword = watch("new_password");

  const onProfileSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await authService.updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
      });
      await refreshUser();
      showToast("success", "Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast("error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setLoading(true);
    try {
      await authService.changePassword({
        old_password: data.old_password,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      showToast("success", "Password changed successfully");
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error: any) {
      console.error("Failed to change password:", error);
      const message =
        error.response?.data?.detail || "Failed to change password";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Uploads",
      value: user?.upload_count || 0,
      icon: UploadIcon,
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-100 dark:bg-primary-900",
    },
    {
      title: "Downloads",
      value: user?.download_count || 0,
      icon: Download,
      color: "text-success-600 dark:text-success-400",
      bgColor: "bg-success-100 dark:bg-success-900",
    },
    {
      title: "Reputation",
      value: user?.reputation_score || 0,
      icon: Award,
      color: "text-accent-grape",
      bgColor: "bg-accent-banana/20",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center"
          >
            <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-3`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
              <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
          </div>
          {!editMode && (
            <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        <form
          onSubmit={handleProfileSubmit(onProfileSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              disabled={!editMode}
              error={profileErrors.first_name?.message}
              {...registerProfile("first_name", {
                required: "First name is required",
              })}
            />
            <Input
              label="Last Name"
              disabled={!editMode}
              error={profileErrors.last_name?.message}
              {...registerProfile("last_name", {
                required: "Last name is required",
              })}
            />
          </div>

          <Input
            label="Email"
            type="email"
            disabled
            {...registerProfile("email")}
            helperText="Email cannot be changed"
          />

          {user?.is_staff && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-300">
                Admin Account
              </p>
            </div>
          )}

          {editMode && (
            <div className="flex gap-4">
              <Button type="submit" loading={loading}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={() => setShowPasswordModal(true)}
            className="gap-2"
          >
            <Key className="h-4 w-4" />
            Change Password
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          resetPasswordForm();
        }}
        title="Change Password"
      >
        <form
          onSubmit={handlePasswordSubmit(onPasswordSubmit)}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            error={passwordErrors.old_password?.message}
            {...registerPassword("old_password", {
              required: "Current password is required",
            })}
          />

          <Input
            label="New Password"
            type="password"
            error={passwordErrors.new_password?.message}
            helperText="At least 8 characters with uppercase, lowercase, and number"
            {...registerPassword("new_password", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain uppercase, lowercase, and number",
              },
            })}
          />

          <Input
            label="Confirm New Password"
            type="password"
            error={passwordErrors.confirm_password?.message}
            {...registerPassword("confirm_password", {
              required: "Please confirm your password",
              validate: (value) =>
                value === newPassword || "Passwords do not match",
            })}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={loading}>
              Change Password
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                resetPasswordForm();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
