"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SwapAmountInput } from "./swap/components/SwapAmountInput";
import { SwapButton } from "./swap/components/SwapButton";
import { SwapMessage } from "./swap/components/SwapMessage";
import { SwapToast } from "./swap/components/SwapToast";
import { CustomDonateButton } from "./swap/components/CustomDonateButton";
import { useSwapContext } from "./swap/provider/SwapProvider";

import {
  getTokensByChainId,
  getFinalTokenByChainId,
  getDefaultDepositTokenByChainId,
} from "../../utils/tokens";

export function DonateView() {
  const { from } = useSwapContext();

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
    <Card className="h-[481px]">
      <CardHeader></CardHeader>
      <CardContent className="space-y-2 ">
        {from.token && from.token.symbol === "BUILD" && (
          <>
            <div className="flex flex-col justify-between gap-40">
              <SwapAmountInput
                label="Deposit"
                swappableTokens={swappableTokens}
                token={BUILDToken}
                type="from"
              />
              <div className="flex flex-col justify-center items-center">
                <span className="text-sm w-full text-center">Donate BUILD</span>
                <CustomDonateButton buttonText="Deposit" />
              </div>
            </div>
          </>
        )}

        {((from.token && from.token.symbol !== "BUILD") ||
          from.token === undefined) && (
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
        )}
      </CardContent>
    </Card>
  );
}
