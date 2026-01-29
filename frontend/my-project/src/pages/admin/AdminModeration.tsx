import { useState, useEffect, useMemo } from "react";
import {
  Check,
  X,
  FileText,
  Search,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { pastQuestionsService } from "../../services/pastQuestions";
import { useToast } from "../../components/Common/Toast";
import { PageLoader } from "../../components/Common/Loader";

export const AdminModeration = () => {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { showToast } = useToast();

  const fetchPending = async () => {
    try {
      // Hits: GET /past-questions/pending/
      const data = await pastQuestionsService.getPending();
      const results = data.results || data;
      setPendingItems(Array.isArray(results) ? results : []);
    } catch (error) {
      showToast("error", "Failed to sync moderation queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await pastQuestionsService.approve(id);
      } else {
        await pastQuestionsService.reject(id, {
          rejection_reason: "Information incomplete or file unreadable",
        });
      }

      showToast("success", `Question ${action}ed successfully`);
      // Optimistic UI update to make it feel fast
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      showToast("error", `Failed to ${action} question`);
    }
  };

  // --- SEARCH FILTERING ---
  const filteredItems = useMemo(() => {
    return pendingItems.filter((item) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchStr) ||
        item.course?.code?.toLowerCase().includes(searchStr) ||
        item.uploader_name?.toLowerCase().includes(searchStr)
      );
    });
  }, [pendingItems, searchQuery]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* HEADER & SEARCH SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Clock className="text-amber-500 w-6 h-6" /> Moderation Queue
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {filteredItems.length} Submissions Awaiting Approval
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, code or student..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 ring-primary-500/20 focus:border-primary-500 transition-all dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map((item: any) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400">
                      <BookOpen className="w-3 h-3" />{" "}
                      {item.course?.code || "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <User className="w-3 h-3" />{" "}
                      {item.uploader_name || "Anonymous Student"}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                      Level {item.level || "---"} • {item.year || "---"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Mobile Friendly Wrapper */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => handleAction(item.id, "approve")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all shrink-0"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => handleAction(item.id, "reject")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 text-red-600 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shrink-0"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !loading && (
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">
              Queue Clear
            </h3>
            <p className="text-slate-500 text-sm font-medium">
              All submissions have been processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
