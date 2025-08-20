import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/StatsCard";
import { NetworkEarnings } from "@/components/NetworkEarnings";
import { WithdrawalRequest } from "@/components/WithdrawalRequest";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  DollarSign, 
  Code, 
  History, 
  LogOut, 
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [networkEarnings, setNetworkEarnings] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
      fetchNetworkEarnings();
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchNetworkEarnings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('network, amount')
        .eq('user_id', user.id);

      if (error) throw error;

      const networkData = [
        { network: 'Ethereum', amount: 0, symbol: 'ETH', color: 'bg-blue-500' },
        { network: 'BNB Chain', amount: 0, symbol: 'BNB', color: 'bg-yellow-500' },
        { network: 'Polygon', amount: 0, symbol: 'MATIC', color: 'bg-purple-500' },
        { network: 'Arbitrum', amount: 0, symbol: 'ARB', color: 'bg-blue-400' },
        { network: 'Base', amount: 0, symbol: 'BASE', color: 'bg-indigo-500' },
        { network: 'Avalanche', amount: 0, symbol: 'AVAX', color: 'bg-red-500' },
        { network: 'Optimism', amount: 0, symbol: 'OP', color: 'bg-red-400' },
      ];

      // Aggregate earnings by network
      data?.forEach((earning) => {
        const network = networkData.find(n => 
          n.network.toLowerCase().includes(earning.network.toLowerCase())
        );
        if (network) {
          network.amount += parseFloat(earning.amount.toString()) || 0;
        }
      });

      setNetworkEarnings(networkData);
    } catch (error) {
      console.error('Error fetching network earnings:', error);
    }
  };

  const copyEarningCode = async () => {
    if (user?.earning_code) {
      await navigator.clipboard.writeText(user.earning_code);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Earning code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'processing':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Earned"
            value={`${user.total_earned.toFixed(6)} ETH`}
            icon={TrendingUp}
            gradient
          />
          <StatsCard
            title="Code Uses"
            value={user.code_uses}
            icon={Code}
            description="Times your code was used"
          />
          <StatsCard
            title="Total Withdrawn"
            value={`${user.total_withdrawn.toFixed(6)} ETH`}
            icon={DollarSign}
          />
          <StatsCard
            title="Available Balance"
            value={`${(user.total_earned - user.total_withdrawn).toFixed(6)} ETH`}
            icon={History}
            description="Ready to withdraw"
          />
        </div>

        {/* Earning Code */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle>Your Earning Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg border border-border/30">
              <code className="flex-1 text-lg font-mono bg-background/50 px-3 py-2 rounded border">
                {user.earning_code}
              </code>
              <Button onClick={copyEarningCode} size="sm" variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Network Earnings */}
        <div className="mb-8">
          <NetworkEarnings earnings={networkEarnings} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Withdrawal Request */}
          <WithdrawalRequest />

          {/* Withdrawal History */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No withdrawal requests yet
                  </p>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(withdrawal.status)}
                        <div>
                          <div className="font-medium">
                            {withdrawal.amount.toFixed(6)} ETH
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(withdrawal.requested_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`capitalize ${getStatusColor(withdrawal.status)}`}
                      >
                        {withdrawal.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};