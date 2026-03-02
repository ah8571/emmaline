-- Migration: add dedicated user phone number mapping table

CREATE TABLE IF NOT EXISTS user_phone_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  twilio_phone_sid VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  friendly_name VARCHAR(255),
  status VARCHAR(30) DEFAULT 'active',
  provisioned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_user ON user_phone_numbers (user_id);
CREATE INDEX IF NOT EXISTS idx_user_phone_numbers_status ON user_phone_numbers (status);

CREATE TRIGGER update_user_phone_numbers_updated_at BEFORE UPDATE ON user_phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own phone numbers" ON user_phone_numbers FOR SELECT
  USING (auth.uid() = user_id);
