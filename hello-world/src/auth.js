import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({ region: 'ap-southeast-1' });
const CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID;

export async function login(username, password) {
  const { AuthenticationResult } = await client.send(new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: username, PASSWORD: password },
  }));

  localStorage.setItem('id_token', AuthenticationResult.IdToken);
  return AuthenticationResult.IdToken;
}

export function getCurrentToken() {
  const token = localStorage.getItem('id_token');
  if (!token) throw new Error('No user session');
  return Promise.resolve(token);
}

export function logout() {
  localStorage.removeItem('id_token');
}
