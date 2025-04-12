import { client } from "@/sanity/lib/client";
import { Title } from "@/components/Title";
import { Bio } from "@/components/Bio";
import { groq } from "next-sanity";

const bioQuery = groq`*[_type == "bio"][0]{
  _id,
  title,
  subtitle,
  content,
  image,
  skills
}`;

export default async function BioPage() {
  const bio = await client.fetch(bioQuery);

  return (
    <section className="bg-black text-white min-h-screen">
      <div className="container mx-auto p-8 max-w-5xl">
        <Title className="text-white mb-6">About Me</Title>
        <Bio bio={bio} />
      </div>
    </section>
  );
}

// Optional: Add metadata for the page
export const metadata = {
  title: 'Bio',
  description: 'Learn more about me.',
}; 