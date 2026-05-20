import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';

// Server-side only - these will be available in Amplify
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

export async function cognitoSignIn(
  email: string,
  password: string
): Promise<{ accessToken: string; idToken: string } | null> {
  try {
    // Validate configuration at runtime
    if (!clientId) {
      console.error('COGNITO_USER_POOL_CLIENT_ID is not set in environment variables');
      return null;
    }

    console.log(`Signing in with client ID: ${clientId.substring(0, 10)}...`);
    console.log(`Client secret present: ${!!clientSecret}`);

    const authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    if (clientSecret) {
      console.log('Client secret found, computing SECRET_HASH...');
      authParameters.SECRET_HASH = computeSecretHash(email);
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: authParameters,
    });

    const response = await cognitoClient.send(command);
    const tokens = response.AuthenticationResult;

    if (!tokens?.AccessToken || !tokens?.IdToken) return null;

    console.log('Sign in successful');
    return {
      accessToken: tokens.AccessToken,
      idToken: tokens.IdToken,
    };
  } catch (err) {
    console.error('Cognito signIn error:', err);
    return null;
  }
}

export async function cognitoSignOut(accessToken: string): Promise<void> {
  try {
    await cognitoClient.send(
      new GlobalSignOutCommand({ AccessToken: accessToken })
    );
  } catch (err) {
    console.error('Sign out error:', err);
    // Ignore sign-out errors
  }
}

export async function cognitoGetUser(accessToken: string): Promise<string | null> {
  try {
    const response = await cognitoClient.send(
      new GetUserCommand({ AccessToken: accessToken })
    );
    const emailAttr = response.UserAttributes?.find(
      (a) => a.Name === 'email'
    );
    return emailAttr?.Value ?? null;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}