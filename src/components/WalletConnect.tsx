import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppKitAccount, useAppKit } from "@reown/appkit/react";
import { Wallet, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const WalletConnect = () => {
  const { isConnected } = useAppKitAccount();
  const { open } = useAppKit();
  const { signIn, isConnecting } = useAuth();

  const handleConnect = () => {
    open();
  };

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Sign the verification message to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={signIn} 
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Sign Message & Continue'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to access the affiliate tracker
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleConnect}
          variant="outline"
          className="w-full justify-start border-border/40 hover:border-primary/50 hover:bg-primary/5"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );
};