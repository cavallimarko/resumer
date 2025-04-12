'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

// Define types for our data
interface Category {
  _id: string;
  title: string;
}

interface Post {
  _id: string;
  title: string | null;
  slug: { current: string } | null;
  mainImage: string | { url: string } | null;
  categories: { title: string | null }[] | null;
}

interface ProjectsGridProps {
  posts: Post[];
  categories: { title: string | null }[];
}

export default function ProjectsGrid({ posts, categories }: ProjectsGridProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [filteredPosts, setFilteredPosts] = useState(posts);
  
  useEffect(() => {
    if (categoryParam) {
      setFilteredPosts(
        posts.filter((post: Post) => 
          post.categories && post.categories.some((cat) => cat.title === categoryParam)
        )
      );
    } else {
      setFilteredPosts(posts);
    }
  }, [categoryParam, posts]);

  return (
    <>
      {/* Navigation Categories */}
      <nav className="flex justify-center space-x-8 mb-8 overflow-x-auto py-2">
        <Link 
          href="/" 
          className={`hover:text-blue-400 font-medium ${!categoryParam ? 'text-blue-400 underline' : ''}`}
        >
          ALL
        </Link>
        {categories.map((category, index) => (
          <Link 
            key={index} 
            href={`/?category=${category.title}`}
            className={`hover:text-blue-400 font-medium uppercase ${
              categoryParam === category.title ? 'text-blue-400 underline' : ''
            }`}
          >
            {category.title}
          </Link>
        ))}
      </nav>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPosts.map((post) => (
          <Link href={`/posts/${post.slug?.current || ''}`} key={post._id} className="group relative aspect-square overflow-hidden">
            {post.mainImage && (
              <Image
                src={typeof post.mainImage === 'string' 
                  ? post.mainImage 
                  : post.mainImage && 'url' in post.mainImage ? post.mainImage.url : ''}
                alt={post.title || 'Untitled'}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
            
            {/* Overlay with title on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <h3 className="text-white p-4 font-medium text-lg">{post.title || 'Untitled'}</h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
} 