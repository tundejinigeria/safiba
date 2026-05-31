'use server';

import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamo, TABLES } from '@/src/lib/aws/dynamodb';

export type WaitlistResult =
  | { success: true }
  | { success: false; error: string };

export async function joinWaitlist(
  formData: FormData
): Promise<WaitlistResult> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase();

  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const now = new Date().toISOString();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLES.WAITLIST,
        Item: {
          pk: `EMAIL#${email}`,
          sk: 'PROFILE',
          id,
          email,
          joinedAt: now,
          source: 'landing-page',
        },
        // Prevent duplicate signups
        ConditionExpression: 'attribute_not_exists(pk)',
      })
    );

    return { success: true };
  } catch (err: unknown) {
    // ConditionalCheckFailedException = already signed up
    if (
      err instanceof Error &&
      err.name === 'ConditionalCheckFailedException'
    ) {
      return { success: true }; // Treat as success — no need to tell them they're already on it
    }

    console.error('Waitlist DynamoDB error:', err);
    return {
      success: false,
      error: 'Something went wrong. Please try again.',
    };
  }
}
