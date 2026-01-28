import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { pastQuestionsService } from "../../services/pastQuestions";
import { coursesService } from "../../services/courses";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { PageLoader } from "../../components/Common/Loader";
import { Modal } from "../../components/Common/Modal"; // Ensure this import exists

export const AdminDashboard = () => {
  const [pendingUploads, setPendingUploads] = useState<any[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection Modal States
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { showToast } = useToast();
  const navigate = useNavigate();

  const commonErrors = [
    "Blurry or unreadable file",
    "Duplicate of an existing file",
    "Incorrect course or level",
    "Incomplete question set",
    "Contains prohibited content",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pendingData, coursesData] = await Promise.all([
        pastQuestionsService.getPending(),
        coursesService.getAll(),
      ]);

      const pendingList = Array.isArray(pendingData)
        ? pendingData
        : pendingData.results;
      const coursesList = Array.isArray(coursesData)
        ? coursesData
        : coursesData.results;

      setPendingUploads(pendingList || []);
      setTotalCourses(coursesList?.length || 0);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      showToast("error", "Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await pastQuestionsService.approve(id);
      showToast("success", "Past question approved successfully");
      setPendingUploads((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      showToast("error", "Failed to approve past question");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectionReason) return;

    setActionLoading(true);
    try {
      await pastQuestionsService.reject(rejectId, {
        rejection_reason: rejectionReason,
      });

      showToast("success", "Past question rejected");
      setPendingUploads((prev) => prev.filter((item) => item.id !== rejectId));
      setRejectId(null);
      setRejectionReason("");
    } catch (error) {
      showToast("error", "Failed to reject past question");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
          System Control
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Review and manage the platform database activity.
        </p>
      </div>

      {/* --- STAT CARDS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Total Courses
              </p>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white">
                {totalCourses}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-2xl border shadow-md transition-all ${
            pendingUploads.length > 0
              ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Pending Review
              </p>
              <h3
                className={`text-4xl font-black ${pendingUploads.length > 0 ? "text-amber-600" : "text-gray-900 dark:text-white"}`}
              >
                {pendingUploads.length}
              </h3>
            </div>
            <div
              className={`p-3 rounded-xl ${pendingUploads.length > 0 ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}
            >
              {pendingUploads.length > 0 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <Clock className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-primary-600 p-6 rounded-2xl border border-primary-500 shadow-lg shadow-primary-500/20 text-white flex flex-col justify-center">
          <h4 className="font-bold text-lg leading-tight uppercase tracking-tighter">
            Admin Active
          </h4>
          <p className="text-primary-100 text-[10px] mt-1 font-bold">
            System integrity verified.
          </p>
        </div>
      </div>

      {/* --- MODERATION QUEUE --- */}
      {pendingUploads.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
              Pending Queue
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {pendingUploads.map((upload) => (
              <div
                key={upload.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                      Needs Review
                    </span>
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-bold">
                      {typeof upload.course === "object"
                        ? upload.course.code
                        : upload.course}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {upload.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>Year: {upload.year}</span>
                    <span>Semester: {upload.semester}</span>
                    <span>Uploader: {upload.uploader_name || "Anonymous"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/past-questions/${upload.id}`)}
                    className="gap-2 font-bold text-xs"
                  >
                    <Eye className="h-4 w-4" /> VIEW FILE
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(upload.id)}
                    disabled={actionLoading}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                  >
                    <CheckCircle className="h-4 w-4" /> APPROVE
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejectId(upload.id)} // Opens the modal
                    disabled={actionLoading}
                    className="font-bold text-xs"
                  >
                    <XCircle className="h-4 w-4" /> REJECT
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-20 text-center shadow-sm">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-gray-400 uppercase tracking-tighter">
            Queue Clear
          </h3>
          <p className="text-gray-500 font-medium">
            All uploads have been processed.
          </p>
        </div>
      )}

      {/* --- REJECTION MODAL --- */}
      <Modal
        isOpen={!!rejectId}
        onClose={() => {
          setRejectId(null);
          setRejectionReason("");
        }}
        title="Reject Upload"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Select a common error or type a custom reason below:
          </p>

          <div className="grid grid-cols-1 gap-2">
            {commonErrors.map((error) => (
              <button
                key={error}
                onClick={() => setRejectionReason(error)}
                className={`text-left p-3 text-xs font-bold rounded-xl border transition-all ${
                  rejectionReason === error
                    ? "bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900/20"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {error}
              </button>
            ))}
          </div>

          <textarea
            className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white outline-none focus:border-primary-500 transition-all"
            placeholder="Or type a custom reason for the student..."
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleReject}
              disabled={actionLoading || !rejectionReason}
            >
              {actionLoading ? "Processing..." : "Confirm Rejection"}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 font-bold"
              onClick={() => {
                setRejectId(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
