/**
 * Form Storage Utilities
 * Persists form state to browser localStorage to prevent data loss
 */

import { PackageFormState } from '@/types/form-state';

const STORAGE_KEY = 'rate-calculator-form-state';

/**
 * Saves form state to localStorage
 * @param state - The form state to save
 */
export function saveFormState(state: PackageFormState): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save form state to localStorage:', error);
    // Silently fail - don't break the form if localStorage is unavailable
  }
}

/**
 * Loads form state from localStorage
 * @returns The saved form state, or null if no saved state exists
 */
export function loadFormState(): PackageFormState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as PackageFormState;
    return parsed;
  } catch (error) {
    console.error('Failed to load form state from localStorage:', error);
    // Return null if parsing fails - don't break the app
    return null;
  }
}

/**
 * Clears saved form state from localStorage
 * Typically called after successful form submission
 */
export function clearFormState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form state from localStorage:', error);
    // Silently fail - don't break the form
  }
}

/**
 * Checks if a saved form state exists in localStorage
 * @returns true if saved state exists, false otherwise
 */
export function hasFormState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check form state in localStorage:', error);
    return false;
  }
}
