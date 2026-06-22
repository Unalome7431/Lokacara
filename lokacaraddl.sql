-- Create the Database
CREATE DATABASE [Lokacara];
GO

USE [Lokacara];
GO

-- -------------------------------------------------------------
-- 1. Core Users and Authentication
-- -------------------------------------------------------------

CREATE TABLE [users] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [name] NVARCHAR(255) NULL,
  [email] NVARCHAR(255) NOT NULL UNIQUE,
  [email_verified_at] DATETIME2 NULL,
  [password] NVARCHAR(255) NULL,
  [two_factor_secret] NVARCHAR(MAX) NULL,
  [two_factor_recovery_codes] NVARCHAR(MAX) NULL,
  [two_factor_confirmed_at] DATETIME2 NULL,
  [avatar_url] NVARCHAR(255) NULL,
  [phone] NVARCHAR(255) NULL,
  [location] NVARCHAR(255) NULL,
  [notifications_enabled] BIT NOT NULL CONSTRAINT [DF_users_notifications_enabled] DEFAULT 1,
  [role] NVARCHAR(255) NOT NULL CONSTRAINT [DF_users_role] DEFAULT 'user',
  [suspended_at] DATETIME2 NULL,
  [provider_id] NVARCHAR(255) NULL,
  [provider] NVARCHAR(255) NULL,
  [otp_code] NVARCHAR(255) NULL,
  [otp_expires_at] DATETIME2 NULL,
  [remember_token] NVARCHAR(100) NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL
);
GO

CREATE TABLE [password_reset_tokens] (
  [email] NVARCHAR(255) PRIMARY KEY,
  [token] NVARCHAR(255) NOT NULL,
  [created_at] DATETIME2 NULL
);
GO

CREATE TABLE [sessions] (
  [id] NVARCHAR(255) PRIMARY KEY,
  [user_id] BIGINT NULL,
  [ip_address] NVARCHAR(45) NULL,
  [user_agent] NVARCHAR(MAX) NULL,
  [payload] NVARCHAR(MAX) NOT NULL,
  [last_activity] INT NOT NULL
);
CREATE INDEX [IX_sessions_user_id] ON [sessions] ([user_id]);
CREATE INDEX [IX_sessions_last_activity] ON [sessions] ([last_activity]);
GO

CREATE TABLE [personal_access_tokens] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [tokenable_type] NVARCHAR(255) NOT NULL,
  [tokenable_id] BIGINT NOT NULL,
  [name] NVARCHAR(MAX) NOT NULL,
  [token] NVARCHAR(64) NOT NULL UNIQUE,
  [abilities] NVARCHAR(MAX) NULL,
  [last_used_at] DATETIME2 NULL,
  [expires_at] DATETIME2 NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL
);
CREATE INDEX [IX_personal_access_tokens_tokenable] ON [personal_access_tokens] ([tokenable_type], [tokenable_id]);
CREATE INDEX [IX_personal_access_tokens_expires_at] ON [personal_access_tokens] ([expires_at]);
GO

CREATE TABLE [push_tokens] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [user_id] BIGINT NOT NULL,
  [token] NVARCHAR(255) NOT NULL UNIQUE,
  [platform] NVARCHAR(255) NOT NULL CONSTRAINT [DF_push_tokens_platform] DEFAULT 'android',
  [last_used_at] DATETIME2 NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_push_tokens_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
);
GO


-- -------------------------------------------------------------
-- 2. Infrastructure (Cache, Jobs & Queue Management)
-- -------------------------------------------------------------

CREATE TABLE [cache] (
  [key] NVARCHAR(255) PRIMARY KEY,
  [value] NVARCHAR(MAX) NOT NULL,
  [expiration] INT NOT NULL
);
CREATE INDEX [IX_cache_expiration] ON [cache] ([expiration]);
GO

CREATE TABLE [cache_locks] (
  [key] NVARCHAR(255) PRIMARY KEY,
  [owner] NVARCHAR(255) NOT NULL,
  [expiration] INT NOT NULL
);
CREATE INDEX [IX_cache_locks_expiration] ON [cache_locks] ([expiration]);
GO

CREATE TABLE [jobs] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [queue] NVARCHAR(255) NOT NULL,
  [payload] NVARCHAR(MAX) NOT NULL,
  [attempts] TINYINT NOT NULL,
  [reserved_at] INT NULL,
  [available_at] INT NOT NULL,
  [created_at] INT NOT NULL
);
CREATE INDEX [IX_jobs_queue] ON [jobs] ([queue]);
GO

