import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Download, Award, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/Common/Button";
import { authService } from "../../services/auth";

export const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getFreshStats = async () => {
      try {
        const response = await authService.getProfile();
        const userData = (response as any).user || response;
        setUser(userData);
      } catch (error) {
        console.error("Failed to sync dashboard stats:", error);
      }
    };
    getFreshStats();
  }, [setUser]);

  const stats = [
    {
      title: "Total Uploads",
      // Match the backend key from your Postman screenshot
      value: user?.upload_count || 0,
      icon: Upload,
      color: "text-primary-600 dark:text-primary-400",
      bgColor: "bg-primary-100 dark:bg-primary-900",
    },
    {
      title: "Total Downloads",
      // Match the backend key from your Postman screenshot
      value: user?.download_count || 0,
      icon: Download,
      color: "text-success-600 dark:text-success-400",
      bgColor: "bg-success-100 dark:bg-success-900",
    },
    {
      title: "Reputation",
      // Match the backend key from your Postman screenshot
      value: user?.reputation_score || 0,
      icon: Award,
      color: "text-accent-grape",
      bgColor: "bg-accent-banana/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.first_name || "Student"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your activity on PastQ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 font-medium">
              {stat.title}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
              <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Upload Past Questions
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Share your past questions with the community and earn reputation
            points.
          </p>
          <Button onClick={() => navigate("/upload")} className="w-full">
            Upload Now
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900">
              <FileText className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              My Uploads
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            View and manage all your uploaded past questions.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("/my-uploads")}
            className="w-full"
          >
            View Uploads
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <FileText className="h-6 w-6" />
            Browse Courses
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/past-questions")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Download className="h-6 w-6" />
            Past Questions
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Award className="h-6 w-6" />
            My Profile
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/upload")}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Upload className="h-6 w-6" />
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};
