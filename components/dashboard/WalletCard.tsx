"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WalletCardProps {
  balance: string;
  walletAddress: string | null;
  depositAmount: string;
  withdrawAmount: string;
  isLoading: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  setDepositAmount: (value: string) => void;
  setWithdrawAmount: (value: string) => void;
}

export function WalletCard({
  balance,
  walletAddress,
  depositAmount,
  withdrawAmount,
  isLoading,
  onDeposit,
  onWithdraw,
  setDepositAmount,
  setWithdrawAmount,
}: WalletCardProps) {
  return (
    <Card className="neon-border">
      <CardHeader>
        <CardTitle>Wallet & Balance</CardTitle>
        <CardDescription>
          Interact with the AdExchange contract
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-3xl font-bold font-mono text-[var(--neon-green)]">
            {balance}{" "}
            <span className="text-lg text-muted-foreground">ETH</span>
          </p>
        </div>
        <Tabs defaultValue="deposit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="pt-4 space-y-2">
            <Input
              type="number"
              placeholder="0.1"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={onDeposit}
              disabled={isLoading || !walletAddress}
            >
              Deposit
            </Button>
          </TabsContent>
          <TabsContent value="withdraw" className="pt-4 space-y-2">
            <Input
              type="number"
              placeholder="0.1"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <Button
              className="w-full"
              variant="secondary"
              onClick={onWithdraw}
              disabled={isLoading || !walletAddress}
            >
              Withdraw
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
