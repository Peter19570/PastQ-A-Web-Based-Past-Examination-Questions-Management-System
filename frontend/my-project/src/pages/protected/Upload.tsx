import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Upload as UploadIcon,
  FileText,
  X,
  ChevronDown,
  Check,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { pastQuestionsService } from "../../services/pastQuestions";
import { coursesService, Course } from "../../services/courses";
import { useToast } from "../../components/Common/Toast";
import { Button } from "../../components/Common/Button";
import {
  SEMESTERS,
  YEARS,
  MAX_FILE_SIZE,
  EXAM_TYPES,
} from "../../utils/constants";
import { formatFileSize } from "../../utils/helpers";

interface UploadForm {
  course_id: number;
  year: number;
  semester: string;
  exam_type: string;
  title: string;
  file: File;
  lecturer?: string;
  has_solutions: boolean;
  is_scanned: boolean;
}

export const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UploadForm>({
    defaultValues: {
      has_solutions: false,
      is_scanned: false,
    },
  });

  const selectedCourseId = watch("course_id");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesService.getAll({ search: searchQuery });
        setCourses(data.results || data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    const timer = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast(
          "error",
          `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`,
        );
        return;
      }
      setFile(selectedFile);
    }
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) return showToast("error", "Please select a file to upload");

    setLoading(true);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      await pastQuestionsService.upload({
        ...data,
        file: file, // Injecting the file state into the data object
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      showToast(
        "success",
        "Past question uploaded successfully! Pending approval.",
      );
      reset();
      setFile(null);
      setSearchQuery("");
      setTimeout(() => navigate("/my-uploads"), 1500);
    } catch (error) {
      clearInterval(progressInterval);
      showToast("error", "Failed to upload past question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Past Question
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your past questions with the community
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* COURSE SEARCH WHEEL */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search course code (e.g., CSC101)"
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                autoComplete="off"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
              />
              <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {isDropdownOpen && (
              <ul className="absolute z-50 w-full mt-2 max-h-60 overflow-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <li
                      key={course.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition-colors border-b last:border-0 border-gray-100 dark:border-gray-800"
                      onClick={() => {
                        setValue("course_id", course.id); // Passing course_id as expected by backend
                        setSearchQuery(`${course.code} - ${course.title}`);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div>
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          {course.code}
                        </span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                          {course.title}
                        </span>
                      </div>
                      {selectedCourseId === course.id && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-3 text-sm text-gray-500">
                    No courses found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* TITLE & LECTURER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                placeholder="e.g. Final Examination 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lecturer (Optional)
              </label>
              <div className="relative">
                <input
                  {...register("lecturer")}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                  placeholder="Dr. Smith"
                />
                <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* EXAM DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                Year
              </label>
              <select
                {...register("year", { required: "Year required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none appearance-none"
              >
                <option value="">Select year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                Semester
              </label>
              <select
                {...register("semester", { required: "Semester required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none appearance-none"
              >
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
                Exam Type
              </label>
              <div className="relative">
                <select
                  {...register("exam_type", { required: "Type required" })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select type</option>
                  {EXAM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {/* This adds that little dropdown arrow back since we used 'appearance-none' */}
                <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.exam_type && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.exam_type.message}
                </p>
              )}
            </div>
          </div>

          {/* OPTIONAL SWITCHES */}
          <div className="flex flex-wrap gap-6 py-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("has_solutions")}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contains Solutions
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_scanned")}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Scanned Copy
              </span>
            </label>
          </div>

          {/* FILE UPLOAD AREA (RESTORED VERSION) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-tight">
              File Attachment
            </label>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-primary-500 transition-all bg-gray-50 dark:bg-gray-900/30 group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <UploadIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-primary-600">
                      Click to browse
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    PDF, JPEG, or PNG (Limit: {formatFileSize(MAX_FILE_SIZE)})
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* PROGRESS BAR */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase">
                <span>Sending to server...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-4 text-lg font-bold rounded-xl shadow-lg shadow-primary-500/20"
            loading={loading}
            disabled={!file || !selectedCourseId}
          >
            <UploadIcon className="h-5 w-5 mr-2" />
            Finish & Upload Question
          </Button>
        </form>
      </div>
    </div>
  );
};
