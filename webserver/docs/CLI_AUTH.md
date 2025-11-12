# CLI Authentication

This document describes how to authenticate CLI applications using the Device Authorization Grant flow.

## Overview

The zxcv server implements OAuth 2.0 Device Authorization Grant (RFC 8628) for CLI authentication. This allows CLI tools to authenticate users without requiring them to enter credentials directly in the terminal.

## Authentication Flow

1. **Device Authorization Request**
   - CLI requests a device code and user code
   - Server returns:
     - `device_code`: Long code for CLI polling
     - `user_code`: Short user-friendly code (e.g., "ABCD-1234")
     - `verification_uri`: URL where user enters the code
     - `expires_in`: Code expiration time (seconds)
     - `interval`: Minimum polling interval (seconds)

2. **User Authorization**
   - CLI displays the user code and verification URL
   - User visits the URL in a browser
   - User logs in (if not already authenticated)
   - User enters the user code
   - User approves the device

3. **Token Exchange**
   - CLI polls the token endpoint
   - Once approved, server returns an access token
   - CLI stores the token securely

## API Endpoints

### 1. Initialize Device Authorization

```http
POST /rpc/auth/device/authorize
Content-Type: application/json

{
  "clientId": "cli",
  "scope": "read write"
}
```

Response:
```json
{
  "deviceCode": "long-random-device-code",
  "userCode": "ABCD-1234",
  "verificationUri": "https://zxcv.app/device",
  "verificationUriComplete": "https://zxcv.app/device?code=ABCD-1234",
  "expiresIn": 900,
  "interval": 5
}
```

### 2. Poll for Token

```http
POST /rpc/auth/device/token
Content-Type: application/json

{
  "deviceCode": "long-random-device-code",
  "clientId": "cli"
}
```

Response (pending):
```json
{
  "error": "authorization_pending",
  "errorDescription": "Authorization pending"
}
```

Response (success):
```json
{
  "accessToken": "cli-token-here",
  "tokenType": "Bearer",
  "scope": "read write"
}
```

### 3. Using the CLI Token

Include the token in the Authorization header:
```http
GET /rpc/rules/list
Authorization: Bearer cli-token-here
```

## CLI Implementation Example

```typescript
async function authenticate() {
  // 1. Request device authorization
  const authResponse = await fetch('https://api.zxcv.app/rpc/auth/device/authorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: 'cli' })
  });
  
  const { deviceCode, userCode, verificationUri, expiresIn, interval } = await authResponse.json();
  
  // 2. Display instructions to user
  console.log(`Please visit: ${verificationUri}`);
  console.log(`And enter code: ${userCode}`);
  
  // 3. Poll for token
  const startTime = Date.now();
  while (Date.now() - startTime < expiresIn * 1000) {
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
    
    const tokenResponse = await fetch('https://api.zxcv.app/rpc/auth/device/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceCode, clientId: 'cli' })
    });
    
    const result = await tokenResponse.json();
    
    if (!result.error) {
      // Success! Store the token
      return result.accessToken;
    }
    
    if (result.error === 'slow_down') {
      // Increase polling interval
      interval *= 2;
    } else if (result.error !== 'authorization_pending') {
      // Fatal error
      throw new Error(result.errorDescription);
    }
  }
  
  throw new Error('Authorization timed out');
}
```

## Security Considerations

1. **Token Storage**: CLI tokens should be stored securely (e.g., in OS keychain)
2. **Token Rotation**: Tokens can be revoked and regenerated as needed
3. **Scope Limitation**: CLI tokens can have limited scopes
4. **Rate Limiting**: Polling is rate-limited to prevent abuse
5. **HTTPS Only**: All communication must use HTTPS

## Token Management

### List CLI Tokens
```http
GET /rpc/auth/cli-tokens
Authorization: Bearer user-jwt-token
```

### Revoke CLI Token
```http
POST /rpc/auth/cli-tokens/revoke
Authorization: Bearer user-jwt-token
Content-Type: application/json

{
  "tokenId": "token-id-to-revoke"
}
```