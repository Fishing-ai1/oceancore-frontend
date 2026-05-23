# OceanCore AI App Store Readiness

This repo is now prepared for a store wrapper, but it is not yet a submitted iOS/Android binary. Use this checklist before TestFlight, Google Play internal testing, or production review.

## Web App Package

- App entry: `http://localhost:4000/app/`
- Manifest: `fishing-ai-frontend/manifest.webmanifest`
- Service worker: `fishing-ai-frontend/sw.js`
- Offline fallback: `fishing-ai-frontend/offline.html`
- Icons: `fishing-ai-frontend/assets/icons/`
- Backend health: `/health`
- Route debug: `/__debug/routes`

## Store Wrapper

Recommended path:

1. Use `mobile-wrapper/` as the Capacitor wrapper project.
2. Use bundle id/package name:
   - iOS: `ai.oceancore.app`
   - Android: `ai.oceancore.app`
3. Use `OceanCore AI` as display name.
4. Use `assets/icons/store-icon-1024.png` for store artwork.
5. Keep the web app hosted through the backend origin so auth, service worker scope, manifest, and API calls stay same-origin.

Native submission still needs the actual iOS and Android wrapper projects, store certificates, app signing, TestFlight/Play internal testing, and screenshots from real devices.

Android has been scaffolded in `mobile-wrapper/android`. A local APK/AAB build still needs Java/JDK 17+ and Android SDK/Android Studio installed.
iOS has been scaffolded in `mobile-wrapper/ios`. Final iOS build/signing still needs macOS, Xcode, CocoaPods, and an Apple Developer account.

Production backend CORS must allow Capacitor origins:

```text
NATIVE_APP_ORIGINS=capacitor://localhost,ionic://localhost,http://localhost,https://localhost
```

Wrapper commands:

```powershell
cd C:\Users\morat\oceancoreAI\mobile-wrapper
npm install
$env:OCEANCORE_API_URL="https://your-production-backend.example.com"
npm run prepare:web
npm run cap:add:android
npm run cap:sync
npm run open:android
```

Run the same flow on macOS for `cap:add:ios` and `open:ios`.

## Store Listing Draft

- App name: OceanCore AI
- Subtitle: Fishing, boating, and marine planning
- Short description: Plan trips, log catches, check marine conditions, manage boat details, and use AI support from one fishing app.
- Primary category: Sports
- Secondary category: Weather or Navigation
- Keywords: fishing, boating, marine, catch log, weather, Windy, tides, boat, Moreton Bay, trip planning
- Privacy policy URL: `https://YOUR-PRODUCTION-BACKEND/legal/privacy-policy`

Public legal URLs:

- Terms: `/legal/terms-of-service`
- Privacy: `/legal/privacy-policy`
- Account deletion and data rights: `/legal/account-deletion`
- Marine disclaimer: `/legal/marine-disclaimer`

Native privacy metadata:

- Apple privacy manifest: `mobile-wrapper/ios/App/App/PrivacyInfo.xcprivacy`
- Apple/Google privacy answers: `mobile-wrapper/store-metadata/app-privacy.json`
- Google Play Data Safety draft: `mobile-wrapper/store-metadata/play-data-safety.md`
- App Review notes: `mobile-wrapper/store-metadata/review-notes.md`

Current disclosure position: no third-party tracking, linked account data for email/name/user ID, user-selected location, user content uploads/posts/prompts, and purchase/subscription status for app functionality.

Long description:

OceanCore AI helps fishers and boaters plan safer trips, log catches, read local marine conditions, manage saved areas, and ask AI questions about trips, tactics, gear, and boating setup. Keep private catch records, share general-area community reports, review Windy-powered conditions, and manage your account and privacy settings from one app.

Important: OceanCore AI is a planning and logging assistant. It is not a replacement for official forecasts, marine warnings, navigation charts, local knowledge, or safe seamanship.

## Screenshot Set

Capture these on iPhone and Android before submission:

- Home / Community feed
- Catch Log
- Map & Conditions with Windy forecast visible
- AI Chat
- Boat AI
- Account & Settings
- Terms & Privacy

## Required Store Review Items

