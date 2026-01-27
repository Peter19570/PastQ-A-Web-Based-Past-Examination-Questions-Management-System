import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { pastQuestionsService } from "../../services/pastQuestions";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import { PageLoader } from "../../components/Common/Loader";
import { formatDateTime } from "../../utils/helpers";
import { Modal } from "../../components/Common/Modal";

export const AdminDashboard = () => {
  const [pendingUploads, setPendingUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPendingUploads();
  }, []);

  const fetchPendingUploads = async () => {
    try {
      const data = await pastQuestionsService.getPending();
      // FIX 1: Extract the array from the Django 'results' object
      const results = Array.isArray(data) ? data : data.results;
      setPendingUploads(results || []);
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
      // Hits: POST /past-questions/{id}/approve/
      await pastQuestionsService.approve(id);
      showToast("success", "Past question approved successfully");
      setPendingUploads((prev) => prev.filter((item) => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
      showToast("error", "Failed to approve past question");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(true);
    try {
      // Hits: POST /past-questions/{id}/reject/
      await pastQuestionsService.reject(id, "Does not meet quality standards");
      showToast("success", "Past question rejected");
      setPendingUploads((prev) => prev.filter((item) => item.id !== id));
      setSelectedItem(null);
    } catch (error) {
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

      {/* Stats Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border-l-4 border-yellow-500">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Pending Approvals
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-bold text-lg">{pendingUploads.length}</span>{" "}
          upload{pendingUploads.length !== 1 ? "s" : ""} waiting for review
        </p>
      </div>

      {pendingUploads.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {pendingUploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-100 dark:border-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">
                      Pending
                    </span>
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-bold">
                      {/* FIX 2: Check if course is an object before rendering */}
                      {typeof upload.course === "object"
                        ? upload.course.code
                        : upload.course}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {upload.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span>Year: {upload.year}</span>
                    <span>Semester: {upload.semester}</span>
                    <span>By: {upload.uploader_name || "Anonymous"}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(upload)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(upload.id)}
                    disabled={actionLoading}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(upload.id)}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold text-gray-400">Queue Clear!</h3>
          <p className="text-gray-500">No pending uploads to review.</p>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Review Upload"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="text-lg font-bold mb-4">{selectedItem.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <span className="text-gray-500">Course Code:</span>{" "}
                  <span className="font-bold">
                    {typeof selectedItem.course === "object"
                      ? selectedItem.course.code
                      : selectedItem.course}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Course Title:</span>{" "}
                  <span className="font-bold">
                    {selectedItem.course?.title || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Uploader:</span>{" "}
                  <span className="font-bold">
                    {selectedItem.uploader_name}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Date:</span>{" "}
                  <span className="font-bold">
                    {formatDateTime(selectedItem.created_at)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                onClick={() => handleApprove(selectedItem.id)}
                disabled={actionLoading}
                className="bg-green-600 text-white"
              >
                Approve Now
              </Button>
              <Button
                variant="danger"
                onClick={() => handleReject(selectedItem.id)}
                disabled={actionLoading}
              >
                Reject Upload
              </Button>
              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
