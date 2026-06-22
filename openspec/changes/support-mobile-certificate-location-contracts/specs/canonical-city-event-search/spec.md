## ADDED Requirements

### Requirement: Offline events store a canonical city
The API SHALL persist a normalized administrative city for offline events created or updated by organizer clients.

#### Scenario: Offline event includes city
- **WHEN** an organizer submits an offline event with a valid city
- **THEN** the city is normalized and persisted with the event

#### Scenario: Online event is submitted
- **WHEN** an organizer submits an online event
- **THEN** location city remains null and does not affect online event validation

### Requirement: Discovery filters by exact canonical city
The discovery API SHALL apply the location filter to canonical city before pagination and SHALL NOT search venue or address substrings as substitutes.

#### Scenario: Exact city matches
- **WHEN** `location=Surakarta` is requested
- **THEN** only active future events whose normalized city equals Surakarta are paginated

#### Scenario: Venue contains city text
- **WHEN** an event in another city contains Surakarta in its venue name or address text
- **THEN** it is not included in the Surakarta result

#### Scenario: City is unknown
- **WHEN** a legacy event has a null city
- **THEN** it is excluded from location-filtered results

### Requirement: Legacy cities are backfilled conservatively
The system SHALL provide a repeatable backfill that assigns city only when an administrative Kota/Kabupaten component can be established unambiguously.

#### Scenario: Legacy address is unambiguous
- **WHEN** a legacy address contains an identifiable administrative city component
- **THEN** the command stores its normalized canonical city

#### Scenario: Legacy address is ambiguous
- **WHEN** the city cannot be established confidently
- **THEN** the event remains null and is included in the command's unresolved report
