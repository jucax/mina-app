-- ============================================
-- COMPLETE ACCOUNT DELETION SETUP FOR SUPABASE
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- STEP 1: Verify the function exists
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc 
WHERE proname = 'delete_user_account';
-- If this returns no rows, the function doesn't exist yet

-- ============================================
-- STEP 2: Create RPC Function to Delete Auth User
-- ============================================

DROP FUNCTION IF EXISTS delete_user_account(UUID);

CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  RAISE NOTICE 'Attempting to delete user: %', user_id;
  
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RAISE NOTICE 'User % not found', user_id;
    RETURN json_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % auth user rows', deleted_count;
  
  -- Verify deletion
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
    RETURN json_build_object(
      'success', true,
      'message', 'User deleted successfully',
      'deleted_count', deleted_count
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'User still exists after deletion'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'message', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Grant permissions to all roles
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO anon;
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO service_role;

-- ============================================
-- STEP 3: Create Automatic Trigger (RECOMMENDED)
-- ============================================
-- This trigger automatically deletes auth user when user_auth is deleted
-- This is the BEST approach because it always works!

CREATE OR REPLACE FUNCTION delete_auth_user_on_user_auth_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RAISE NOTICE 'Trigger: Deleting auth user %', OLD.id;
  
  -- Delete the auth user
  DELETE FROM auth.users WHERE id = OLD.id;
  
  RAISE NOTICE 'Trigger: Auth user % deleted', OLD.id;
  RETURN OLD;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_delete_auth_user ON user_auth;

-- Create the trigger on user_auth table
CREATE TRIGGER trigger_delete_auth_user
  AFTER DELETE ON user_auth
  FOR EACH ROW
  EXECUTE FUNCTION delete_auth_user_on_user_auth_delete();

-- ============================================
-- STEP 4: Test the Setup
-- ============================================
-- After running this script, test with a real account:
-- 1. Create a test account in your app
-- 2. Note the user ID from Supabase Dashboard > Authentication
-- 3. Delete the account from the app
-- 4. Check Supabase Dashboard > Authentication (user should be gone)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check if function exists
SELECT 
  proname as function_name,
  prosecdef as is_security_definer
FROM pg_proc 
WHERE proname IN ('delete_user_account', 'delete_auth_user_on_user_auth_delete');

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_delete_auth_user';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. The trigger (STEP 3) is the BEST approach because:
--    - It automatically deletes auth user when user_auth is deleted
--    - No need to call RPC function from app
--    - Always works, no permission issues
--    - Cleaner code in the app
--
-- 2. With the trigger in place, the app only needs to:
--    - Delete agent/owner profile
--    - Delete user_auth record
--    - The trigger handles deleting auth.users automatically!
--
-- 3. The RPC function (STEP 2) is a backup method
--    - Used if trigger fails for some reason
--    - App tries both methods for reliability


