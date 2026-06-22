## 1. Persistent Organizer Certificate State

- [x] 1.1 Add owner-only certificate state and template stream routes with OpenAPI documentation.
- [x] 1.2 Implement a typed state response containing eligibility, saved layout, template availability, issued count, last issued time, and derived status.
- [x] 1.3 Change template upload to store an event-owned persistent file and atomically replace/clean the previous template.
- [x] 1.4 Update distribute validation to accept the persisted template and retain compatibility with the current event-owned legacy template path.
- [x] 1.5 Persist layout fields before dispatch and stop DistributeCertificatesJob from deleting the event template.
- [x] 1.6 Clean owned template storage when an event is permanently deleted.
- [x] 1.7 Add feature tests for ownership, state shape, streaming, replacement rollback, legacy compatibility, unrelated paths, and post-job persistence.

## 2. Canonical Event City

- [x] 2.1 Add a nullable indexed `city` column to events and update the model/OpenAPI event schema.
- [x] 2.2 Accept, normalize, and persist city on offline organizer create/update while clearing it for online events.
- [x] 2.3 Add exact case-insensitive `location` filtering to DiscoveryController before ordering and pagination.
- [x] 2.4 Add a repeatable conservative backfill command that parses unambiguous Kota/Kabupaten address components and reports unresolved events.
- [x] 2.5 Add feature tests for offline/online validation, normalization, exact Surakarta matching, venue false positives, null legacy data, and multi-page filtering.

## 3. Compatibility and Verification

- [x] 3.1 Run the existing certificate, event management, dashboard, and discovery feature test suites.
- [x] 3.2 Run `php artisan test` and `vendor/bin/pint --test`.
- [x] 3.3 Exercise old and new mobile request shapes against local storage and queue workers.
- [x] 3.4 Document deployment order, migration/backfill commands, response examples, and rollback behavior for the Android team.
