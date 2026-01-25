import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Common/Toast";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";

// Updated interface to match Django Serializer
interface RegisterForm {
  index_number: string;
  email: string;
  password: string;
  confirm_password: string; 
}

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      // Data payload now matches your backend serializer exactly
      await registerUser({
        email: data.email,
        index_number: data.index_number,
        password: data.password,
        confirm_password: data.confirm_password,
      });
      showToast("success", "Account created successfully!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? "Registration failed. Email or Index Number may already be in use."
          : "Failed to create account. Please try again.";
      showToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
            <UserPlus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join PastQ
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create an account to start uploading and downloading
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Replaced First/Last Name with Index Number */}
            <Input
              label="Index Number"
              placeholder="e.g. 20240001"
              error={errors.index_number?.message}
              {...register("index_number", {
                required: "Index number is required",
              })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              helperText="At least 8 characters with uppercase, lowercase, and number"
              {...register("password", {
                required: "Password is required",
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
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirm_password?.message}
              {...register("confirm_password", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
