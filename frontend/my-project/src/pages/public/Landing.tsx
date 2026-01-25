import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Upload, Award } from 'lucide-react';
import { pastQuestionsService, PastQuestion } from '../../services/pastQuestions';
import { PastQuestionCard } from '../../components/PastQuestions/PastQuestionCard';
import { Button } from '../../components/Common/Button';
import { SkeletonCard } from '../../components/Common/Loader';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Common/Toast';

export const Landing = () => {
  const [pastQuestions, setPastQuestions] = useState<PastQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await pastQuestionsService.getPopular();
        setPastQuestions(data.results || data);
      } catch (error) {
        console.error('Failed to fetch past questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/past-questions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleDownload = (id: number) => {
    if (!isAuthenticated) {
      showToast('info', 'Please login to download past questions');
      navigate('/login');
      return;
    }
    navigate(`/past-questions/${id}`);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary-50 to-success-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Study Smarter with <span className="text-primary-600">PastQ</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Access thousands of university past questions. Download, study, and excel in your
              exams.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search courses or past questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" size="lg">
                  Search
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/courses')}>
                Browse Courses
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Question
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                <Search className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Easy Search
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find past questions by course, year, or semester with our powerful search
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 dark:bg-success-900 mb-4">
                <TrendingUp className="h-8 w-8 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Popular Questions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access the most downloaded past questions for your courses
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-banana/20 mb-4">
                <Award className="h-8 w-8 text-accent-grape" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Earn Reputation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload quality content and build your reputation in the community
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Past Questions
            </h2>
            <Button variant="ghost" onClick={() => navigate('/past-questions')}>
              View All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : pastQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastQuestions.slice(0, 6).map((pq) => (
                <PastQuestionCard
                  key={pq.id}
                  pastQuestion={pq}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No past questions available yet. Be the first to upload!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
