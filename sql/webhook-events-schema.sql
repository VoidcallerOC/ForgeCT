-- ForgeCT Webhook Events Schema
-- Version: 1.0.0
-- Description: Durable storage for Stripe webhook events

-- Create webhook events table for durable storage
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at ON stripe_webhook_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at ON stripe_webhook_events(created_at);

-- Function to check if event was already processed
CREATE OR REPLACE FUNCTION check_webhook_event_processed(p_event_id VARCHAR(255))
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM stripe_webhook_events 
        WHERE event_id = p_event_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to store webhook event
CREATE OR REPLACE FUNCTION store_webhook_event(
    p_event_id VARCHAR(255),
    p_event_type VARCHAR(100),
    p_event_data JSONB,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO stripe_webhook_events (event_id, event_type, event_data, metadata)
    VALUES (p_event_id, p_event_type, p_event_data, p_metadata)
    ON CONFLICT (event_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- View for monitoring recent events
CREATE OR REPLACE VIEW recent_webhook_events AS
SELECT * FROM stripe_webhook_events 
ORDER BY created_at DESC 
LIMIT 100;

-- View for monitoring failed events
CREATE OR REPLACE VIEW failed_webhook_events AS
SELECT * FROM stripe_webhook_events 
WHERE metadata->>'status' = 'failed'
ORDER BY created_at DESC;

-- Comment on the table
COMMENT ON TABLE stripe_webhook_events IS 'Stores Stripe webhook events for durable replay protection and audit trail';
COMMENT ON COLUMN stripe_webhook_events.event_id IS 'Stripe event ID (e.g., evt_123456789)';
COMMENT ON COLUMN stripe_webhook_events.event_type IS 'Stripe event type (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN stripe_webhook_events.event_data IS 'Full event data object from Stripe';
COMMENT ON COLUMN stripe_webhook_events.metadata IS 'Additional metadata stored by our application';