- Account creation works.
- Account deletion works from Account & Settings > Data.
- Data export works from Account & Settings > Data.
- Terms, Privacy, and Marine Disclaimer are visible before sign-up.
- Legal docs are available in-app from Terms & Privacy.
- Location permission is user initiated except when the user enables GPS-on-open in settings.
- Camera/photo access is user initiated from Catch Log and Community.
- OceanCore clearly states it is not a substitute for official forecasts, charts, local knowledge, or seamanship.

## Privacy Nutrition Labels / Data Safety

Likely data collected:

- Account email and profile details.
- Catch logs, notes, photos, and optional catch location.
- Saved areas and optional exact GPS.
- Community posts, comments, likes, reports, media uploads.
- AI prompts/responses and optional chat history.
- Billing/subscription status if Stripe is enabled.
- App diagnostics/feedback submitted by the user.

Likely purposes:

- App functionality.
- Account sync.
- Personalization.
- Customer support.
- Safety and moderation.
- Analytics/diagnostics if added later.

Sensitive notes:

- Fishing marks and exact GPS should be treated as private user content.
- Uploaded JPG, PNG, and WebP images are stripped of common EXIF/XMP/IPTC/text metadata before storage.
- HEIC/HEIF uploads are accepted for iPhone compatibility, but should be real-device tested for metadata behavior before public launch.
- Community sharing must stay general-area by default.

## Native Permission Copy

Android permissions are declared in `mobile-wrapper/android/app/src/main/AndroidManifest.xml`.
iOS permission strings are declared in `mobile-wrapper/ios/App/App/Info.plist`.
iOS privacy manifest is bundled from `mobile-wrapper/ios/App/App/PrivacyInfo.xcprivacy`.

Use these same meanings in store review forms:

- Location: user-requested marine map centering, saved areas, and catch location.
- Camera: user-requested catch proof, avatar images, and community media.
- Photos/videos: user-selected catch proof, avatars, and community media.
- Microphone: only if the user records a video clip with audio.
- Notifications: trip, weather, boat, and community alerts only when enabled.

## Upload Policy

Backend upload validation is intentionally strict for launch:

- Avatars: JPG, PNG, WebP, HEIC, or HEIF under 5MB.
- Catch photos: JPG, PNG, WebP, HEIC, or HEIF under 12MB.
- Community media: JPG, PNG, WebP, HEIC, HEIF, MP4, MOV, or WebM under 35MB.
- External community media URLs must be HTTPS or an OceanCore `/media/` URL.
- The backend checks file signatures before writing uploads to disk.
- The backend strips common JPG, PNG, and WebP metadata before writing image uploads to disk.

## Final Release Gates

- Run Supabase `supabase/schema.sql`.
- Set production env vars from `fishing-ai-backend/PRODUCTION_CHECKLIST.md`.
- Run the one-command launch preflight:

  ```powershell
  $env:API_URL="https://YOUR-PRODUCTION-BACKEND"
  $env:REVIEWER_EMAIL="app-review-account@example.com"
  $env:REVIEWER_PASSWORD="review-account-password"
  npm run launch:preflight
  ```

  This finalizes store metadata URLs, prepares the reviewer account, runs strict authenticated smoke, runs the full production audit, runs strict store readiness, and runs `npm audit --audit-level=moderate`. Set `REVIEWER_CREATE=true` only when you intentionally want the prep script to create the reviewer account. Confirm the account email first if Supabase requires confirmation.
- If the launch preflight fails, debug with the individual commands:

  ```powershell
  $env:API_URL="https://YOUR-PRODUCTION-BACKEND"
  npm run store:metadata
  npm run reviewer:prepare
  npm run smoke
  npm run audit:full
  $env:STRICT_STORE_CHECK="true"
  npm run store:check
  ```

  Use a real dedicated reviewer account, accept Terms, Privacy, and Marine Disclaimer on that account before submission, and enter those credentials only in the app-store review forms and local shell environment. Do not commit the password.
- Verify live Windy conditions.
- Verify community media upload.
- Verify account delete removes profile, catches, saved areas, community data, AI chats, and settings.
- Test on iPhone Safari, Android Chrome, and the native wrapper.
- Capture store screenshots for Home, Catch Log, Map & Conditions, AI Chat, Boat AI, and Account Settings.
- Replace all `YOUR-PRODUCTION-BACKEND` placeholders in store metadata before submission.
