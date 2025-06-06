-- 1. Création de la table
CREATE TABLE IF NOT EXISTS email_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL,
    session_id      UUID NOT NULL,
    photographer_id UUID NOT NULL,
    sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Création de la fonction
CREATE OR REPLACE FUNCTION send_purchase_email(
    p_buyer_email     TEXT,
    p_session_id      UUID,
    p_photographer_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO email_logs (email, session_id, photographer_id, sent_at)
    VALUES (p_buyer_email, p_session_id, p_photographer_id, NOW());
END;
$$;
