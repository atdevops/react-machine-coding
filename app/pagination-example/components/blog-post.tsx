'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  body: string;
}

interface PostResponse {
  posts: Post[];
  total: number;
  limit: number;
  skip: number;
}

interface BlogPostProps {
  data: PostResponse;
  infiniteScroll?: boolean;
  totalItems?: number;
}

const BlogPost: React.FC<BlogPostProps> = ({ data, infiniteScroll = false, totalItems = 0 }) => {
  const [posts, setPosts] = useState<Post[]>(data.posts);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  
  // Get the current limit from URL or use data.limit
  const limit = searchParams.get('limit') 
    ? parseInt(searchParams.get('limit') as string, 10) 
    : data.limit;

  // Function to load more posts for infinite scrolling
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

  // Set up intersection observer for infinite scroll
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Blog Posts</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, _idx) => (
          <article 
            key={_idx} 
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
          >
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p className="mt-2 text-gray-600">{post.body}</p>
          </article>
        ))}
      </div>
      
      {/* Loading indicator for infinite scroll */}
      {infiniteScroll && (
        <div 
          ref={observerRef} 
          className="py-4 text-center"
        >
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length < totalItems ? (
            <p className="text-gray-500">Scroll to load more</p>
          ) : (
            <p className="text-gray-500">End of results</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogPost;