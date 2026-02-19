-- Create RPC function to get doctors with avatars from auth.users
CREATE OR REPLACE FUNCTION get_doctors_with_avatars()
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
INNER JOIN user_roles ur ON p.user_id = ur.user_id
INNER JOIN auth.users au ON p.user_id = au.id
WHERE ur.role = 'doctor'
ORDER BY p.name_fr ASC;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_doctors_with_avatars TO authenticated;
