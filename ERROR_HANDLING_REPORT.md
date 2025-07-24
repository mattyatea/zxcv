# API Error Handling Analysis Report

## Summary

I've analyzed the error handling patterns across the oRPC-based API. Here's what I found:

## Current Error Handling Patterns

### 1. **ORPCError Usage**

The codebase consistently uses `ORPCError` from `@orpc/server` for throwing errors. Common patterns include:

```typescript
// Authentication errors
throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });

// Not found errors
throw new ORPCError("NOT_FOUND", { message: "Rule not found" });

// Validation/Bad request errors
throw new ORPCError("BAD_REQUEST", { message: "Invalid rule path format" });

// Conflict errors
throw new ORPCError("CONFLICT", { message: "User already exists" });

// Forbidden errors
throw new ORPCError("FORBIDDEN", { message: "Email verification required" });

// Internal server errors
throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Login failed" });
```

### 2. **Error Response Format**

Based on actual API testing, the error responses follow this format:

```json
{
  "defined": false,
  "code": "ERROR_CODE",
  "status": HTTP_STATUS_CODE,
  "message": "Error message",
  "data": { /* Optional additional data */ }
}
```

#### Examples:

**Validation Error (400):**
```json
{
  "defined": false,
  "code": "BAD_REQUEST",
  "status": 400,
  "message": "Input validation failed",
  "data": {
    "issues": [
      {
        "validation": "regex",
        "code": "invalid_string",
        "message": "Invalid",
        "path": ["username"]
      }
    ]
  }
}
```

**Internal Server Error (500):**
```json
{
  "defined": false,
  "code": "INTERNAL_SERVER_ERROR",
  "status": 500,
  "message": "Internal server error"
}
```

### 3. **Error Handling Issues Found**

1. **Overly Broad Try-Catch Blocks**: In `auth.ts`, the login handler catches all errors and re-throws them as either BAD_REQUEST or INTERNAL_SERVER_ERROR, losing the original error context:
   ```typescript
   } catch (error) {
     console.error("Login error:", error);
     if (error instanceof Error) {
       throw new ORPCError("BAD_REQUEST", { message: error.message });
     }
     throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Login failed" });
   }
   ```
   This causes UNAUTHORIZED errors to become INTERNAL_SERVER_ERROR.

2. **Missing Error Documentation**: The OpenAPI spec only documents successful (200) responses. Error responses (400, 401, 403, 404, 409, 500) are not documented.

3. **Inconsistent Error Handling**: Some procedures properly propagate specific errors while others catch and generalize them.

### 4. **Middleware Error Handling**

The middleware properly throws specific errors:
- `authRequired`: Throws UNAUTHORIZED when no user
- `emailVerificationRequired`: Throws FORBIDDEN when email not verified

### 5. **HTTP Status Code Mapping**

The oRPC framework correctly maps error codes to HTTP status codes:
- `BAD_REQUEST` → 400
- `UNAUTHORIZED` → 401
- `FORBIDDEN` → 403
- `NOT_FOUND` → 404
- `CONFLICT` → 409
- `INTERNAL_SERVER_ERROR` → 500

## Recommendations

1. **Remove Broad Try-Catch Blocks**: Let ORPCErrors propagate naturally instead of catching and re-throwing them.

2. **Document Error Responses**: Update the OpenAPI generator to include error response schemas.

3. **Consistent Error Messages**: Use consistent error messages across similar scenarios.

4. **Add Error Response Types**: Define TypeScript types for error responses to ensure consistency.

5. **Error Logging**: Log errors with appropriate context while returning user-friendly messages.

## Conclusion

The error handling infrastructure is well-designed with proper use of `ORPCError` and correct HTTP status mapping. The main issues are:
1. Overly broad error catching in some procedures
2. Lack of error documentation in OpenAPI spec
3. Minor inconsistencies in error handling patterns

These issues can be easily fixed to provide a more robust and well-documented API error handling system.