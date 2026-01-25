import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Common/Toast";
import { Input } from "../../components/Common/Input";
import { Button } from "../../components/Common/Button";

interface LoginForm {
  index_number: string;
  password: string;
}

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data);
      showToast("success", "Login successful!");
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? "Invalid email or password"
          : "Failed to login. Please try again.";
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
            <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back to PastQ
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="Index Number"
              placeholder="e.g. 20240001"
              error={errors.index_number?.message}
              {...register("index_number", {
                required: "Index number is required",
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
