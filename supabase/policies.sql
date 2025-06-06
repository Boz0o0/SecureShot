-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Sessions table: Only allow photographers to manage their sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Photographers can manage their sessions' AND tablename = 'sessions'
  ) THEN
    CREATE POLICY "Photographers can manage their sessions"
    ON sessions
    FOR ALL
    USING (auth.uid() = photographer_id)
    WITH CHECK (auth.uid() = photographer_id);
  END IF;
END $$;

-- Photos table: Only photographers can manage their session’s photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Photographers can manage their photos' AND tablename = 'photos'
  ) THEN
    CREATE POLICY "Photographers can manage their photos"
    ON photos
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = photos.session_id
        AND sessions.photographer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM sessions
        WHERE sessions.id = photos.session_id
        AND sessions.photographer_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Purchases table: Only buyers can see their own purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Buyers can see their purchases' AND tablename = 'purchases'
  ) THEN
    CREATE POLICY "Buyers can see their purchases"
    ON purchases
    FOR SELECT
    USING (
      auth.role() = 'authenticated'
    );
  END IF;
END $$;

-- Photos table: Only show full-res to buyers who paid
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Buyers can view purchased photos' AND tablename = 'photos'
  ) THEN
    CREATE POLICY "Buyers can view purchased photos"
    ON photos
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM purchases
        WHERE purchases.session_id = photos.session_id
        AND auth.role() = 'authenticated'
      )
    );
  END IF;
END $$;
