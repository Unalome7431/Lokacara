## Context

The API uploads organizer certificate templates into temporary storage, passes the path to a queued job, and deletes it after distribution. Consequently no organizer state or secure template preview can be restored. Event discovery only searches title/category; event location has venue text, address, and coordinates but no canonical administrative city.

## Goals / Non-Goals

**Goals:**
- Persist organizer template and layout on the owned event and expose an authorized mobile state contract.
- Preserve compatibility with the existing upload/distribute client.
- Store and filter a normalized canonical city across all result pages.

**Non-Goals:**
- Expose certificate/template files publicly.
- Add real-time queue progress tracking.
- Infer uncertain cities by arbitrary substring matching.

## Decisions

1. Add owner-only `GET /api/organizer/events/{event}/certificates` and template stream endpoints. State contains event eligibility, configuration, issued count, last issued time, and a derived `not_configured`, `ready`, or `distributed` status.
2. Upload stores templates under persistent event template storage and updates `certificate_template`. Distribution accepts legacy `template_path`, verifies it belongs to the event, persists layout fields, and queues the persistent template without deleting it. This retains old-client compatibility while preventing arbitrary local paths.
3. Add nullable normalized `city` to events. Offline create/update accepts a required city for new data; online events keep it null. Normalization trims whitespace and compares case-insensitively while preserving display spelling.
4. Discovery accepts `location` and applies exact normalized city matching before pagination. Title keyword remains title-only.
5. A one-time command backfills only addresses with an unambiguous Kota/Kabupaten administrative component. Unresolved rows remain null and are reported for manual correction rather than guessed.

## Risks / Trade-offs

- [Persistent templates consume storage] -> replacing a template deletes the previous owned file and event deletion cleans it up.
- [Legacy template paths may be temporary] -> migrate referenced existing files when possible and reject missing files with explicit state.
- [Some legacy events remain city-null] -> emit a backfill report and exclude unknown rows from exact city searches.
- [Old clients send stale paths] -> accept only the current event-owned path and return a validation error otherwise.

## Migration Plan

Deploy the nullable city migration and compatible certificate endpoints first, run the conservative backfill, then release Android. After Android adoption, require city on all offline API writes. Rollback keeps nullable city data harmless; template records remain valid even if new read endpoints are removed.

## Open Questions

None.
