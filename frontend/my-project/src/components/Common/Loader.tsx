export const Loader = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );
};
