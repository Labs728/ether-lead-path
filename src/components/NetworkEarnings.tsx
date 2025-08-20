import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NetworkEarning {
  network: string;
  amount: number;
  symbol: string;
  color: string;
}

interface NetworkEarningsProps {
  earnings: NetworkEarning[];
}

export const NetworkEarnings = ({ earnings }: NetworkEarningsProps) => {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Earnings by Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {earnings.map((earning) => (
            <div
              key={earning.network}
              className="p-3 rounded-lg bg-secondary/20 border border-border/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={`${earning.color} text-xs`}
                >
                  {earning.symbol}
                </Badge>
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {earning.network}
              </div>
              <div className="text-lg font-bold text-foreground">
                {earning.amount.toFixed(6)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};