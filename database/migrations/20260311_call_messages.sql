-- Migration: add speaker-separated call messages for structured transcripts

CREATE TABLE IF NOT EXISTS call_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  speaker VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT call_messages_speaker_check CHECK (speaker IN ('user', 'assistant', 'system')),
  CONSTRAINT call_messages_sequence_unique UNIQUE (call_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS idx_call_messages_call_id ON call_messages (call_id);
CREATE INDEX IF NOT EXISTS idx_call_messages_user_id ON call_messages (user_id);

ALTER TABLE call_messages ENABLE ROW LEVEL SECURITY;