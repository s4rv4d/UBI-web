"use client";
import { useSwapContext } from "../provider/SwapProvider";
import {
  background,
  border,
  cn,
  color,
  pressable,
  text,
} from "@coinbase/onchainkit/theme";

export function CustomSwapButton({
  buttonText = "Donate",
}: {
  buttonText: string;
}) {
  const {
    address,
    to,
    from,
    handleClaim,
    lifecycleStatus: { statusName },
    claim,
    humanCheckVerified,
  } = useSwapContext();

  const isLoading =
    to.loading ||
    from.loading ||
    statusName === "transactionPending" ||
    statusName === "transactionApproved";

  const isDisabled = !claim || isLoading || !humanCheckVerified;

  if (!isDisabled && !address) {
    return (
      <button
        type="button"
        className={cn(
          background.primary,
          border.radius,
          "w-full rounded-xl",
          "mt-4 px-4 py-3",
          pressable.disabled,
          text.headline
        )}
        disabled={true}
      >
        <span className={cn(text.headline, color.inverse)}>Connet wallet</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        background.primary,
        border.radius,
        "w-full rounded-xl",
        "mt-4 px-4 py-3",
        isDisabled && pressable.disabled,
        text.headline
      )}
      disabled={isDisabled}
      onClick={() => handleClaim()}
    >
      <span className={cn(text.headline, color.inverse)}>{buttonText}</span>
    </button>
  );
}
