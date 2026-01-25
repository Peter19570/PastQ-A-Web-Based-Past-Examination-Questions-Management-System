import { Link } from "react-router-dom";
import { BookOpen, Mail, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                PastQ
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Your one-stop platform for accessing and sharing university past
              questions. Study smarter, perform better.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/courses"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/past-questions"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Past Questions
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  Upload
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="mailto:support@pastq.com"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            {new Date().getFullYear()} PastQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
