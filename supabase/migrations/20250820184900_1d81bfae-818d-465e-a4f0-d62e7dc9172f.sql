-- Create enum for blockchain networks
CREATE TYPE public.blockchain_network AS ENUM ('ethereum', 'bnb', 'polygon', 'arbitrum', 'base', 'avalanche', 'optimism');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Create users table for wallet-based authentication
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    earning_code TEXT NOT NULL UNIQUE DEFAULT substring(encode(gen_random_bytes(8), 'hex'), 1, 12),
    is_admin BOOLEAN NOT NULL DEFAULT false,
    total_earned DECIMAL(18, 8) NOT NULL DEFAULT 0,
    total_withdrawn DECIMAL(18, 8) NOT NULL DEFAULT 0,
    code_uses INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create earnings table to track earnings by blockchain
CREATE TABLE public.earnings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    network blockchain_network NOT NULL,
    amount DECIMAL(18, 8) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    status withdrawal_status NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.users(id),
    notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (wallet_address = current_setting('app.current_wallet', true) OR 
       EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

-- Create policies for earnings table
CREATE POLICY "Users can view their own earnings" 
ON public.earnings 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND wallet_address = current_setting('app.current_wallet', true)) OR
       EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

CREATE POLICY "Admins can manage all earnings" 
ON public.earnings 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

-- Create policies for withdrawals table
CREATE POLICY "Users can view their own withdrawals" 
ON public.withdrawals 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND wallet_address = current_setting('app.current_wallet', true)) OR
       EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

CREATE POLICY "Users can create withdrawal requests" 
ON public.withdrawals 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND wallet_address = current_setting('app.current_wallet', true)));

CREATE POLICY "Admins can manage all withdrawals" 
ON public.withdrawals 
FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE wallet_address = current_setting('app.current_wallet', true) AND is_admin = true));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_users_earning_code ON public.users(earning_code);
CREATE INDEX idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX idx_earnings_network ON public.earnings(network);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);