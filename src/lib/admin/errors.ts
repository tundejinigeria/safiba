// ─────────────────────────────────────────────────────────────────────────────
// Error Handling — Maps DynamoDB errors to user-friendly messages
// ─────────────────────────────────────────────────────────────────────────────

import type { ActionResult } from '@/src/types/admin'

/**
 * Handle errors from Server Actions and return a safe, user-friendly result.
 * Logs the full error server-side but never exposes raw AWS details to the client.
 */
export function handleActionError(error: unknown, context: string): ActionResult<never> {
  // Log full error server-side for debugging
  console.error(`[Admin Action: ${context}]`, error)

  if (error instanceof Error) {
    // DynamoDB-specific errors
    if (error.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'This item has been modified. Please refresh and try again.' }
    }
    if (error.name === 'ResourceNotFoundException') {
      return { success: false, error: 'The requested item was not found.' }
    }
    if (error.name === 'ProvisionedThroughputExceededException') {
      return { success: false, error: 'The system is busy. Please try again in a moment.' }
    }
    if (error.name === 'ValidationException') {
      return { success: false, error: 'Invalid request. Please check your input.' }
    }
    if (error.message === 'Unauthorized') {
      return { success: false, error: 'You are not authorized to perform this action.' }
    }
    if (error.message === 'SELF_MODIFICATION') {
      return { success: false, error: 'You cannot modify your own account status.' }
    }
  }

  return { success: false, error: 'An unexpected error occurred. Please try again.' }
}
