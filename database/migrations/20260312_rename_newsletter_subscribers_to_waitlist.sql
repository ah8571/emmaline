ALTER TABLE IF EXISTS newsletter_subscribers RENAME TO waitlist_subscribers;

ALTER INDEX IF EXISTS idx_newsletter_email RENAME TO idx_waitlist_email;
ALTER INDEX IF EXISTS idx_newsletter_active RENAME TO idx_waitlist_active;