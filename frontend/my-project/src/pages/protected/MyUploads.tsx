import { useState, useEffect } from 'react';
import { pastQuestionsService, PastQuestion } from '../../services/pastQuestions';
import { PastQuestionCard } from '../../components/PastQuestions/PastQuestionCard';
import { PageLoader } from '../../components/Common/Loader';
import { useNavigate } from 'react-router-dom';

export const MyUploads = () => {
  const [uploads, setUploads] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const data = await pastQuestionsService.getMyUploads();
        setUploads(data.results || data);
      } catch (error) {
        console.error('Failed to fetch uploads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
  }, []);

  const handleDownload = (id: number) => {
    navigate(`/past-questions/${id}`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          My Uploads
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all your uploaded past questions
        </p>
      </div>

      {uploads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <PastQuestionCard key={upload.id} pastQuestion={upload} onDownload={handleDownload} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't uploaded any past questions yet
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            Upload your first past question
          </button>
        </div>
      )}
    </div>
  );
};
