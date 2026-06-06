import { NextResponse } from 'next/server'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb'

const TABLE = TABLES.MAIN

/**
 * Public API route for live location data.
 * No auth required — security is via the unguessable session ID (UUID).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const result = await dynamo.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `LIVE_LOCATION#${id}`, SK: 'METADATA' },
    }))

    if (!result.Item) {
      return NextResponse.json(
        { error: 'Location session not found' },
        { status: 404 }
      )
    }

    const session = result.Item

    // Check if expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return NextResponse.json({
        status: 'expired',
        message: 'This location sharing session has expired',
        lat: null,
        lng: null,
        last_updated: null,
        expires_at: session.expires_at,
      })
    }

    if (session.status !== 'active') {
      return NextResponse.json({
        status: session.status,
        message: 'Location sharing has ended',
        lat: null,
        lng: null,
        last_updated: null,
        expires_at: session.expires_at,
      })
    }

    return NextResponse.json({
      status: 'active',
      lat: session.last_lat || null,
      lng: session.last_lng || null,
      last_updated: session.last_updated || null,
      expires_at: session.expires_at,
    })
  } catch (error) {
    console.error('Live location fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
