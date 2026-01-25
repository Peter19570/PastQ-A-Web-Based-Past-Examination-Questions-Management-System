import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Upload as UploadIcon, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pastQuestionsService } from '../../services/pastQuestions';
import { coursesService, Course } from '../../services/courses';
import { useToast } from '../../components/Common/Toast';
import { Input } from '../../components/Common/Input';
import { Button } from '../../components/Common/Button';
import { SEMESTERS, YEARS, MAX_FILE_SIZE } from '../../utils/constants';
import { formatFileSize } from '../../utils/helpers';

interface UploadForm {
  course: string;
  title: string;
  year: number;
  semester: string;
}

export const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadForm>();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesService.getAll({ search: searchQuery });
        setCourses(data.results || data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    if (searchQuery) {
      fetchCourses();
    }
  }, [searchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        showToast('error', `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
        return;
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        showToast('error', 'Only PDF and image files are allowed');
        return;
      }

      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) {
      showToast('error', 'Please select a file to upload');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    try {
      await pastQuestionsService.upload({
        course: data.course,
        title: data.title,
        year: data.year,
        semester: data.semester as 'First' | 'Second' | 'Summer',
        file,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      showToast('success', 'Past question uploaded successfully! Pending approval.');
      reset();
      setFile(null);
      setTimeout(() => {
        navigate('/my-uploads');
      }, 1500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload failed:', error);
      showToast('error', 'Failed to upload past question. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course
            </label>
            <input
              list="courses"
              placeholder="Search or select course code (e.g., CSC101)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              {...register('course', { required: 'Course is required' })}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <datalist id="courses">
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.title}
                </option>
              ))}
            </datalist>
            {errors.course && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.course.message}
              </p>
            )}
          </div>

          <Input
            label="Title"
            placeholder="e.g., Final Exam 2023"
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                {...register('year', { required: 'Year is required' })}
              >
                <option value="">Select year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Semester
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                {...register('semester', { required: 'Semester is required' })}
              >
                <option value="">Select semester</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem.value} value={sem.value}>
                    {sem.label}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.semester.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File
            </label>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    PDF, JPEG, PNG (MAX {formatFileSize(MAX_FILE_SIZE)})
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
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!file}>
            <UploadIcon className="h-5 w-5 mr-2" />
            Upload Past Question
          </Button>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Your upload will be reviewed by admins before being published
          </p>
        </form>
      </div>
    </div>
  );
};
