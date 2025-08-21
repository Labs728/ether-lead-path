import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  wallet_address: string;
  earning_code: string;
  is_admin: boolean;
  total_earned: number;
  total_withdrawn: number;
  code_uses: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConnecting: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const signIn = async () => {
    if (!address || !walletProvider) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Create verification message
      const message = `Sign this message to verify your wallet address: ${address}\nTimestamp: ${Date.now()}`;
      
      // Create ethers provider and signer
      const ethersProvider = new BrowserProvider(walletProvider as any);
      const signer = await ethersProvider.getSigner();
      
      // Sign the message
      await signer.signMessage(message);

      // Set wallet address in Supabase context for RLS
      await supabase.rpc('set_config', {
        parameter: 'app.current_wallet',
        value: address.toLowerCase()
      });

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      let userData = existingUser;

      // Create user if doesn't exist
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: address.toLowerCase(),
            is_admin: address.toLowerCase() === '0x742d35cc6634c0532925a3b8d563c0ba4a8ce3b1' // Replace with actual admin address
          })
          .select()
          .single();

        if (createError) throw createError;
        userData = newUser;
      }

      setUser(userData);
      
      // No redirect here - let the app handle routing
      toast({
        title: "Success",
        description: "Successfully authenticated with wallet",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Authentication Failed",
        description: "Failed to verify wallet signature",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const signOut = () => {
    setUser(null);
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  useEffect(() => {
    if (!isConnected) {
      setUser(null);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isConnected, address]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isConnecting,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};