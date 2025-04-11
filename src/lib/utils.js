import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes, handling conflicts.
 * @param {...(string|Object|Array)} inputs - Class values to merge.
 * @returns {string} Merged class string.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string.
 * @param {string|Date} date - The date to format.
 * @returns {string} Formatted date string (e.g., "January 1, 2024").
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a number as currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string (e.g., "$1,234.56").
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Note: generateId using uuid is preferred and available in db.js
