# App Review Notes

OceanCore AI is a fishing and boating planning app. It includes catch logging, marine map conditions, Windy-powered forecast data, AI chat, boat setup notes, saved areas, account settings, legal acceptance, data export, account deletion, and community reports.

## Reviewer Flow

1. Launch the app and sign in or create an account.
2. Accept Terms, Privacy Policy, and Marine Disclaimer during setup.
3. Open Map & Conditions and use manual coordinates if GPS permission is not granted.
4. Log a catch with a supported image type.
5. Open Community to post a general-area report or media item.
6. Open Account & Settings to verify export, deletion controls, legal acceptance, and public legal document links.

## Reviewer Account

Use the dedicated reviewer credentials entered in App Store Connect or Play Console. Do not commit real passwords to this repository. Before submission, run `npm run launch:preflight` against the production backend with `API_URL`, `REVIEWER_EMAIL`, and `REVIEWER_PASSWORD` set. The preflight finalizes store metadata URLs, prepares the reviewer profile, accepts Terms, Privacy Policy, and Marine Disclaimer, confirms sign-in, verifies protected account routes, runs strict smoke, runs full audit, and runs strict store readiness.

## Public Legal Links

- Terms of Service: `/legal/terms-of-service`
- Privacy Policy: `/legal/privacy-policy`
- Account Deletion and Data Rights: `/legal/account-deletion`
- Marine Disclaimer: `/legal/marine-disclaimer`

## Permissions

OceanCore requests location only when the user chooses GPS/map/catch location actions. Camera and media permissions are requested only when the user chooses catch proof, avatar, or community upload actions.

## Safety Disclaimer

OceanCore AI is not a substitute for official forecasts, notices to mariners, navigation charts, local knowledge, or seamanship. The Marine Disclaimer is shown during onboarding and is available from Terms & Privacy.
