## ADDED Requirements

### Requirement: Organizer reads persistent certificate state
The API SHALL allow only the event owner to retrieve certificate eligibility, saved configuration, template availability, issued count, last issued time, and derived distribution status.

#### Scenario: Owner reads configured event
- **WHEN** the authenticated owner requests certificate state for a configured event
- **THEN** the API returns the saved layout, template availability, eligibility, issued count, last issued time, and status

#### Scenario: Non-owner requests state
- **WHEN** an authenticated non-owner requests certificate state
- **THEN** the API returns forbidden without disclosing configuration

### Requirement: Organizer securely streams the saved template
The API SHALL stream the current certificate template only to the event owner.

#### Scenario: Owner previews template
- **WHEN** the owner requests the template and the file exists
- **THEN** the API returns the image binary with its correct content type

#### Scenario: Template is unavailable
- **WHEN** no template exists or storage is missing the file
- **THEN** the API returns not found

### Requirement: Certificate configuration survives distribution
The API SHALL persist the event template and layout used for certificate distribution.

#### Scenario: New client distributes certificates
- **WHEN** the owner distributes using the event's persisted template
- **THEN** layout values are saved, the job uses that template, and the template remains after completion

#### Scenario: Legacy client distributes certificates
- **WHEN** a legacy request supplies the current event-owned template path
- **THEN** the API accepts it with the same persisted behavior

#### Scenario: Request supplies an unrelated path
- **WHEN** a supplied template path does not belong to the event
- **THEN** the API rejects the request without reading or deleting that file

### Requirement: Replacing templates manages storage ownership
The API SHALL remove the previous owned template only after a replacement has been stored successfully.

#### Scenario: Replacement succeeds
- **WHEN** the owner uploads a valid replacement
- **THEN** the event points to the new file and the previous file is removed

#### Scenario: Replacement fails
- **WHEN** validation or storage fails
- **THEN** the previous template and configuration remain usable
