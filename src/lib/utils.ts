import { clsx, type ClassValue } from 'clsx';

/**
 * Combines multiple class names into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Helper function for conditionally applying classes
 */
export function cx(classes: Record<string, boolean>) {
  return Object.entries(classes)
    .filter(([_, value]) => Boolean(value))
    .map(([className]) => className)
    .join(' ');
} 