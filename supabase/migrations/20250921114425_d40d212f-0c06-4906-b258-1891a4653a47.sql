-- Create uploaded_datasets table to store uploaded JSON arrays per user
CREATE TABLE IF NOT EXISTS public.uploaded_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_datasets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own datasets"
ON public.uploaded_datasets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets"
ON public.uploaded_datasets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets"
ON public.uploaded_datasets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
ON public.uploaded_datasets
FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger function already exists (public.update_updated_at_column)
-- Create trigger for automatic updated_at updates
DROP TRIGGER IF EXISTS update_uploaded_datasets_updated_at ON public.uploaded_datasets;
CREATE TRIGGER update_uploaded_datasets_updated_at
BEFORE UPDATE ON public.uploaded_datasets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful index for querying by user and created_at
CREATE INDEX IF NOT EXISTS idx_uploaded_datasets_user_created_at
ON public.uploaded_datasets (user_id, created_at DESC);
