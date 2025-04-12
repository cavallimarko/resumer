import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { BIO_QUERY, HOMEPAGE_POSTS_QUERY, CATEGORIES_QUERY } from "@/sanity/lib/queries";
import ProjectsGrid from "@/components/ProjectsGrid";
import { Bio } from "@/components/Bio";
import { Suspense } from "react";

export default async function Page() {
  // Fetch posts and categories using client.fetch or sanityFetch
  const { data: postsData } = await sanityFetch({ query: HOMEPAGE_POSTS_QUERY });
  const { data: categories } = await sanityFetch({ query: CATEGORIES_QUERY });
  
  // Fetch bio using the predefined query from queries.ts
  const { data: bioData } = await sanityFetch({ query: BIO_QUERY });

  // Transform posts to ensure slug.current is always a string
  const posts = postsData.map((post: any) => ({
    ...post,
    slug: post.slug ? { current: post.slug.current || '' } : null
  }));

  // Transform bio to match expected structure
  const bio = bioData ? {
    title: bioData.title || '',
    subtitle: bioData.subtitle || '',
    content: bioData.content || null,
    image: bioData.image || null,
    skills: bioData.skills || []
  } : {
    title: '',
    subtitle: '',
    content: null,
    image: null,
    skills: []
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-6">
        <Suspense fallback={<div>Loading projects...</div>}>
          <ProjectsGrid posts={posts} categories={categories} />
        </Suspense>
        
        {/* About Me Section */}
        <div className="mt-20 py-10 border-t border-gray-800">
          <h2 className="text-3xl font-bold mb-8">About Me</h2>
          <Suspense fallback={<div>Loading bio...</div>}>
            <Bio bio={bio} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}