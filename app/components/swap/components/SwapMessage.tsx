"use client";
import { cn, color, text } from "@coinbase/onchainkit/theme";
import type { SwapMessageReact } from "../types";
import { getSwapMessage } from "../utils/getSwapMessage";
import { useSwapContext } from "../provider/SwapProvider";

export function SwapMessage({ className }: SwapMessageReact) {
  const { address, to, from, lifecycleStatus } = useSwapContext();

  const message = getSwapMessage({
    address,
    from,
    lifecycleStatus,
    to,
  });

  return (
    <div
      className={cn(
        "flex h-7 pt-2",
        text.label2,
        color.foregroundMuted,
        className
      )}
      data-testid="ockSwapMessage_Message"
    >
      {message}
    </div>
  );
}
