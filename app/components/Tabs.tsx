/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Token } from "@coinbase/onchainkit/token";
import { SwapProvider } from "./swap/provider/SwapProvider";
import { SwapAmountInput } from "./swap/components/SwapAmountInput";
import { SwapButton } from "./swap/components/SwapButton";
import { SwapMessage } from "./swap/components/SwapMessage";
import { SwapToast } from "./swap/components/SwapToast";

// import { useAccount } from "wagmi";
import { LifecycleStatus, SwapError } from "./swap/types";

function CustomTab() {
  //   const { address } = useAccount();

  const WETHToken: Token = {
    address: "0x4200000000000000000000000000000000000006",
    chainId: 84532,
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
    image:
      "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  };

  const DGMToken: Token = {
    address: "0x2C0891219AE6f6adC9BE178019957B4743e5e790",
    chainId: 84532,
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
    image: "https://basescan.org/token/images/doginmeme2_32.png",
  };

  const BUILDToken: Token = {
    address: "0xDBeE0FA9120300b03D9857954f067be95cf31597",
    chainId: 84532,
    decimals: 18,
    name: "BUILD",
    symbol: "BUILD",
    image:
      "https://dd.dexscreener.com/ds-data/tokens/base/0x3c281a39944a2319aa653d81cfd93ca10983d234.png?size=lg&key=c95e46",
  };

  const swappableTokens: Token[] = [WETHToken, DGMToken];

  return (
    <Tabs defaultValue="donate" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="donate">Donate</TabsTrigger>
        <TabsTrigger value="claim">Claim</TabsTrigger>
      </TabsList>
      <TabsContent value="donate">
        <Card>
          <CardHeader></CardHeader>
          <CardContent className="space-y-2">
            <SwapProvider
              onError={(e: SwapError) => {
                console.log(e.message);
              }}
              onStatus={(e: LifecycleStatus) => {
                console.log(e.statusName);
              }}
              onSuccess={(r: any) => {
                console.log(r);
              }}
            >
              <>
                <SwapAmountInput
                  label="Convert"
                  swappableTokens={swappableTokens}
                  token={WETHToken}
                  type="from"
                />
                <div className="relative h-1">{/* <SwapToggleButton /> */}</div>
                <SwapAmountInput label="To" token={BUILDToken} type="to" />
                <SwapButton disabled={false} />
                <SwapToast />
                <div className="flex">
                  <SwapMessage />
                </div>
              </>
            </SwapProvider>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="claim">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm">Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default CustomTab;
