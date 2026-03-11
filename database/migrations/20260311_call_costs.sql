-- Migration: add call cost ledger for estimated provider usage and cost tracking

CREATE TABLE IF NOT EXISTS call_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pricing_tier VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  service VARCHAR(100) NOT NULL,
  quantity NUMERIC(12, 4) NOT NULL DEFAULT 0,
  unit VARCHAR(30) NOT NULL,
  vendor_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  billable_cost_usd NUMERIC(12, 6) NOT NULL DEFAULT 0,
  measurement_source VARCHAR(30) NOT NULL DEFAULT 'estimated',
  cost_source VARCHAR(30) NOT NULL DEFAULT 'rate_card',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_call_costs_call_id ON call_costs (call_id);
CREATE INDEX IF NOT EXISTS idx_call_costs_user_id ON call_costs (user_id);

ALTER TABLE call_costs ENABLE ROW LEVEL SECURITY;