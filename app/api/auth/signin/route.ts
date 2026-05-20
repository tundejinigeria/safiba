import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

// Server-side only - safe here
const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
const clientSecret = process.env.COGNITO_USER_POOL_CLIENT_SECRET;
const region = process.env.REGION ?? 'us-east-1';

const cognitoClient = new CognitoIdentityProviderClient({ region });

function computeSecretHash(username: string): string {
  if (!clientSecret) return '';
  return createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate required config
    if (!clientId) {
      console.error('Missing COGNITO_USER_POOL_CLIENT_ID');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    // Add SECRET_HASH only if client secret exists
    if (clientSecret) {
      authParameters.SECRET_HASH = computeSecretHash(email);
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: authParameters,
    });

    const response = await cognitoClient.send(command);
    const tokens = response.AuthenticationResult;

    if (!tokens?.AccessToken || !tokens?.IdToken) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Return tokens to the client
    return NextResponse.json({
      accessToken: tokens.AccessToken,
      idToken: tokens.IdToken,
      expiresIn: tokens.ExpiresIn,
    });
  } catch (error: any) {
    console.error('Sign-in error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 400 }
    );
  }
}