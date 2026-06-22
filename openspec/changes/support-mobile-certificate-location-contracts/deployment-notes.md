# Deployment Notes: Mobile Certificate & Location Contracts

## Deployment Order

1. **Run migration first** (no downtime, nullable column):
   ```bash
   php artisan migrate
   ```

2. **Deploy updated API code** (all endpoints are additive/backward-compatible)

3. **Run conservative city backfill**:
   ```bash
   php artisan events:backfill-cities
   ```
   - Only backfills offline events where `city` is null
   - Parses `Kota X` and `Kabupaten X` from address text
   - Reports unresolved events for manual review
   - Safe to run repeatedly (idempotent)
   - Case-insensitive matching preserves original form

4. **Release Android update** that uses new endpoints

5. **After Android adoption**, make `city` required on all offline event writes (future)

## New API Endpoints

### GET `/api/organizer/events/{event}/certificates`
**Auth:** Sanctum (owner only)

**Response:**
```json
{
  "event": { "..." },
  "is_eligible": true,
  "has_template": true,
  "issued_count": 5,
  "last_issued_at": "2026-07-16T10:00:00Z",
  "status": "ready",
  "layout": {
    "font_family": "Roboto",
    "font_color": "#000000",
    "font_size": "Medium",
    "x_pos": 50,
    "is_x_center": true,
    "y_pos": 50,
    "is_y_center": true,
    "max_width": 80,
    "max_height": 20
  }
}
```

**Status values:**
- `not_configured` — no template file, no font family saved
- `ready` — template and layout configured, not yet distributed
- `distributed` — at least one certificate has been issued

### GET `/api/organizer/events/{event}/certificates/template/stream`
**Auth:** Sanctum (owner only)
**Response:** Image binary with correct content type
**404:** No template stored or file missing

### Changed: POST `/api/organizer/events/{event}/certificates/template`
- Now stores in `event-templates/{event_id}/` instead of `temp/`
- Atomically replaces previous template (old file deleted after new succeeds)
- Updates `certificate_template` on the Event model
- Response format unchanged

### Changed: POST `/api/organizer/events/{event}/certificates/distribute`
- Accepts `template_path` that matches event-owned template (legacy compatible)
- Rejects unrelated template paths with 404
- Persists layout fields (`font_family`, `font_color`, etc.) to Event before dispatch
- Template file is **NOT** deleted after distribution (persistent)

### New: `location` filter on GET `/api/events/search`
- `?location=Surakarta` — exact, case-insensitive city match
- Only matches the `city` column, never venue name or address substrings
- Applied before pagination, works across all pages
- Events with null city excluded from location-filtered results

## Event Create/Update Changes

- `city` field added to event resources:
  - **Required** for `type=offline` (422 if missing on create)
  - **Nullified** for `type=online`
  - On type switch from offline to online, city is cleared
- City value is trimmed (leading/trailing whitespace removed)
- City field is nullable string, indexed

## Rollback

- The `city` column is nullable — removing the code keeps data harmless
- Certificate template files in `event-templates/` are owned by events; deleting an event cleans the directory
- Template state endpoint can be removed without data loss
- Old `temp/` upload files from previous deployment are unaffected

## Android Team Notes

- Replace local certificate state fallback with `GET /api/organizer/events/{id}/certificates`
- Use `GET /api/organizer/events/{id}/certificates/template/stream` for template preview (replaces public storage URL)
- Send `city` field on offline event create/update
- Use `location` parameter on search instead of client-side venue filtering
- Old `template_path` values sent in distribute requests still work (backward compatible)
- Upload now returns path in `event-templates/` prefix, not `temp/`
