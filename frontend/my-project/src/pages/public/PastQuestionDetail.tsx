import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  Calendar,
  User,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  File,
} from "lucide-react";
import {
  pastQuestionsService,
  PastQuestion,
} from "../../services/pastQuestions";
import { formatDateTime, formatFileSize } from "../../utils/helpers";
import { toast } from "react-hot-toast";

export const PastQuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<PastQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        if (id) {
          const data = await pastQuestionsService.getById(Number(id));
          setQuestion(data);
        }
      } catch (error) {
        toast.error("Failed to load question details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading)
    return <div className="flex justify-center p-20">Loading...</div>;
  if (!question)
    return <div className="text-center p-20">Question not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-bold rounded-full">
                  {question.course.code}
                </span>
                {question.status === "approved" && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 text-sm font-medium rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {question.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {question.course.title}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-semibold shadow-md">
                <Download className="h-5 w-5" />
                Download PDF
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                <ExternalLink className="h-5 w-5" />
                Preview Online
              </button>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700 my-8" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Question Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Year / Semester
                    </p>
                    <p className="font-medium">
                      {question.year} — {question.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <File className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">File Size</p>
                    <p className="font-medium">
                      {formatFileSize(question.file_size)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                Uploader Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Uploaded By
                    </p>
                    <p className="font-medium">
                      {question.uploader_name || "Community Member"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Upload Date
                    </p>
                    <p className="font-medium">
                      {formatDateTime(question.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500">
            Total Downloads:{" "}
            <span className="font-bold text-primary-600">
              {question.download_count}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
