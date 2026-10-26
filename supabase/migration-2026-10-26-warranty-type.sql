-- Warranty type: 'months' (shop warranty, N months) vs 'manufacturer' (theo nhà sản xuất).
-- Existing rows keep numeric-months behaviour via the 'months' default.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer'));
ALTER TABLE spare_parts ADD COLUMN IF NOT EXISTS warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer'));
ALTER TABLE service_tickets ADD COLUMN IF NOT EXISTS warranty_type TEXT NOT NULL DEFAULT 'months' CHECK (warranty_type IN ('months', 'manufacturer'));
