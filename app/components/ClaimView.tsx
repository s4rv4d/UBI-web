"use client";

import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { CustomSwapButton } from "./swap/components/CustomSwapButton";
import { useSwapContext } from "./swap/provider/SwapProvider";
import { useValue } from "./swap/hooks/useValue";
import { useCountdown } from "../hooks/useCountdown";

import { cn, color } from "@coinbase/onchainkit/theme";

export function ClaimView() {
  const {
    claim,
    humanCheckVerified,
    timeToClaim,
    totalClaimCount,
    userClaimCount,
    builderScore,
  } = useSwapContext();
  const claimAllocation = useValue(claim);

  const countdownString = useCountdown(Number(timeToClaim || 0n));

  // console.log(ethers.id("Deposited(address,uint256)"));

  return (
    <div className="h-[433px]">
      <CardHeader></CardHeader>
      <div className="flex flex-col justify-between h-full flex-grow">
        <CardContent className="ock-font-family flex flex-col justify-between h-full">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col justify-start items-start">
              <label className="font-semibold text-xs">Next Claim In</label>
              <label className="font-normal text-xl">{countdownString}</label>
            </div>
            <div className="flex flex-col justify-end items-end">
              <label className="font-semibold text-xs">Claim Count</label>
              <label className="font-normal text-xl">{`${Number(
                userClaimCount || 0n
              )}/${totalClaimCount || 0n}`}</label>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center gap-2 h-full">
            <span
              className={cn("font-semibold text-8xl", color.foregroundMuted)}
            >
              {claimAllocation ? claimAllocation.toString() : 0}
            </span>
            <span className="font-light">BUILD</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center flex-grow w-full">
            <div className="flex items-center">
              {/* Checkmark area */}
              <div className="mr-2">
                {builderScore && builderScore >= 60 ? (
                  <span className="text-green-500 text-xl">&#10003;</span>
                ) : (
                  <span className="text-gray-400 text-xl">&#x2717;</span>
                )}
              </div>
              {/* Label area */}
              <div
                className={
                  builderScore && builderScore >= 60
                    ? "text-green-500 font-bold"
                    : "text-gray-500"
                }
              >
                {`Builder Score >= 60`}
              </div>
            </div>
            <div className="flex items-center">
              {/* Checkmark area */}
              <div className="mr-2">
                {humanCheckVerified ? (
                  // When valid, show a ticked checkmark (you can swap out the emoji for an icon)
                  <span className="text-green-500 text-xl">&#10003;</span>
                ) : (
                  // When not valid, show an empty box or an unticked icon
                  <span className="text-gray-400 text-xl">&#x2717;</span>
                )}
              </div>
              {/* Label area */}
              <div
                className={
                  humanCheckVerified
                    ? "text-green-500 font-bold"
                    : "text-gray-500"
                }
              >
                Human Verfied
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col ock-font-family">
          <CustomSwapButton buttonText="Claim" />
        </CardFooter>
      </div>
    </div>
  );
}
