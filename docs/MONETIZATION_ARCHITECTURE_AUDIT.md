# OceanCore Monetization Architecture Audit

Date: 2026-09-22

## Current Stack

- Frontend: static HTML, CSS and JavaScript deployed through Vercel, plus Capacitor wrappers for Android and iOS.
- API: Fastify and TypeScript deployed on Render.
- Authentication and database: Supabase Auth and Postgres through the server-side Supabase client.
- Media: original images and videos stored in Supabase Storage. Large videos use signed resumable uploads.
- Video playback: native HTML5 video. No adaptive bitrate transcoding, dedicated video CDN or playback analytics provider is connected.
- AI: OpenAI through a server-side gateway. Token usage and known model cost are already recorded when available.
- Billing: Stripe routes and plan catalogue exist, but production Stripe keys and price IDs are not configured.
- Analytics: account activity, community view counts and some social analytics exist. They are not sufficient for financial reporting.
- Administration: a permission-controlled Control Centre already exists with append-only audit history.

## Launch Risks

1. Raw video views cannot be treated as paid impressions or revenue.
2. Supabase Storage egress is a real variable cost, but current video playback does not record delivered bytes or watch minutes reliably.
3. There is no ad provider, provider webhook or provider revenue report connected.
4. There is no canonical revenue or cost ledger.
5. Stripe is disabled, so subscription projections must remain labelled Projected.
6. Creator payouts cannot safely launch until provider revenue, delivery cost and fraud validation are reconciled.
7. The current Render production backend is behind the repository and must be repaired before new financial APIs can go live.

## Recommended Ad Architecture

- Web video: Google Interactive Media Ads client-side SDK with Google Ad Manager or another VAST-compatible provider.
- Native apps: use the provider's native Android and iOS SDK through a Capacitor plugin rather than relying on WebView-only ads.
- Feed placements: provider display/native units controlled by OceanCore's server-side rules engine.
- Event truth: client SDK events record delivery workflow, while provider reports or signed callbacks remain the source of truth for paid impressions and actual revenue.
- Frequency caps: enforce server-side by anonymized session/user counters, with provider-side caps as a second layer.
- Privacy: store hashed session identifiers, coarse country and device class. Do not place exact fishing locations in advertising events.

## Financial Data Model

- `oc_ad_rules`: versioned placement and eligibility rules.
- `oc_ad_events`: append-only ad lifecycle events with idempotency keys.
- `oc_media_events`: qualified views, watch time and delivery evidence.
- `oc_revenue_entries`: append-only revenue ledger labelled Actual, Estimated or Projected.
- `oc_cost_entries`: append-only direct-cost ledger with the same labels.
- `oc_creator_payouts`: validated payout liabilities capped by creator contribution.
- `oc_fraud_signals`: review queue for suspicious creator traffic.
- `oc_financial_targets`: owner targets such as revenue per MAU.
- `oc_monthly_budgets`: category budgets and warning thresholds.
- `oc_weekly_financial_snapshots`: immutable versions of Monday-Sunday reports.

All financial tables are server-only, use Row Level Security, revoke browser-role access, and preserve old ledger/report records.

## Accuracy Rules

- An ad opportunity is not a paid impression.
- A video view is not advertising revenue.
- Provider-confirmed entries override estimates in reporting, but estimates remain in history.
- Empty data displays as No data, never as healthy zero revenue or zero cost.
- Projected simulator values never enter actual ledgers.
- Creator payout cannot exceed eligible revenue minus direct delivery cost.

