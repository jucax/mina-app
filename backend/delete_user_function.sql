-- SQL Function to delete a user from auth.users table
-- This function needs to be created in your Supabase SQL Editor

-- Create the function to delete a user account
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
BEGIN
  -- Delete the user from auth.users table
  DELETE FROM auth.users WHERE id = user_id;
  
  -- Log the deletion
  RAISE NOTICE 'User % deleted successfully', user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Optional: Create a trigger to automatically clean up related data when a user is deleted
-- This ensures that if the auth user is deleted, all related data is also removed

CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete from user_auth table
  DELETE FROM user_auth WHERE id = OLD.id;
  
  -- Delete agent data if exists
  DELETE FROM agents WHERE id IN (
    SELECT agent_id FROM user_auth WHERE id = OLD.id
  );
  
  -- Delete owner data if exists
  DELETE FROM owners WHERE id IN (
    SELECT owner_id FROM user_auth WHERE id = OLD.id
  );
  
  RETURN OLD;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_user_data();

-- Instructions:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire script
-- 5. Run the script
-- 6. The function will be created and ready to use

