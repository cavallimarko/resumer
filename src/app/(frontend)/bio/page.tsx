import { sanityFetch } from "@/sanity/lib/live";
import { BIO_QUERY } from '@/sanity/lib/queries';
import { PortableText } from "next-sanity";
import { components } from "@/sanity/portableTextComponents";
import { Title } from "@/components/Title";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

export default async function BioPage() {
  const { data: bio } = await sanityFetch({ query: BIO_QUERY });

  // If no bio data exists yet, show a placeholder
  if (!bio) {
    return (
      <main className="container mx-auto grid gap-12 p-12">
        <div className="prose prose-lg">
          <h1>About Me</h1>
          <p>
            No bio information has been added yet. Please add content in the Sanity Studio.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto grid gap-12 p-12">
      <div className="grid lg:grid-cols-12 gap-8">
        {bio.image && (
          <div className="lg:col-span-4">
            <Image
              src={urlFor(bio.image).width(400).height(400).url()}
              width={400}
              height={400}
              alt={bio.title || "Profile image"}
              className="rounded-lg shadow-md"
            />
          </div>
        )}
        
        <div className={`prose prose-lg ${bio.image ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <Title>{bio.title}</Title>
          {bio.subtitle && <p className="text-xl text-gray-600 mt-2">{bio.subtitle}</p>}
          
          {bio.content && (
            <div className="mt-6">
              <PortableText value={bio.content} components={components} />
            </div>
          )}
          
          {bio.skills && bio.skills.length > 0 && (
            <div className="mt-8">
              <h2>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {bio.skills.map((skill: string, index: number) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Optional: Add metadata for the page
export const metadata = {
  title: 'Bio',
  description: 'Learn more about me.',
}; 