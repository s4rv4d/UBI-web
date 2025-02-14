/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { CustomSwapButton } from "./swap/components/CustomSwapButton";
import { useSwapContext } from "./swap/provider/SwapProvider";
import { useValue } from "./swap/hooks/useValue";
import { ethers } from "ethers";

import { cn, color } from "@coinbase/onchainkit/theme";

export function ClaimView() {
  const { claim } = useSwapContext();
  const claimAllocation = useValue(claim);

  return (
    <>
      <CardHeader></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-col justify-center items-center">
          <span
            className={cn(
              "ock-font-family font-semibold text-5xl",
              color.foregroundMuted
            )}
          >
            {claimAllocation
              ? parseFloat(
                  ethers.formatEther(claimAllocation.toString())
                ).toFixed(4)
              : 0}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <CustomSwapButton buttonText="Claim" />
      </CardFooter>
    </>
  );
}
