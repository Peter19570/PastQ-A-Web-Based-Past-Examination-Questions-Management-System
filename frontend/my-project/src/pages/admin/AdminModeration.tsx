import { useState, useEffect } from "react";
import { Check, X, FileText } from "lucide-react";
import { pastQuestionsService } from "../../services/pastQuestions";
import { toast } from "react-hot-toast";

export const AdminModeration = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      // Hits: GET /past-questions/pending/
      const data = await pastQuestionsService.getPending();
      setPendingItems(data.results || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      // Hits: POST /past-questions/{id}/approve/ or /reject/
      if (action === "approve") await pastQuestionsService.approve(id);
      else await pastQuestionsService.reject(id);

      toast.success(`Question ${action}d successfully`);
      fetchPending(); // Refresh list
    } catch (error) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Moderation Queue</h1>

      <div className="grid grid-cols-1 gap-4">
        {pendingItems.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-lg">
                <FileText />
              </div>
              <div>
                <h3 className="font-bold dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {item.course.code} • Uploaded by {item.uploader_name}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(item.id, "approve")}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => handleAction(item.id, "reject")}
                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
        {pendingItems.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-10">
            Queue is empty. Good job!
          </p>
        )}
      </div>
    </div>
  );
};
