-- Create RPC function to get a single doctor with avatar from auth.users
CREATE OR REPLACE FUNCTION get_doctor_with_avatar(doctor_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name_ar text,
  name_fr text,
  avatar_url text,
  specialization text
) AS $$
SELECT 
  p.id,
  p.user_id,
  p.name_ar,
  p.name_fr,
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture',
    p.avatar_url
  ) as avatar_url,
  '' as specialization
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.user_id = doctor_user_id
LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_doctor_with_avatar TO authenticated;
