import { PortableText } from "next-sanity";
import { components } from "@/sanity/portableTextComponents";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";

interface BioProps {
  bio: {
    title?: string;
    subtitle?: string;
    content?: any;
    image?: any;
    skills?: string[];
  };
}

export function Bio({ bio }: BioProps) {
  if (!bio) {
    return <p className="text-gray-400">No bio information available yet.</p>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {bio.image && (
        <div className="flex-shrink-0">
          <Image
            src={urlFor(bio.image).width(400).height(400).url()}
            width={400}
            height={400}
            alt={bio.title || "Profile image"}
            className="rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="flex-grow">
        {bio.subtitle && (
          <p className="text-xl text-gray-300 mb-4">
            {bio.subtitle}
          </p>
        )}
        
        {bio.content ? (
          <div className="prose prose-invert prose-lg max-w-none">
            <PortableText value={bio.content} components={components} />
          </div>
        ) : (
          <p className="text-gray-400">No bio information available yet.</p>
        )}
        
        {bio.skills && bio.skills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {bio.skills.map((skill: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 