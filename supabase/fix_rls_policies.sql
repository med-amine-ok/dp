-- Add missing RLS policies in an idempotent way.
-- Run this script in Supabase SQL Editor.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Admins can manage profiles'
  ) THEN
    EXECUTE '
      CREATE POLICY "Admins can manage profiles"
      ON public.profiles
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), ''admin''))
      WITH CHECK (public.has_role(auth.uid(), ''admin''))
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Admins can manage roles'
  ) THEN
    EXECUTE '
      CREATE POLICY "Admins can manage roles"
      ON public.user_roles
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), ''admin''))
      WITH CHECK (public.has_role(auth.uid(), ''admin''))
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_roles'
      AND policyname = 'Users can insert own roles'
  ) THEN
    EXECUTE '
      CREATE POLICY "Users can insert own roles"
      ON public.user_roles
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patients'
      AND policyname = 'Patients can insert own record'
  ) THEN
    EXECUTE '
      CREATE POLICY "Patients can insert own record"
      ON public.patients
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'patients'
      AND policyname = 'Patients can update own record'
  ) THEN
    EXECUTE '
      CREATE POLICY "Patients can update own record"
      ON public.patients
      FOR UPDATE
      USING (auth.uid() = user_id)
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'doctors'
      AND policyname = 'Doctors can insert own profile'
  ) THEN
    EXECUTE '
      CREATE POLICY "Doctors can insert own profile"
      ON public.doctors
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    ';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'doctors'
      AND policyname = 'Doctors can update own profile'
  ) THEN
    EXECUTE '
      CREATE POLICY "Doctors can update own profile"
      ON public.doctors
      FOR UPDATE
      USING (auth.uid() = user_id)
    ';
  END IF;
END $$;

-- Admin-only RPC to delete an app user and related rows in one operation.
CREATE OR REPLACE FUNCTION public.admin_delete_app_user(target_type text, target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linked_user_id uuid;
  requester_email text;
BEGIN
  requester_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR requester_email = ANY (
      ARRAY[
        'meddahnaima2005@gmail.com',
        'sarahboualili17@gmail.com',
        'ouldkhaoua.pro@gmail.com'
      ]
    )
  ) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  IF target_type = 'patient' THEN
    SELECT user_id INTO linked_user_id
    FROM public.patients
    WHERE id = target_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Patient not found';
    END IF;

    DELETE FROM public.patients
    WHERE id = target_id;
  ELSIF target_type = 'doctor' THEN
    SELECT user_id INTO linked_user_id
    FROM public.doctors
    WHERE id = target_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Doctor not found';
    END IF;

    DELETE FROM public.doctors
    WHERE id = target_id;
  ELSE
    RAISE EXCEPTION 'Invalid target_type. Use patient or doctor';
  END IF;

  IF linked_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles WHERE user_id = linked_user_id;
    DELETE FROM public.profiles WHERE user_id = linked_user_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_app_user(text, uuid) TO authenticated;

-- Compatibility overload for clients that resolve argument order as (target_id, target_type).
CREATE OR REPLACE FUNCTION public.admin_delete_app_user(target_id uuid, target_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.admin_delete_app_user(target_type, target_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_app_user(uuid, text) TO authenticated;
