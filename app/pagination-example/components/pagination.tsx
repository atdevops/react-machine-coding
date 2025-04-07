'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalItems: number;
  limit: number;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, limit, currentPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / limit);
  
  // Function to create a new URL with updated parameters
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    
    // Always preserve the limit parameter when changing pages
    if (name !== 'limit') {
      params.set('limit', limit.toString());
    }
    
    return params.toString();
  };

  // Function to handle page navigation
  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const queryString = createQueryString('page', page.toString());
    console.log(`Navigating to: ${pathname}?${queryString}`);
    router.push(`${pathname}?${queryString}`);
  };

  // Google-style pagination: show current page, 2 before and after, first and last
  const getPageNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Add ellipsis after first page if needed
    if (currentPage > 4) {
      pages.push(-1); // -1 represents an ellipsis
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (currentPage < totalPages - 3) {
      pages.push(-2); // -2 represents an ellipsis (different key from the first one)
    }
    
    // Always include last page if it's not the same as first
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center mt-8 mb-8">
      {/* Results info */}
      <div className="text-sm text-gray-600 mb-4">
        Showing {Math.min((currentPage - 1) * limit + 1, totalItems)} - {Math.min(currentPage * limit, totalItems)} of {totalItems} results
      </div>
      
      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button 
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          Previous
        </button>
        
        {/* Page numbers */}
        <div className="flex space-x-2">
          {pageNumbers.map((page, idx) => (
            page < 0 ? (
              // Render ellipsis
              <span key={`ellipsis-${idx}`} className="px-3 py-2">
                …
              </span>
            ) : (
              // Render page number
              <button
                key={`page-${page}`}
                onClick={() => navigateToPage(page)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>
        
        {/* Next button */}
        <button 
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-4 py-2 rounded-md ${currentPage >= totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;