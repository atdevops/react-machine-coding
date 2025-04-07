import { Suspense } from 'react';
import BlogPost from './components/blog-post';
import Pagination from './components/pagination';
import PaginationToggle from './components/pagination-toggle';

interface Post {
  id: number;
  title: string;
  body: string;
}

export interface PostResponse {
  posts: Post[];
  total: number;
  limit: number;
  skip: number;
}

// Improved data fetching function that properly uses pagination parameters
async function getBlogPosts(limit: number, page: number) {
  // Calculate skip value for API pagination
  const skip = (page - 1) * limit;
  
  // Use both limit and skip parameters for proper pagination
  const url = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}`;
  console.log(`Fetching data with URL: ${url}`);
  const response = await fetch(url, { cache: 'no-store' }); // Disable caching to ensure fresh data
  return response.json();
}

const PaginationExample = async ({
  searchParams,
}: {
  searchParams: {[key: string]: string | string[] | undefined};
}) => {
  // Safely extract page and limit values
  let currentPage = 1;
  let currentLimit = 5;
  const usePagination = searchParams.style !== 'infinite'

  // Parse page and limit from search params
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        if (key === 'page') currentPage = parseInt(value, 10);
        if (key === 'limit') currentLimit = parseInt(value, 10);
      }
    });
  }

  // Fetch data with proper pagination parameters
  const blogPosts = await getBlogPosts(currentLimit, currentPage);

  return (
    <div>
      <PaginationToggle currentStyle={usePagination ? 'pagination' : 'infinite'} />

      {usePagination ? (
        // Standard pagination approach
        <>
          <BlogPost data={blogPosts} />
          <Pagination 
            totalItems={blogPosts.total} 
            limit={currentLimit} 
            currentPage={currentPage}
          />
        </>
      ) : (
        // Infinite scroll approach
        <Suspense fallback={<div>Loading posts...</div>}>
          <BlogPost 
            data={blogPosts} 
            infiniteScroll={true} 
            totalItems={blogPosts.total}
          />
        </Suspense>
      )}
    </div>
  );
};

export default PaginationExample;
