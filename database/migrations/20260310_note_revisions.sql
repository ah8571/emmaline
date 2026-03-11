CREATE TABLE IF NOT EXISTS note_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  edit_type VARCHAR(50) NOT NULL,
  edit_summary TEXT,
  previous_title VARCHAR(255),
  previous_content TEXT,
  new_title VARCHAR(255),
  new_content TEXT,
  source VARCHAR(50) NOT NULL DEFAULT 'app',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_note_revisions_note_id ON note_revisions (note_id);
CREATE INDEX IF NOT EXISTS idx_note_revisions_user_id ON note_revisions (user_id);
CREATE INDEX IF NOT EXISTS idx_note_revisions_call_id ON note_revisions (call_id);

ALTER TABLE note_revisions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'note_revisions'
      AND policyname = 'Users can view their own note revisions'
  ) THEN
    CREATE POLICY "Users can view their own note revisions" ON note_revisions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;