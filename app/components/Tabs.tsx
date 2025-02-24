/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import type { Token } from "@coinbase/onchainkit/token";
import { SwapProvider } from "./swap/provider/SwapProvider";
import { SwapAmountInput } from "./swap/components/SwapAmountInput";
import { SwapButton } from "./swap/components/SwapButton";
import { SwapMessage } from "./swap/components/SwapMessage";
import { SwapToast } from "./swap/components/SwapToast";
import { ClaimView } from "./ClaimView";

import { LifecycleStatus, SwapError } from "./swap/types";
import {
  getTokensByChainId,
  getFinalTokenByChainId,
  getDefaultDepositTokenByChainId,
} from "../../utils/tokens";

function CustomTab() {
  const WETHToken = getDefaultDepositTokenByChainId(
    Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  );

  const BUILDToken = getFinalTokenByChainId(
    Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  );

  const swappableTokens = getTokensByChainId(
    Number(process.env.NEXT_PUBLIC_CHAIN_ID)
  );

  return (
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
      <Tabs
        defaultValue="claim"
        className="w-[350px] md:w-[400px] ock-font-family mt-52 md:mt-0"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donate">Donate</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
        </TabsList>
        <TabsContent value="donate" className="">
          <Card className="h-[481px]">
            <CardHeader></CardHeader>
            <CardContent className="space-y-2">
              <>
                <SwapAmountInput
                  label="Convert"
                  swappableTokens={swappableTokens}
                  token={WETHToken}
                  type="from"
                />
                <div className="relative h-1">{/* <SwapToggleButton /> */}</div>
                <SwapAmountInput label="To" token={BUILDToken} type="to" />
                <SwapButton disabled={false} buttonText="Donate" />
                <SwapToast />
                <div className="flex">
                  <SwapMessage />
                </div>
              </>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="claim">
          <Card className="h-[481px]">
            <ClaimView />
            <SwapToast />
          </Card>
        </TabsContent>
      </Tabs>
    </SwapProvider>
  );
}

export default CustomTab;
/////// API
