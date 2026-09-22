# OceanCore Monetization Implementation Plan

## Stage 1: Financial Foundation

Status: implemented in repository, awaiting migration and backend deployment.

- Add append-only ad, media, revenue, cost and weekly snapshot ledgers.
- Add server-only RLS and grants.
- Add launch ad-rule defaults, disabled until a provider is connected.
- Add tested health-status and projection calculations.
- Add owner-only financial API permissions.

Exit check: migration applies cleanly, calculation tests pass, and no browser role can read or write financial tables.

## Stage 2: Weekly Financial Health and Simulator

Status: implemented in repository, awaiting backend deployment.

- Add Control Centre > Weekly financial health.
- Show the five-question owner summary, weekly comparison and four-week averages.
- Label Actual, Estimated, Projected and No data.
- Add Conservative, Expected, Strong and Viral simulator presets.
- Keep operational recommendations advisory; no automatic financial changes.

Exit check: owner account can load live zero-data state and simulator projections without fabricated actuals.

## Stage 3: Provider and Playback Instrumentation

- Select and approve an ad provider account.
- Integrate Google IMA or the selected VAST provider into the web Watch player.
- Add native Android/iOS adapters for Capacitor.
- Record opportunity, request, fill, start, impression, completion, skip and click events with idempotency.
- Import provider-confirmed revenue reports.
- Instrument qualified views, watch time and delivered bytes.

Exit check: a provider test campaign reconciles SDK events against the provider report without counting raw views as revenue.

## Stage 4: Cost Imports, Budgets and Weekly Snapshots

- Import Supabase, Render, Vercel, OpenAI and other provider costs.
- Add category budgets, utilization and projected month-end spend.
- Generate immutable Monday-Sunday snapshots with Supabase Cron.
- Deliver an OceanCore Weekly Business Report to the owner.

Exit check: every cost category has a source, status and reconciliation date; weekly snapshots are repeatable and versioned.

## Stage 5: Creator Economics and Fraud Review

- Build creator-level revenue, cost, contribution and margin views.
- Add self-view, repeated-device, abnormal-watch and geographic checks.
- Hold earnings until validation completes.
- Require owner approval before changing payout rates or releasing payouts.

Exit check: payout liabilities never exceed eligible content contribution and every release has an audit record.

## Stage 6: Additional Revenue Streams

- Activate OceanCore Premium after Stripe production verification.
- Add affiliate, marketplace, sponsorship and lawful data-product ledgers.
- Route every stream through the same financial dashboard and weekly snapshot model.

