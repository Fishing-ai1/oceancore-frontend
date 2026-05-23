# Google Play Data Safety Draft

Use this as the first-pass Play Console data safety form source. Replace `YOUR-PRODUCTION-BACKEND` with the production domain before submission.

## Data Collection

OceanCore AI collects data only to run app features, sync the user's account, personalize AI and trip context, process uploads, support subscriptions, handle feedback/support, and protect the service.

Collected and linked to the user:

- Name and email address.
- User ID and account profile details.
- Precise or coarse location when the user chooses GPS, catch location, saved areas, or map conditions.
- Photos, videos, catch notes, community posts, feedback, AI prompts, and AI responses.
- Purchase or subscription status for plan access.

Not collected:

- Contacts.
- Health or fitness data.
- Browsing history.
- Sensitive personal information.

## Security And Sharing

- Data is sent over HTTPS.
- Account data can be exported in Account & Settings.
- Account deletion is available in Account & Settings and at `https://YOUR-PRODUCTION-BACKEND/legal/account-deletion`.
- Community sharing should use general areas, not exact private marks.
- Photos and community media are checked for type and size before storage.
- JPG, PNG, and WebP image uploads are stripped of common EXIF/XMP/IPTC/text metadata before storage.

## Permissions

- Location: map centering, conditions, catch locations, saved areas.
- Camera: catch proof, avatar images, community media.
- Photos/media: selected catch proof, avatars, and community media.
- Internet: API, maps, Windy forecast, AI, account sync.
