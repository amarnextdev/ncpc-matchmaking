-- Custom migration (not generated from the schema): Storage buckets, browser read grants and Realtime.

-- 1. Storage buckets (Supabase Storage). Uploads use one-time signed URLs made by the server,
--    so no storage.objects policies are needed: nobody can write without our server's signature,
--    the public bucket is readable by URL, and private files open only through signed links.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public-images', 'public-images', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('private-documents', 'private-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint

-- 2. The browser may READ only these tables (RLS policies still limit the rows to its own).
--    Every other table has no grant, so the Data API cannot reach it at all.
GRANT SELECT ON public.profiles, public.organisation_members, public.conversations,
  public.messages, public.notifications TO authenticated;
--> statement-breakpoint

-- 3. Realtime: new messages and notifications are pushed to the browser.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END $$;
