import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Calendar, User, Eye } from 'lucide-react';
import { PastQuestion } from '../../services/pastQuestions';
import { formatDateTime, formatFileSize } from '../../utils/helpers'; 

interface PastQuestionCardProps {
  pastQuestion: PastQuestion;
  showActions?: boolean;
  onDownload?: (id: number) => void;
}

export const PastQuestionCard = ({
  pastQuestion,
  showActions = true,
  onDownload,
}: PastQuestionCardProps) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDownload) {
      onDownload(pastQuestion.id);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {/* FIX: Accessing .id and .code specifically. 
                  React cannot render the whole 'course' object. 
              */}
              <Link
                to={`/courses/${pastQuestion.course.id}`}
                className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {pastQuestion.course.code || "Course Info"}
              </Link>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {pastQuestion.title}
            </h3>
            {pastQuestion.course_title && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {pastQuestion.course_title}
              </p>
            )}
          </div>
          
          {/* Status Badges */}
          {pastQuestion.status === 'pending' && (
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
              Pending
            </span>
          )}
          {pastQuestion.status === 'approved' && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
              Approved
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{pastQuestion.year}</span>
            </div>
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              {pastQuestion.semester}
            </span>
            {pastQuestion.file_size && (
              <span className="text-xs text-gray-500">
                {formatFileSize(pastQuestion.file_size)}
              </span>
            )}
          </div>

          {pastQuestion.uploader_name && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span>{pastQuestion.uploader_name}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Download className="h-4 w-4" />
            <span>{pastQuestion.download_count || 0} downloads</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 italic">
            Uploaded: {formatDateTime(pastQuestion.created_at)}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to={`/past-questions/${pastQuestion.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View
            </Link>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  );
};