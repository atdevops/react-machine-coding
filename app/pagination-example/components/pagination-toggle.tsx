'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationToggleProps {
  currentStyle: 'pagination' | 'infinite';
}

const PaginationToggle: React.FC<PaginationToggleProps> = ({ currentStyle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const togglePaginationStyle = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Toggle between pagination and infinite scroll
    if (currentStyle === 'pagination') {
      params.set('style', 'infinite');
    } else {
      params.delete('style');
    }
    
    // Keep the current page and limit
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex justify-end mb-4">
      <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
        <button
          onClick={togglePaginationStyle}
          className={`px-4 py-2 rounded-md transition-all ${
            currentStyle === 'pagination'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pagination
        </button>
        <button
          onClick={togglePaginationStyle}
          className={`px-4 py-2 rounded-md transition-all ${
            currentStyle === 'infinite'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          Infinite Scroll
        </button>
      </div>
    </div>
  );
};

export default PaginationToggle;