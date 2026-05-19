import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
});

export const COGNITO_CLIENT_ID =
  process.env.COGNITO_USER_POOL_CLIENT_ID ?? '';

const COGNITO_CLIENT_SECRET =
  process.env.COGNITO_USER_POOL_CLIENT_SECRET ?? '';

/**
 * Computes the SECRET_HASH required when the Cognito app client has a secret.
 * SECRET_HASH = Base64(HMAC-SHA256(clientSecret, username + clientId))
 */
function computeSecretHash(username: string): string {
  return createHmac('sha256', COGNITO_CLIENT_SECRET)
    .update(username + COGNITO_CLIENT_ID)
    .digest('base64');
}

/**
 * Authenticate an admin user with email + password.
 * Supports both app clients with and without a client secret.
 */
export async function cognitoSignIn(
  email: string,
  password: string
): Promise<{ accessToken: string; idToken: string } | null> {
  try {
    const authParameters: Record<string, string> = {
      USERNAME: email,
      PASSWORD: password,
    };

    // Include SECRET_HASH if a client secret is configured
    if (COGNITO_CLIENT_SECRET) {
      authParameters.SECRET_HASH = computeSecretHash(email);
    }

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: authParameters,
    });

    const response = await cognitoClient.send(command);
    const tokens = response.AuthenticationResult;

    if (!tokens?.AccessToken || !tokens?.IdToken) return null;

    return {
      accessToken: tokens.AccessToken,
      idToken: tokens.IdToken,
    };
  } catch (err) {
    console.error('Cognito signIn error:', err);
    return null;
  }
}

/**
 * Sign out a user by invalidating all their tokens.
 */
export async function cognitoSignOut(accessToken: string): Promise<void> {
  try {
    await cognitoClient.send(
      new GlobalSignOutCommand({ AccessToken: accessToken })
    );
  } catch {
    // Ignore sign-out errors
  }
}

/**
 * Verify an access token and return the user's email.
 */
export async function cognitoGetUser(
  accessToken: string
): Promise<string | null> {
  try {
    const response = await cognitoClient.send(
      new GetUserCommand({ AccessToken: accessToken })
    );
    const emailAttr = response.UserAttributes?.find(
      (a) => a.Name === 'email'
    );
    return emailAttr?.Value ?? null;
  } catch {
    return null;
  }
}
