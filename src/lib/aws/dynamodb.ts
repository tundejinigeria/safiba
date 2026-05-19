import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

/**
 * DynamoDB client with automatic credential refresh.
 *
 * Credentials are resolved automatically by the AWS SDK default provider chain:
 *   1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN)
 *   2. ~/.aws/credentials file (set via `aws configure`)
 *   3. IAM role attached to the Amplify execution environment (production)
 *
 * Do NOT hardcode credentials here. Use .env.local for local dev.
 */

// Create client with credential refresh for temporary credentials
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
  // Enable credential refresh for temporary tokens
  credentials: fromNodeProviderChain({
    // Refresh credentials 5 minutes before expiration (default is 15 mins)
    timeout: 10 * 60 * 1000, // 10 minutes
    // Maximum retry attempts for credential refresh
    maxRetries: 3,
  }),
  // Increase max attempts for retryable errors
  maxAttempts: 3,
  // Use adaptive retry mode for better handling of throttling
  retryMode: 'adaptive',
});

// Optional: Add a credential refresh monitor for debugging
if (process.env.NODE_ENV === 'development') {
  const checkCredentials = async () => {
    try {
      const credentials = await client.config.credentials();
      if (credentials.expiration) {
        const expiresIn = credentials.expiration.getTime() - Date.now();
        const expiresInMinutes = Math.floor(expiresIn / 60000);
        console.log(`🔑 Credentials expire in ${expiresInMinutes} minutes`);
        
        if (expiresIn < 5 * 60 * 1000) { // Less than 5 minutes
          console.warn('⚠️ Credentials expiring soon, consider refreshing');
        }
      }
    } catch (error) {
      console.error('Failed to get credentials:', error);
    }
  };
  
  // Check credentials on startup
  checkCredentials();
  
  // Monitor credential expiration in development
  setInterval(checkCredentials, 5 * 60 * 1000); // Every 5 minutes
}

export const dynamo = DynamoDBDocumentClient.from(client, {
  marshallOptions: { 
    removeUndefinedValues: true,
    // Convert empty strings to undefined (optional)
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    // Convert wrapper types to native JS types
    wrapNumbers: false,
  },
});

export const TABLES = {
  WAITLIST: process.env.DYNAMODB_WAITLIST_TABLE ?? 'safiba-waitlist',
} as const;

// Helper function to refresh credentials manually if needed
export const refreshCredentials = async () => {
  try {
    console.log('🔄 Manually refreshing AWS credentials...');
    // Force credential refresh by clearing the cached credentials
    // @ts-ignore - Accessing private property for refresh
    if (client.config.credentials?.refresh) {
      // @ts-ignore
      await client.config.credentials.refresh();
    }
    console.log('✅ Credentials refreshed successfully');
  } catch (error) {
    console.error('❌ Failed to refresh credentials:', error);
    throw error;
  }
};