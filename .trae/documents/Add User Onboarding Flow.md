I have analyzed the codebase and developed a plan to add an onboarding flow for new users.

### 1. Database Schema Update
- Create a SQL script `scripts/add-is-onboarded-column.sql` to add an `is_onboarded` boolean column (default `false`) to the `user_profiles` table.
- This will allow us to track whether a user has completed the onboarding process.

### 2. Update Type Definitions
- Update the `UserProfile` interface in `lib/profile-service.ts` to include the new `is_onboarded` field.

### 3. Create Onboarding Page
- Create a new page at `app/onboarding/page.tsx`.
- Implement a multi-step or single-page form using `react-hook-form` and `zod`.
- Collect essential user information:
  - **Full Name** (pre-filled if available)
  - **Job Title**
  - **Industry/Field** (optional)
  - **Experience Level** (Junior, Mid, Senior, etc.)
- Upon submission:
  - Update the user's profile with the provided data.
  - Set `is_onboarded` to `true`.
  - Redirect the user to the `/dashboard`.

### 4. Implement Route Protection
- Modify `components/auth/protected-route.tsx` to check the `is_onboarded` status.
- **Logic:**
  - If the user is logged in but `!is_onboarded`, redirect them to `/onboarding` (unless they are already there).
  - If the user is logged in and `is_onboarded`, redirect them to `/dashboard` if they try to access `/onboarding`.
- This ensures all new users must complete onboarding before accessing the main application.
