// ─────────────────────────────────────────────────────────────────────────────
// Pagination Utilities — Cursor-based pagination for DynamoDB
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 25

/**
 * Encode a DynamoDB LastEvaluatedKey into a URL-safe cursor string.
 */
export function encodeCursor(key: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(key)).toString('base64url')
}

/**
 * Decode a cursor string back into a DynamoDB ExclusiveStartKey.
 */
export function decodeCursor(cursor: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'))
}

/**
 * Build pagination parameters for a DynamoDB query.
 */
export function buildPaginationParams(cursor?: string, limit?: number) {
  const params: {
    Limit: number
    ExclusiveStartKey?: Record<string, unknown>
  } = {
    Limit: Math.min(limit || DEFAULT_PAGE_SIZE, 100), // Cap at 100
  }

  if (cursor) {
    try {
      params.ExclusiveStartKey = decodeCursor(cursor)
    } catch {
      // Invalid cursor — ignore and start from beginning
    }
  }

  return params
}

/**
 * Build the nextCursor from a DynamoDB query result.
 */
export function getNextCursor(lastEvaluatedKey: Record<string, unknown> | undefined): string | null {
  if (!lastEvaluatedKey) return null
  return encodeCursor(lastEvaluatedKey)
}
