-- Remote Work Hub on fleet-postgres. No Supabase auth.

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text,
  recovery_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  capacity int NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text,
  age integer,
  class_format text NOT NULL DEFAULT 'hybrid',
  occupation text,
  experience text,
  reason text,
  tier text NOT NULL DEFAULT '50',
  amount_ghs numeric NOT NULL DEFAULT 500,
  payment_reference text UNIQUE,
  payment_status text NOT NULL DEFAULT 'PENDING',
  status text NOT NULL DEFAULT 'PENDING_REVIEW',
  is_unfinished boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  application_id uuid REFERENCES public.applications(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  first_name text,
  last_name text,
  network text NOT NULL DEFAULT 'MTN',
  amount_ghs numeric NOT NULL,
  tier text NOT NULL DEFAULT '50',
  gateway text,
  payment_type text,
  status text NOT NULL DEFAULT 'PENDING',
  moolre_transaction_id text,
  moolre_response jsonb,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  cohort_id uuid REFERENCES public.cohorts(id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT false,
  balance_due numeric(10, 2) NOT NULL DEFAULT 1000.00,
  total_paid numeric(10, 2) NOT NULL DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  country text,
  device text,
  browser text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  channel text,
  subject text,
  body text,
  audience_type text,
  audience_filter jsonb,
  status text,
  total_recipients int,
  total_sent int,
  total_failed int,
  created_by uuid,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaign_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel text,
  recipient_email text,
  recipient_phone text,
  recipient_name text,
  subject text,
  body text,
  status text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_email ON public.applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_payment_reference ON public.applications(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_application ON public.payments(application_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_application ON public.enrollments(application_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at);
