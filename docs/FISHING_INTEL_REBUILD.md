# Fishing Intel rebuild: milestone 1

Implemented 27 September 2026.

## Working
- Dedicated Leaflet map, independent of the unconfigured Mapbox token.
- Existing public NOAA-backed API supplies temperature cells; no synthetic observations.
- Temperature gradients derived with latitude-adjusted central differences in C/km. Missing neighbours produce no gradient.
- Colour scales use the loaded area's range, shown in the legend.
- Point inspection, opacity control, preset regions and custom coordinates.
- Observation date and age; old, unknown and future timestamps are flagged.
- Entry from mobile Tools and Map & Conditions. Legacy score panel hidden, code retained.
- Desktop and 390px phone screenshots reviewed; layer switching and point inspection tested with real southeast Queensland data (803 temperature cells). No horizontal overflow observed.
- 26 unit/regression tests pass.

## Limitations
- This is not validated species habitat modelling, a fish-location prediction, or navigation.
- Each load covers a fixed 100 km radius, not continuous ocean-wide data streaming.
- Reuses the existing combined temperature/front API, which can still fail if either upstream dataset fails. It should be replaced with independently cached layer services.
- The displayed gradient is derived from the SST analysis, not the upstream ACSPO gradient product.
- Fine coastline masking, independent layer timestamps, uncertainty and geographic coverage tests are still required.
- No offline downloads, private waypoint persistence, historical time slider or background ingestion yet.
- OpenStreetMap standard tiles are used for the beta with attribution and normal browser caching. No prefetch or bulk download. Review a production tile provider before scaling paid subscriptions.

## Next Milestones
1. Independent SST ingestion/cache and a layer manifest with actual timestamps, resolution, units, coverage and missing-data status.
2. Chlorophyll, Copernicus currents/sea height and GEBCO bathymetry with provider-specific access and attribution.
3. Tiled delivery and history, followed by authenticated private waypoints.
4. Species-specific suitability models, evaluation against held-out observations and explicit uncertainty.
5. Load testing and subscription acceptance. No parity or prediction-accuracy claims before verification.

No paid data services were purchased and no backend deployment is needed for milestone 1.
