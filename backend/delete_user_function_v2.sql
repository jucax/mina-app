-- IMPROVED SQL Function to delete a user account
-- Run this in Supabase SQL Editor

-- First, drop the old function if it exists
DROP FUNCTION IF EXISTS delete_user_account(UUID);

-- Create the improved function with proper error handling
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result_message TEXT;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Delete the user from auth.users table
  -- This should cascade to other tables if foreign keys are set up
  DELETE FROM auth.users WHERE id = user_id;
  
  -- Check if deletion was successful
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User deleted successfully'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'User deletion failed'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO service_role;

-- Also grant necessary permissions on auth.users
GRANT DELETE ON auth.users TO postgres;

-- Test the function (replace with a test user ID)
-- SELECT delete_user_account('your-test-user-id-here');

