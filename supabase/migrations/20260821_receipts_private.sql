-- Lock down the receipts bucket: payment proofs are customer PII and must
-- not be world-readable. Admins keep full access (existing "Admins can
-- manage receipts" policy includes SELECT, so signed URLs still work);
-- customers see a "Received" badge instead of the raw file.

UPDATE storage.buckets
SET public = false
WHERE id = 'receipts';