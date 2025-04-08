import Link from 'next/link'

export function Header() {
  return (
    <div className="from-white to-white bg-gradient-to-b p-6">
      <header className="bg-white/80 shadow-md flex items-center justify-between p-6 rounded-lg container mx-auto shadow-black-50">
        <Link
          className="text-black-700 md:text-xl font-bold tracking-tight"
          href="/"
        >
          Portfolio
        </Link>
        <ul className="flex items-center gap-4 font-semibold text-black-700">
          <li>
            <Link
              className="hover:text-black-500 transition-colors"
              href="/posts"
            >
              Posts
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-black-500 transition-colors"
              href="/studio"
            >
              Sanity Studio
            </Link>
          </li>
        </ul>
      </header>
    </div>
  )
}