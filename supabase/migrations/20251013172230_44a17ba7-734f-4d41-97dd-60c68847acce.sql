-- Drop duplicate policy
DROP POLICY IF EXISTS "Allow providers to read own data after auth" ON providers;