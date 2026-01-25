import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import {
  pastQuestionsService,
  PastQuestion,
} from "../../services/pastQuestions";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { PageLoader } from "../../components/Common/Loader";
import { formatDateTime } from "../../utils/helpers";
import { Modal } from "../../components/Common/Modal";

export const AdminDashboard = () => {
  const [pendingUploads, setPendingUploads] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PastQuestion | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const fetchPendingUploads = async () => {
    try {
      const data = await pastQuestionsService.getPending();
      setPendingUploads(data.results || data);
    } catch (error) {
      console.error("Failed to fetch pending uploads:", error);
      showToast("error", "Failed to fetch pending uploads");
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
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to approve:", error);
      showToast("error", "Failed to approve past question");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(true);
    try {
      await pastQuestionsService.reject(id, "Does not meet quality standards");
      showToast("success", "Past question rejected");
      setPendingUploads((prev) => prev.filter((item) => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to reject:", error);
      showToast("error", "Failed to reject past question");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and manage pending past question uploads
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Pending Approvals
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {pendingUploads.length} upload{pendingUploads.length !== 1 ? "s" : ""}{" "}
          waiting for review
        </p>
      </div>

      {pendingUploads.length > 0 ? (
        <div className="space-y-4">
          {pendingUploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                      Pending
                    </span>
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                      {upload.course}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {upload.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Year: {upload.year}</span>
                    <span>Semester: {upload.semester}</span>
                    <span>Uploaded: {formatDateTime(upload.created_at)}</span>
                    {upload.uploader_name && (
                      <span>By: {upload.uploader_name}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(upload)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(upload.id)}
                    disabled={actionLoading}
                    className="gap-2 bg-success-600 hover:bg-success-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(upload.id)}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <CheckCircle className="h-16 w-16 text-success-600 dark:text-success-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            All caught up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no pending uploads to review at the moment.
          </p>
        </div>
      )}

      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Review Upload"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {selectedItem.title}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Course:</span>{" "}
                  {selectedItem.course}
                  {selectedItem.course_title &&
                    ` - ${selectedItem.course_title}`}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Year:</span> {selectedItem.year}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Semester:</span>{" "}
                  {selectedItem.semester}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Uploaded by:</span>{" "}
                  {selectedItem.uploader_name || "Unknown"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Date:</span>{" "}
                  {formatDateTime(selectedItem.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleApprove(selectedItem.id)}
                loading={actionLoading}
                className="gap-2 bg-success-600 hover:bg-success-700"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReject(selectedItem.id)}
                loading={actionLoading}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