CREATE TABLE [job_batches] (
  [id] NVARCHAR(255) PRIMARY KEY,
  [name] NVARCHAR(255) NOT NULL,
  [total_jobs] INT NOT NULL,
  [pending_jobs] INT NOT NULL,
  [failed_jobs] INT NOT NULL,
  [failed_job_ids] NVARCHAR(MAX) NOT NULL,
  [options] NVARCHAR(MAX) NULL,
  [cancelled_at] INT NULL,
  [created_at] INT NOT NULL,
  [finished_at] INT NULL
);
GO

CREATE TABLE [failed_jobs] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [uuid] NVARCHAR(255) NOT NULL UNIQUE,
  [connection] NVARCHAR(MAX) NOT NULL,
  [queue] NVARCHAR(MAX) NOT NULL,
  [payload] NVARCHAR(MAX) NOT NULL,
  [exception] NVARCHAR(MAX) NOT NULL,
  [failed_at] DATETIME2 NOT NULL CONSTRAINT [DF_failed_jobs_failed_at] DEFAULT GETDATE()
);
GO


-- -------------------------------------------------------------
-- 3. Categories and Locations
-- -------------------------------------------------------------

CREATE TABLE [categories] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [name] NVARCHAR(255) NOT NULL,
  [slug] NVARCHAR(255) NOT NULL UNIQUE,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL
);
GO

CREATE TABLE [locations] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [name] NVARCHAR(255) NOT NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL
);
GO


-- -------------------------------------------------------------
-- 4. Events Management
-- -------------------------------------------------------------

CREATE TABLE [events] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [user_id] BIGINT NOT NULL,
  [category_id] BIGINT NULL,
  [type] NVARCHAR(50) NOT NULL CONSTRAINT [CK_events_type] CHECK ([type] IN ('online', 'offline')),
  [poster] NVARCHAR(255) NULL,
  [title] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX) NOT NULL,
  [price] INT NULL CONSTRAINT [DF_events_price] DEFAULT 0,
  [location_name] NVARCHAR(255) NULL,
  [address] NVARCHAR(255) NULL,
  [city] NVARCHAR(255) NULL,
  [latitude] DECIMAL(10, 8) NULL,
  [longitude] DECIMAL(11, 8) NULL,
  [platform_name] NVARCHAR(255) NULL,
  [link] NVARCHAR(255) NULL,
  [start_datetime] DATETIME2 NOT NULL,
  [end_datetime] DATETIME2 NOT NULL,
  [capacity] INT NULL,
  [view_count] INT NOT NULL CONSTRAINT [DF_events_view_count] DEFAULT 0,
  [status] NVARCHAR(20) NOT NULL CONSTRAINT [DF_events_status] DEFAULT 'active',
  [certificate_template] NVARCHAR(255) NULL,
  [certificate_font_family] NVARCHAR(255) NULL,
  [certificate_font_size] NVARCHAR(255) NULL,
  [certificate_font_color] NVARCHAR(255) NULL,
  [certificate_x_pos] FLOAT NULL,
  [certificate_is_x_center] BIT NOT NULL CONSTRAINT [DF_events_certificate_is_x_center] DEFAULT 1,
  [certificate_y_pos] FLOAT NULL,
  [certificate_is_y_center] BIT NOT NULL CONSTRAINT [DF_events_certificate_is_y_center] DEFAULT 1,
  [certificate_max_width] FLOAT NULL CONSTRAINT [DF_events_certificate_max_width] DEFAULT 80.0,
  [certificate_max_height] FLOAT NULL CONSTRAINT [DF_events_certificate_max_height] DEFAULT 20.0,
  [deleted_at] DATETIME2 NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_events_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE,
  CONSTRAINT [FK_events_category_id] FOREIGN KEY ([category_id]) REFERENCES [categories] ([id]) ON DELETE SET NULL
);
CREATE INDEX [IX_events_city] ON [events] ([city]);
GO

CREATE TABLE [bookmarks] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [user_id] BIGINT NOT NULL,
  [event_id] BIGINT NOT NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_bookmarks_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [FK_bookmarks_event_id] FOREIGN KEY ([event_id]) REFERENCES [events] ([id]) ON DELETE CASCADE,
  CONSTRAINT [UQ_bookmarks_user_id_event_id] UNIQUE ([user_id], [event_id])
);
GO


