# OceanCore AI Launch Status

Updated: June 15, 2026

## Current readiness

- Public web beta: 95%
- Private mobile beta: 90%
- App Store / Play Store submission: 90%
- Fully approved public mobile launch: 80%

## Completed

- Production frontend and backend deployed.
- Resilient cloud API connection and cold-start fallback.
- Simplified primary navigation and recommendation-first home.
- Dedicated community video watch experience.
- Catch Log, Windy map, AI Chat, Boat AI, Community, Rewards, Settings, Admin, legal, export, and account deletion flows.
- Long-video resumable upload support.
- Android and iOS Capacitor wrapper projects.
- Store icons, manifest, offline page, service worker, privacy manifest, Data Safety draft, and review notes.
- Production legal URLs and account deletion URL.
- Full backend, privacy, moderation, rewards, route, and Boat AI maths audit.
- Dependency security audit with zero known vulnerabilities.

## Manual launch requirements

1. Upgrade Render so production does not sleep.
2. Create a dedicated app-review account and run strict launch preflight with its credentials.
3. Configure Stripe products and webhook secrets before enabling paid plans.
4. Have the Terms, Privacy Policy, Marine Disclaimer, rewards, giveaways, and creator program reviewed by an Australian lawyer.
5. Install JDK 17 and Android Studio, create a signing key, then build and test the Android App Bundle.
6. Use a Mac with Xcode and an Apple Developer account to sign and test the iOS build.
7. Run a private beta with real users on weak internet and multiple phone sizes.
8. Capture final store screenshots and submit the signed builds.

## Production release check

```powershell
cd C:\Users\morat\oceancoreAI\fishing-ai-backend
$env:API_URL="https://fishing-ai-backend.onrender.com"
$env:FRONTEND_URL="https://oceancore-frontend.vercel.app"
$env:FRONTEND_APP_PATH=""
$env:REVIEWER_EMAIL="<dedicated-reviewer-email>"
$env:REVIEWER_PASSWORD="<dedicated-reviewer-password>"
npm run launch:preflight
```
