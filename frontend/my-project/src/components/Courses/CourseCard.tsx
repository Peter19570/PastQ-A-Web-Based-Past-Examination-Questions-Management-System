import { Link } from 'react-router-dom';
import { BookOpen, FileText } from 'lucide-react';
import { Course } from '../../services/courses';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link
      to={`/courses/${course.code}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                {course.code}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Department:</span> {course.department}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Faculty:</span> {course.faculty}
          </p>
          {course.credit_hours && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Credits:</span> {course.credit_hours}
            </p>
          )}
        </div>

        {course.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <FileText className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {course.past_questions_count || 0} Past Questions
          </span>
        </div>
      </div>
    </Link>
  );
};
