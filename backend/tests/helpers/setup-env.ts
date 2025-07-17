import { env } from "cloudflare:test";
import { beforeAll } from "vitest";
import { mockR2, mockEmailSender } from "./setup";

// Setup global test environment
beforeAll(() => {
  const testEnv = env as any;
  
  // Mock R2 if not available
  if (!testEnv.R2) {
    testEnv.R2 = mockR2;
  }

  // Mock Email Sender if not available  
  if (!testEnv.EMAIL_SENDER) {
    testEnv.EMAIL_SENDER = mockEmailSender;
  }

  // Set test environment variables
  if (!testEnv.JWT_SECRET) {
    testEnv.JWT_SECRET = "test-jwt-secret";
  }
  if (!testEnv.JWT_ALGORITHM) {
    testEnv.JWT_ALGORITHM = "HS256";
  }
  if (!testEnv.JWT_EXPIRES_IN) {
    testEnv.JWT_EXPIRES_IN = "1h";
  }
  if (!testEnv.REFRESH_TOKEN_EXPIRES_IN) {
    testEnv.REFRESH_TOKEN_EXPIRES_IN = "7d";
  }
  if (!testEnv.EMAIL_FROM) {
    testEnv.EMAIL_FROM = "test@example.com";
  }
  if (!testEnv.FRONTEND_URL) {
    testEnv.FRONTEND_URL = "http://localhost:3000";
  }
  if (!testEnv.RATE_LIMIT_AUTHENTICATED) {
    testEnv.RATE_LIMIT_AUTHENTICATED = "1000";
  }
  if (!testEnv.RATE_LIMIT_ANONYMOUS) {
    testEnv.RATE_LIMIT_ANONYMOUS = "100";
  }
});