-- -------------------------------------------------------------
-- 5. Registrations, Certificates, and Reporting
-- -------------------------------------------------------------

CREATE TABLE [event_registrations] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [event_id] BIGINT NOT NULL,
  [user_id] BIGINT NOT NULL,
  [qr_token] NVARCHAR(36) NOT NULL UNIQUE,
  [status] NVARCHAR(20) NOT NULL,
  [checked_in_at] DATETIME2 NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_event_registrations_event_id] FOREIGN KEY ([event_id]) REFERENCES [events] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [FK_event_registrations_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE
);
GO

CREATE TABLE [certificates] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [registration_id] BIGINT NOT NULL,
  [file_url] NVARCHAR(255) NOT NULL,
  [issued_at] DATETIME2 NOT NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_certificates_registration_id] FOREIGN KEY ([registration_id]) REFERENCES [event_registrations] ([id]) ON DELETE CASCADE
);
GO

CREATE TABLE [event_reports] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [event_id] BIGINT NOT NULL,
  [reporter_id] BIGINT NOT NULL,
  [reason] NVARCHAR(255) NOT NULL,
  [description] NVARCHAR(MAX) NULL,
  [status] NVARCHAR(255) NOT NULL CONSTRAINT [DF_event_reports_status] DEFAULT 'pending',
  [resolved_by] BIGINT NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_event_reports_event_id] FOREIGN KEY ([event_id]) REFERENCES [events] ([id]) ON DELETE CASCADE,
  CONSTRAINT [FK_event_reports_reporter_id] FOREIGN KEY ([reporter_id]) REFERENCES [users] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [FK_event_reports_resolved_by] FOREIGN KEY ([resolved_by]) REFERENCES [users] ([id]) ON DELETE NO ACTION
);
GO


-- -------------------------------------------------------------
-- 6. Notifications System
-- -------------------------------------------------------------

CREATE TABLE [notifications] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [user_id] BIGINT NOT NULL,
  [sender_name] NVARCHAR(255) NOT NULL,
  [message] NVARCHAR(MAX) NOT NULL,
  [type] NVARCHAR(50) NOT NULL CONSTRAINT [DF_notifications_type] DEFAULT 'system' CONSTRAINT [CK_notifications_type] CHECK ([type] IN ('system', 'social')),
  [category] NVARCHAR(255) NULL,
  [target] NVARCHAR(255) NULL,
  [event_id] BIGINT NULL,
  [is_read] BIT NOT NULL CONSTRAINT [DF_notifications_is_read] DEFAULT 0,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_notifications_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE CASCADE,
  -- Changed ON DELETE SET NULL to ON DELETE NO ACTION to resolve multiple cascade paths error (Msg 1785)
  CONSTRAINT [FK_notifications_event_id] FOREIGN KEY ([event_id]) REFERENCES [events] ([id]) ON DELETE NO ACTION
);
GO

CREATE TABLE [event_notification_deliveries] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [event_id] BIGINT NOT NULL,
  [user_id] BIGINT NOT NULL,
  [category] NVARCHAR(255) NOT NULL,
  [reminder_offset] NVARCHAR(255) NULL,
  [notification_id] BIGINT NULL,
  [push_sent_at] DATETIME2 NULL,
  [email_sent_at] DATETIME2 NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_event_notification_deliveries_event_id] FOREIGN KEY ([event_id]) REFERENCES [events] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [FK_event_notification_deliveries_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [FK_event_notification_deliveries_notification_id] FOREIGN KEY ([notification_id]) REFERENCES [notifications] ([id]) ON DELETE NO ACTION,
  CONSTRAINT [UQ_unique_delivery] UNIQUE ([event_id], [user_id], [category], [reminder_offset])
);
GO


-- -------------------------------------------------------------
-- 7. Auditing & Logging
-- -------------------------------------------------------------

CREATE TABLE [audit_logs] (
  [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
  [user_id] BIGINT NULL,
  [action] NVARCHAR(255) NOT NULL,
  [target_type] NVARCHAR(255) NOT NULL,
  [target_id] BIGINT NULL,
  [details] NVARCHAR(MAX) NULL,
  [created_at] DATETIME2 NULL,
  [updated_at] DATETIME2 NULL,
  CONSTRAINT [FK_audit_logs_user_id] FOREIGN KEY ([user_id]) REFERENCES [users] ([id]) ON DELETE SET NULL
);
GO