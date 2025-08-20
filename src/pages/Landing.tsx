import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletConnect } from "@/components/WalletConnect";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Globe } from "lucide-react";

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-r from-primary to-accent rounded-lg" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AffiliateTracker
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Track Your Crypto Affiliates
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive affiliate tracking across multiple blockchain networks. 
            Monitor earnings, manage withdrawals, and grow your crypto affiliate business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Multi-Chain Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track earnings across Ethereum, Polygon, Arbitrum, Base, and more
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Secure Wallet Auth</h3>
              <p className="text-sm text-muted-foreground">
                Connect securely using your crypto wallet and signature verification
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Real-time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Get instant updates on your affiliate performance and earnings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/30 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Scale your affiliate business worldwide with comprehensive tools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet Connection */}
        <div className="max-w-md mx-auto">
          <WalletConnect />
        </div>
      </div>
    </div>
  );
};