-- Create set_config function for wallet address context
CREATE OR REPLACE FUNCTION public.set_config(parameter text, value text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(parameter, value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;