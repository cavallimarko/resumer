import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import ProjectsGrid from "@/components/ProjectsGrid";
import { Bio } from "@/components/Bio";

// Fetch all posts with their images, titles, and categories
const postsQuery = groq`
  *[_type == "post"] {
    _id,
    title,
    slug,
    "mainImage": mainImage.asset->url,
    categories[]->{ title }
  }
`;

// Get all unique categories
const categoriesQuery = groq`
  *[_type == "category"] {
    _id,
    title
  }
`;

// Fetch bio information using the same query structure as in the Bio component
const bioQuery = groq`
  *[_type == "bio"][0]{
    _id,
    title,
    subtitle,
    image,
    content,
    skills
  }
`;

export default async function Page() {
  // Fetch posts, categories, and bio
  const posts = await client.fetch(postsQuery);
  const categories = await client.fetch(categoriesQuery);
  const bio = await client.fetch(bioQuery);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-6">
        <ProjectsGrid posts={posts} categories={categories} />
        
        {/* About Me Section */}
        <div className="mt-20 py-10 border-t border-gray-800">
          <h2 className="text-3xl font-bold mb-8">About Me</h2>
          <Bio bio={bio} />
        </div>
      </div>
    </div>
  );
}