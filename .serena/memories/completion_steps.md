1. Inspect `adminAuth.ts` middleware and adjust context type expectations to include db/user/locale provided by `dbWithAuth` while keeping admin role check.
2. Update all user-fetching logic in specified files to include `role`, defaulting to `'user'` if missing.
3. Validate changes compile logically (lint/unit tests if available), and summarize modifications.