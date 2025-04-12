import { ReactNode } from 'react'

interface TitleProps {
  children: ReactNode;
  className?: string;
}

export function Title({ children, className = '' }: TitleProps) {
  return (
    <h1 className={`text-2xl md:text-4xl lg:text-6xl font-semibold text-gray-200 text-pretty max-w-3xl ${className}`}>
      {children}
    </h1>
  )
}