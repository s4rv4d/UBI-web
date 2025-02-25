/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { SwapProvider } from "./swap/provider/SwapProvider";
import { SwapToast } from "./swap/components/SwapToast";
import { ClaimView } from "./ClaimView";
import { DonateView } from "./DonateView";

import { LifecycleStatus, SwapError } from "./swap/types";

function CustomTab() {
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
        defaultValue="donate"
        className="w-[350px] md:w-[400px] ock-font-family mb-10 md:mb-0"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donate">Donate</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
        </TabsList>
        <TabsContent value="donate" className="">
          <DonateView />
          <SwapToast />
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
