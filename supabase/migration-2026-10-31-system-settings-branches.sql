-- Chi nhanh cua hang cho widget "Phuong thuc lien he" + footer (2026-10-31).
-- Moi chi nhanh co dia chi rieng, nhap trong CAI DAT; so Zalo/WhatsApp/Email
-- xai chung nen khong nam trong bang nay. Idempotent: chay lai khong doi gi.
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS branches JSONB;
