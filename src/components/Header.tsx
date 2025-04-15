import Link from 'next/link'
import { HEADER_QUERY } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import { HEADER_QUERYResult } from '@/sanity/types'

// Updated type to match what comes from Sanity
type HeaderData = {
  title?: string | null;
  subtitle?: string | null;
  mainNavigation?: Array<{
    title?: string | null;
    linkType?: 'internal' | 'external' | null;
    internalLink?: { 
      _type: string; 
      slug: string | null;
    } | null;
    url?: string | null;
    isExternal?: boolean | null;
  }> | null;
  showStudioLink?: boolean | null;
}

export async function Header() {
  const { data } = await sanityFetch({ query: HEADER_QUERY })
  
  // Default values if data isn't loaded yet
  const title = data?.title || 'Site Title'
  const subtitle = data?.subtitle || ''
  const navigation = data?.mainNavigation || []
  const showStudioLink = data?.showStudioLink ?? true
  
  return (
    <header className="bg-black text-white py-4 border-b border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex flex-col">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition-colors">
            {title}
          </Link>
          {subtitle && (
            <span className="text-sm text-gray-400">{subtitle}</span>
          )}
        </div>
        
        <nav className="flex space-x-6">
          {navigation.map((item: NonNullable<HeaderData['mainNavigation']>[number], index: number) => {
            // Skip items with no title or link information
            if (!item?.title || !item.linkType) return null;
            
            // Generate the correct URL for internal or external links
            const url = item.linkType === 'internal' && item.internalLink
              ? getInternalUrl(item.internalLink)
              : item.url || '#';
            
            // Default to non-external if not specified
            const isExternal = item.isExternal === true;
            
            return (
              <Link
                key={index}
                href={url || '#'}
                className="text-white hover:text-blue-400 transition-colors"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.title}
              </Link>
            );
          })}
          
          {/* <Link href="/bio" className="hover:text-blue-400 transition-colors">
            About Me
          </Link> */}
          
          {showStudioLink && (
            <Link href="/studio" className="hover:text-blue-400 transition-colors" aria-label="Settings">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-6 h-6"
              >
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}

// Helper function to determine URLs for internal links
function getInternalUrl(link: { _type: string; slug: string | null }) {
  if (!link.slug && link._type !== 'bio') {
    return '/';
  }
  
  switch (link._type) {
    case 'post':
      return `/posts/${link.slug}`;
    case 'category':
      return `/categories/${link.slug}`;
    case 'bio':
      return '/bio';
    case 'model3d':
      return `/models/${link.slug}`;
    default:
      return '/';
  }
}