# OceanCore AI Mobile Wrapper

This folder is the native iOS/Android wrapper home for OceanCore AI. It keeps mobile build files separate from the backend and the hand-built frontend.

## First Setup

```powershell
cd C:\Users\morat\oceancoreAI\mobile-wrapper
npm install
npm run prepare:web
```

To point the native app at a production backend:

```powershell
$env:OCEANCORE_API_URL="https://your-production-backend.example.com"
npm run prepare:web
```

## Android

The Android project has already been generated in `mobile-wrapper/android`.

```powershell
npm run cap:sync
npm run open:android
```

To build locally:

```powershell
npm run android:debug
```

This machine still needs Java/JDK 17+ and the Android SDK before Gradle can build. Set `JAVA_HOME` after installing Android Studio or a JDK.

Android store submission still needs Android Studio, package signing, a release build, Play Console app content forms, screenshots, and internal testing.

## iOS

The iOS project has already been generated in `mobile-wrapper/ios`, including App Store permission descriptions in `ios/App/App/Info.plist` and the Apple privacy manifest in `ios/App/App/PrivacyInfo.xcprivacy`.

```powershell
npm run cap:sync
npm run open:ios
```

iOS release work needs macOS, Xcode, CocoaPods, an Apple Developer account, bundle signing, TestFlight, App Privacy answers, screenshots, and App Review notes.

## Store Metadata

Draft review and privacy answers live in `mobile-wrapper/store-metadata`.

- `app-privacy.json`: source-of-truth draft for Apple App Privacy answers and the iOS privacy manifest.
- `play-data-safety.md`: first-pass Google Play Data Safety form notes.
- `review-notes.md`: App Review notes and reviewer flow.

Replace `YOUR-PRODUCTION-BACKEND` with the final production domain before submitting.

## Permissions To Declare

OceanCore should only request permissions when the user taps the relevant action.

- Location: Map GPS, saved areas, catch location.
- Camera: Catch photo and community upload.
- Photos/media: Catch proof, avatars, community media.
- Notifications: Trip/weather/community alerts, only after a user enables them.

Suggested iOS usage text:

- Location: OceanCore uses your location to center marine conditions, saved areas, and catch logs when you ask it to.
- Camera: OceanCore uses the camera when you add catch proof, avatar images, or community media.
- Photos: OceanCore uses selected photos and videos for catch proof, avatars, and community sharing.
- Notifications: OceanCore sends trip, weather, boat, and community alerts you enable.

## Release Rule

Before each native release:

1. Run the backend smoke tests.
2. Run `npm run prepare:web`.
3. Run `npm run cap:sync`.
4. Run `npm run store:check` from `fishing-ai-backend` while the production-like backend is running.
5. Test login, legal acceptance, catch photo upload, map GPS, Windy forecast, community media, account export, and account deletion on a real device.
