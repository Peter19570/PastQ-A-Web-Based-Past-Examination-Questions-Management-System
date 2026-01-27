import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { coursesService } from "../../services/courses";
import { pastQuestionsService } from "../../services/pastQuestions"; // Ensure this exists
import { Button } from "../../components/Common/Button";

export const CourseDetail = () => {
  const { code } = useParams<{ code: string }>();
  const [course, setCourse] = useState<any>(null);
  const [pastQuestions, setPastQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        // 1. Fetch the main course details
        const data = await coursesService.getByCode(code || "");
        setCourse(data);

        // 2. Fetch past questions linked to this specific course ID
        if (data?.id) {
          const pqData = await pastQuestionsService.getAll({
            course_id: data.id,
          });
          setPastQuestions(pqData.results || pqData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [code]);

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse text-gray-500">
        Loading Course Details...
      </div>
    );
  if (!course)
    return (
      <div className="p-20 text-center text-red-500">Course not found.</div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        to="/courses"
        className="flex items-center text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
      </Link>

      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {course.title}
            </h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg font-bold text-sm uppercase tracking-widest">
                {course.code}
              </span>
              <span className="text-gray-400">|</span>
              <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                <GraduationCap className="w-4 h-4 mr-2" />{" "}
                {course.faculty_display}
              </span>
            </div>
          </div>

          {/* We use encodeURIComponent to handle spaces and special characters in the title */}
          <Link
            to={`/past-questions?search=${encodeURIComponent(course.title)}`}
          >
            <Button size="lg" className="shadow-lg shadow-primary-500/20">
              <FileText className="w-5 h-5 mr-2" /> Questions (
              {course.past_question_count})
            </Button>
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Level
            </span>
            <span className="text-gray-900 dark:text-white font-bold text-lg">
              {course.level} {/* Level bug fixed here */}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Semester
            </span>
            <span className="text-gray-900 dark:text-white font-bold text-lg">
              {course.semester_display}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Credits
            </span>
            <span className="text-gray-900 dark:text-white font-bold text-lg">
              {course.credit_hours} Units
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Status
            </span>
            <span
              className={`font-bold text-lg ${course.is_active ? "text-green-500" : "text-red-500"}`}
            >
              {course.is_active ? "Active" : "Archived"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Description */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-3 text-primary-500" /> Course
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {course.description || "No description provided for this course."}
            </p>
          </section>

          {/* Past Questions List Section */}
          <section>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Past Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastQuestions.length > 0 ? (
                pastQuestions.map((pq) => (
                  <Link
                    key={pq.id}
                    to={`/past-questions/${pq.id}`}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary-500 transition-all flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                          {pq.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pq.year} • {pq.semester_display}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500" />
                  </Link>
                ))
              ) : (
                <div className="col-span-2 p-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
                  <p className="text-gray-500 italic">
                    No past questions uploaded for this course yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Metadata
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {course.department}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Added by</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {course.created_by_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
