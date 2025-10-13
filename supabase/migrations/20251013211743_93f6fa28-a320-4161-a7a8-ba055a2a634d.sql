-- Allow anyone to read provider basic info by sub_url
CREATE POLICY "Anyone can read provider by sub_url"
ON public.providers
FOR SELECT
TO public
USING (true);