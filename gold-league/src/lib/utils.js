import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Class combiner used by Inspira UI components (`cn` from '@/lib/utils').
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
