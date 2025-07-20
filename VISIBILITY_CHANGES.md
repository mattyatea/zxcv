# Rule Visibility Permission Changes

## Summary
Updated the `get` endpoint in `/server/orpc/procedures/rules.ts` to include visibility permission checks similar to the existing `getContent` endpoint.

## Changes Made

### 1. Import Updates
- Added `dbWithOptionalAuth` to the imports from `~/server/orpc/middleware/combined`

### 2. Middleware Change
- Changed the `get` endpoint from using `dbProvider` to `dbWithOptionalAuth`
- This allows the endpoint to work for both authenticated and unauthenticated users

### 3. Permission Checks Added
The `get` endpoint now includes the following visibility checks:

#### Private Rules
- Only accessible by the owner (rule.userId must match user.id)
- Returns `FORBIDDEN` error with message "Access denied to private rule" for non-owners

#### Team Rules
- Requires authentication (returns `UNAUTHORIZED` error with message "Authentication required for team rules" if not authenticated)
- Accessible by:
  - Team members (checked via teamMember table)
  - The rule owner (even if not a team member)
- Returns `FORBIDDEN` error with message "Access denied to team rule" for non-members/non-owners

#### Public Rules
- Accessible by anyone (no restrictions)

### 4. Consistency Fix
- Also updated the `getContent` endpoint to use `dbWithOptionalAuth` for consistency
- Added proper destructuring of `user` from context in `getContent`

## Testing
Created test file `/tests/rules-visibility.test.ts` with test cases covering all visibility scenarios:
- Public rule access (anyone)
- Private rule access (owner only)
- Team rule access (team members and owner)
- Error cases for unauthorized access

## Impact
- The `get` endpoint now properly enforces visibility permissions
- Maintains backward compatibility for public rules
- Provides consistent behavior between `get` and `getContent` endpoints
- Properly handles unauthenticated users