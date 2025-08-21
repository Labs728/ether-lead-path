-- Fix function search path security warnings
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_id uuid, wallet_address text, is_admin boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.wallet_address, u.is_admin 
  FROM public.users u 
  WHERE u.wallet_address = current_setting('app.current_wallet', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;