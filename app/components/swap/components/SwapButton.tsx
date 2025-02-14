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

export function SwapButton({ disabled = false }: { disabled: boolean }) {
  const {
    address,
    to,
    from,
    handleSubmit,
    lifecycleStatus: { statusName },
  } = useSwapContext();

  const isLoading =
    to.loading ||
    from.loading ||
    statusName === "transactionPending" ||
    statusName === "transactionApproved";

  const isDisabled =
    !from.amount ||
    !from.token ||
    !to.amount ||
    !to.token ||
    disabled ||
    isLoading;

  const isSwapInvalid = to.token?.address === from.token?.address;

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
      disabled={isDisabled || isSwapInvalid}
      onClick={() => handleSubmit()}
    >
      <span className={cn(text.headline, color.inverse)}>Donate</span>
    </button>
  );
}
