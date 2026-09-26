# Launch reliability evidence - 26 September 2026

## Released
- Frontend commit: 584c594. Vercel production deployment: dpl_2GbHRESJSrXAGtFuUefMsPJJrun3, READY.
- HTML entry points match; asset version 20260926h and service-worker cache v29.
- Recovery state survives reload, throttled requests do not falsely claim delivery, and repeated reset taps are deduplicated.
- Attachment preparation blocks premature publication. File changes cannot reuse stale results. Failed attachments retain an explicit retry/remove action.
- Message sends are deduplicated, failed drafts are retained, stale conversation responses are ignored, and the inbox has a refresh control.
- Community loading failures display retry controls; stale filter responses cannot replace the current feed.
- Mobile sign-in has readable contrast, constrained scrolling, labelled inputs, and visual-viewport sizing.
- Paid checkout is disabled unless both provider and price configuration are confirmed.
- Production account_settings table restored with RLS ownership checks. Anonymous access denied; authenticated access requires auth.uid() = user_id. No existing posts or accounts changed.

## Backend Release Pending
- Commit df89746 is pushed to GitHub.
- Corrects Supabase email redirect query parameters and prevents held messages appearing to recipients.
- Expected build ID: OC_BACKEND_2026-09-26_LAUNCH_RELIABILITY.
- Latest observed Render health still reports OC_BACKEND_2026-09-22_MONETIZATION_FOUNDATION.
- Connected Render browser requires sign-in. Server-side fixes must not be described as live until the expected build is observed.

## Verification
- Frontend: 21 regression tests passed.
- Backend: auth redirect and fail-closed server tests passed.
- Full audit: nine groups passed, including two-user friendship approval, third-user isolation, blocking and held-message privacy.
- Backend tests repeated successfully from a clean checkout of df89746, excluding unrelated local changes.
- Browser: guest production feed loaded; Home posting opens the login gate; Continue browsing works; mobile Tools and Boat AI entry checked. Sign-in visually checked at the mobile viewport (375 x 667 reported by the page); no console errors captured in that production check.
- Database metadata verifies RLS, ownership policy and grants on account_settings. Security advisors reported no finding for that table.

## Still Required Before Calling The Platform Launch-Ready
- Deploy and verify the backend release in Render.
- Daniel must verify receipt of the newest reset email, complete password change and sign in again.
- Real authenticated two-account acceptance: post/photo/video upload, comments, follow/friend actions, messages, block/report and saved settings after reload. Disposable fixture tests are not proof of production email or account persistence.
- Physical-phone keyboard, upload and scrolling checks; emulation cannot establish all iOS/Android behavior.
- Billing remains unavailable. Crews/groups and other provider-dependent features must be judged by real acceptance tests, not navigation alone.
- Database security review remains: mutable function search paths, publicly executable security-definer functions, extension placement and leaked-password protection. No broad grants or bulk policy changes were made.

Relevant Supabase remediation documentation:
- [Function search path](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)
- [Security-definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable)
- [Extension placement](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public)
- [Password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

No numerical readiness score is claimed from these checks.
