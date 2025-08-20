import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  LogOut, 
  Search, 
  Users, 
  Settings, 
  Trash2, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Eye
} from "lucide-react";

interface User {
  id: string;
  wallet_address: string;
  earning_code: string;
  is_admin: boolean;
  total_earned: number;
  total_withdrawn: number;
  code_uses: number;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  user_id: string;
  notes?: string;
  users: {
    wallet_address: string;
  };
}

export const Admin = () => {
  const { user, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
      fetchPendingWithdrawals();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          id,
          amount,
          status,
          requested_at,
          user_id,
          notes,
          users!withdrawals_user_id_fkey (wallet_address)
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const processWithdrawal = async (withdrawalId: string, userId: string, amount: number) => {
    setIsLoading(true);
    try {
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: user?.id
        })
        .eq('id', withdrawalId);

      if (withdrawalError) throw withdrawalError;

      // Update user's total_withdrawn and reset total_earned
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          total_withdrawn: amount,
          total_earned: 0
        })
        .eq('id', userId);

      if (userError) throw userError;

      toast({
        title: "Withdrawal Processed",
        description: "Withdrawal has been processed successfully",
      });

      fetchUsers();
      fetchPendingWithdrawals();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "User Deleted",
        description: "User account has been deleted successfully",
      });

      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.wallet_address.toLowerCase().includes(searchAddress.toLowerCase()) ||
    u.earning_code.toLowerCase().includes(searchAddress.toLowerCase())
  );

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-muted-foreground">You don't have admin privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users and withdrawals</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-2xl font-bold">{withdrawals.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">
                    {users.reduce((sum, u) => sum + u.total_earned, 0).toFixed(4)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                  <p className="text-2xl font-bold">
                    {users.reduce((sum, u) => sum + u.total_withdrawn, 0).toFixed(4)}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Users Management */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by wallet address or earning code..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-border/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {u.wallet_address.slice(0, 8)}...{u.wallet_address.slice(-6)}
                        </span>
                        {u.is_admin && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Earned: {u.total_earned.toFixed(4)} ETH | Code: {u.earning_code}
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(u)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>User Details</DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Wallet Address</label>
                              <p className="text-sm text-muted-foreground break-all">
                                {selectedUser.wallet_address}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Earning Code</label>
                              <p className="text-sm text-muted-foreground">
                                {selectedUser.earning_code}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Total Earned</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedUser.total_earned.toFixed(6)} ETH
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Total Withdrawn</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedUser.total_withdrawn.toFixed(6)} ETH
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Code Uses</label>
                                <p className="text-sm text-muted-foreground">
                                  {selectedUser.code_uses}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Joined</label>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(selectedUser.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => deleteUser(selectedUser.id)}
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Withdrawals */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No pending withdrawals
                  </p>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="p-3 bg-secondary/10 rounded-lg border border-border/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">
                            {withdrawal.amount.toFixed(6)} ETH
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {withdrawal.users.wallet_address.slice(0, 8)}...
                            {withdrawal.users.wallet_address.slice(-6)}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(withdrawal.requested_at).toLocaleDateString()}
                        </div>
                      </div>
                      {withdrawal.notes && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Note: {withdrawal.notes}
                        </p>
                      )}
                      <Button
                        onClick={() => processWithdrawal(
                          withdrawal.id, 
                          withdrawal.user_id, 
                          withdrawal.amount
                        )}
                        size="sm"
                        className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Process Withdrawal
                      </Button>
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