-- Fix infinite recursion in RLS policies by creating security definer functions

-- Create function to get current user info without recursion
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_id uuid, wallet_address text, is_admin boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.wallet_address, u.is_admin 
  FROM public.users u 
  WHERE u.wallet_address = current_setting('app.current_wallet', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean AS $$
DECLARE
  admin_status boolean;
BEGIN
  SELECT is_admin INTO admin_status
  FROM public.users 
  WHERE wallet_address = current_setting('app.current_wallet', true);
  
  RETURN COALESCE(admin_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Add Solana to blockchain networks
ALTER TYPE public.blockchain_network ADD VALUE IF NOT EXISTS 'solana';

-- Drop existing policies to recreate them without recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

DROP POLICY IF EXISTS "Admins can manage all earnings" ON public.earnings;
DROP POLICY IF EXISTS "Users can view their own earnings" ON public.earnings;

DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawal requests" ON public.withdrawals;

-- Recreate users policies without recursion
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT USING (public.is_current_user_admin());

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));

-- Recreate earnings policies without recursion
CREATE POLICY "Users can view their own earnings" ON public.earnings
FOR SELECT USING (
  user_id IN (SELECT user_id FROM public.get_current_user_info()) OR 
  public.is_current_user_admin()
);

CREATE POLICY "Admins can manage all earnings" ON public.earnings
FOR ALL USING (public.is_current_user_admin());

-- Recreate withdrawals policies without recursion
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
FOR SELECT USING (
  user_id IN (SELECT user_id FROM public.get_current_user_info()) OR 
  public.is_current_user_admin()
);

CREATE POLICY "Users can create withdrawal requests" ON public.withdrawals
FOR INSERT WITH CHECK (user_id IN (SELECT user_id FROM public.get_current_user_info()));

CREATE POLICY "Admins can manage all withdrawals" ON public.withdrawals
FOR ALL USING (public.is_current_user_admin());