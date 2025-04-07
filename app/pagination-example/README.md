# Next.js Pagination Example

This example demonstrates two common pagination approaches in modern web applications:
1. **Google-style Pagination** - A traditional approach with numbered page links and navigation controls
2. **Infinite Scroll** - A modern approach where content loads automatically as the user scrolls

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Google-style Pagination Implementation](#google-style-pagination-implementation)
- [Infinite Scroll Implementation](#infinite-scroll-implementation)
- [Toggle Between Pagination Styles](#toggle-between-pagination-styles)
- [Technical Considerations](#technical-considerations)

## Architecture Overview

The application uses a Next.js App Router architecture with Server Components for data fetching and Client Components for interactive elements:

- **Server Components:**
  - `page.tsx`: Handles initial data fetching and routing
  - API calls with appropriate pagination parameters

- **Client Components:**
  - `pagination.tsx`: Google-style pagination controls
  - `blog-post.tsx`: Displays content and handles infinite scroll logic
  - `pagination-toggle.tsx`: Toggles between pagination styles

- **State Management:**
  - URL parameters are used to manage pagination state (`page`, `limit`, `style`)
  - This approach ensures pages are bookmarkable and shareable

## Google-style Pagination Implementation

The Google-style pagination displays a range of page numbers with intelligent ellipses (…) for skipped pages.

### Key Features

- Always shows first and last page numbers
- Shows a range of pages around the current page
- Uses ellipses to indicate skipped pages
- Includes Previous/Next navigation buttons
- Preserves the `limit` parameter when navigating

### Implementation Details

1. **URL Parameters:**
   - `page`: Current page number
   - `limit`: Number of items per page

2. **Data Fetching:**
   ```typescript
   async function getBlogPosts(limit: number, page: number) {
     const skip = (page - 1) * limit;
     const url = `https://dummyjson.com/posts?limit=${limit}&skip=${skip}`;
     const response = await fetch(url, { cache: 'no-store' });
     return response.json();
   }
   ```

3. **Page Number Generation Algorithm:**
   ```typescript
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
       pages.push(-2); // -2 represents an ellipsis (different key)
     }
     
     // Always include last page if it's not the same as first
     if (totalPages > 1) {
       pages.push(totalPages);
     }
     
     return pages;
   };
   ```

4. **Page Navigation:**
   ```typescript
   const navigateToPage = (page: number) => {
     if (page < 1 || page > totalPages) return;
     const queryString = createQueryString('page', page.toString());
     router.push(`${pathname}?${queryString}`);
   };
   ```

## Infinite Scroll Implementation

The infinite scroll implementation automatically loads more content as the user scrolls to the bottom of the page.

### Key Features

- Initial server-side rendering for SEO and performance
- Client-side fetching for additional content
- Intersection Observer API for scroll detection
- Loading indicator while fetching
- End-of-results message when all content is loaded

### Implementation Details

1. **State Management:**
   ```typescript
   const [posts, setPosts] = useState<Post[]>(data.posts);
   const [isLoading, setIsLoading] = useState(false);
   const [page, setPage] = useState(1);
   const observerRef = useRef<HTMLDivElement>(null);
   ```

2. **Additional Data Loading:**
   ```typescript
   const loadMorePosts = useCallback(async () => {
     if (isLoading || posts.length >= totalItems) return;
     
     try {
       setIsLoading(true);
       const nextPage = page + 1;
       const skip = nextPage * limit - limit;
       
       const response = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${skip}`);
       const newData = await response.json();
       
       setPosts(prev => [...prev, ...newData.posts]);
       setPage(nextPage);
     } catch (error) {
       console.error('Error loading more posts:', error);
     } finally {
       setIsLoading(false);
     }
   }, [isLoading, page, limit, posts.length, totalItems]);
   ```

3. **Intersection Observer Setup:**
   ```typescript
   useEffect(() => {
     if (!infiniteScroll || !observerRef.current) return;
     
     const observer = new IntersectionObserver(
       (entries) => {
         if (entries[0].isIntersecting) {
           loadMorePosts();
         }
       },
       { threshold: 0.1 }
     );
     
     observer.observe(observerRef.current);
     
     return () => {
       if (observerRef.current) {
         observer.unobserve(observerRef.current);
       }
     };
   }, [infiniteScroll, loadMorePosts]);
   ```

4. **Observer Element Placement:**
   ```jsx
   {infiniteScroll && (
     <div ref={observerRef} className="py-4 text-center">
       {isLoading ? (
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
       ) : posts.length < totalItems ? (
         <p className="text-gray-500">Scroll to load more</p>
       ) : (
         <p className="text-gray-500">End of results</p>
       )}
     </div>
   )}
   ```

## Toggle Between Pagination Styles

The application allows users to switch between pagination styles using a toggle component.

### Implementation Details

1. **Toggle Component:**
   ```typescript
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
     
     // Component rendering...
   };
   ```

2. **Style Detection in Page Component:**
   ```typescript
   const usePagination = searchParams.style !== 'infinite';
   ```

3. **Conditional Rendering:**
   ```jsx
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
   ```

## Technical Considerations

### SEO and Performance

- **Server-Side Rendering**: Initial content is server-rendered for better SEO
- **URL-based state**: Makes pages bookmarkable and shareable
- **No-cache option**: Ensures fresh data is fetched when pagination changes

### Accessibility

- Buttons for pagination controls are properly styled for focus and hover states
- Loading states are clearly indicated for both pagination styles
- Visual feedback shows the current page or loading status

### Browser Compatibility

- Intersection Observer API is used for modern browsers
- URL-based navigation works in all browsers
- Client-side navigation ensures a smooth experience

### Data Management

- Pagination parameters (`skip` and `limit`) are correctly calculated for the API
- Data fetching is optimized to only load what's needed
- State is properly maintained during navigation and toggling

### User Experience

- Loading indicators provide feedback during data fetching
- Google-style pagination provides familiar page navigation
- Infinite scroll provides a modern, seamless browsing experience
- Toggle allows users to choose their preferred navigation style 