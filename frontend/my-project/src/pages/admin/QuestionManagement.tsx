import { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  BookOpen,
} from "lucide-react";
import { pastQuestionsService } from "../../services/pastQuestions";
import { Button } from "../../components/Common/Button";
import { Modal } from "../../components/Common/Modal";
import { PageLoader } from "../../components/Common/Loader";
import { useToast } from "../../components/Common/Toast";

export const QuestionManagement = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await pastQuestionsService.getAll();
      const results = Array.isArray(data) ? data : data.results;
      setQuestions(results || []);
    } catch (err) {
      showToast("error", "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // --- SEARCH FILTERING LOGIC ---
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        q.title?.toLowerCase().includes(searchStr) ||
        q.course_code?.toLowerCase().includes(searchStr) ||
        q.course?.title?.toLowerCase().includes(searchStr)
      );
    });
  }, [questions, searchQuery]);

  const handleApprove = async (id: number) => {
    try {
      await pastQuestionsService.approve(id);
      showToast("success", "Question approved and uploader rewarded!");
      loadQuestions();
    } catch (err) {
      showToast("error", "Approval failed");
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Reason for rejection?");
    if (reason === null) return;
    try {
      await pastQuestionsService.reject(id, { rejection_reason: reason });
      showToast("success", "Question rejected");
      loadQuestions();
    } catch (err) {
      showToast("error", "Rejection failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Delete this question forever?")) {
      try {
        await pastQuestionsService.delete(id);
        showToast("success", "Deleted successfully");
        loadQuestions();
      } catch (err) {
        showToast("error", "Deletion failed");
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await pastQuestionsService.partialUpdate(editingQuestion.id, {
        title: editingQuestion.title,
        year: editingQuestion.year,
        semester: editingQuestion.semester,
      });
      showToast("success", "Metadata updated!");
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      showToast("error", "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
            Past Question Management
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {filteredQuestions.length} Total Submissions
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or title..."
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-4">Submission</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredQuestions.map((q) => (
                <tr
                  key={q.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-black text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
                        {q.title}
                      </span>
                      <span className="text-[10px] font-bold text-primary-600 uppercase">
                        ID: #{q.id}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {q.year}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> {q.semester}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                        q.status === "approved"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30"
                          : q.status === "rejected"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      {q.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(q.id)}
                            className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(q.id)}
                            className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingQuestion(q)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      <Modal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        title="Edit Metadata"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">
              Title
            </label>
            <input
              required
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
              value={editingQuestion?.title || ""}
              onChange={(e) =>
                setEditingQuestion({
                  ...editingQuestion,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Year
              </label>
              <input
                type="number"
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                value={editingQuestion?.year || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    year: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">
                Semester
              </label>
              <select
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                value={editingQuestion?.semester || ""}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    semester: e.target.value,
                  })
                }
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Summer">Summer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              disabled={isSubmitting}
              type="submit"
              className="flex-1 bg-primary-600 text-white font-bold"
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setEditingQuestion(null)}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
