"use client";
import { useSwapContext } from "../provider/SwapProvider";
import { border, cn, color, pressable, text } from "@coinbase/onchainkit/theme";

export function CustomDonateButton({
  buttonText = "Donate",
}: {
  buttonText: string;
}) {
  const {
    address,
    from,
    handleDeposit,
    lifecycleStatus: { statusName },
  } = useSwapContext();

  const isLoading =
    from.loading ||
    statusName === "transactionPending" ||
    statusName === "transactionApproved";

  const isDisabled = !from.amount || !from.token || isLoading;

  if (!isDisabled && !address) {
    return (
      <button
        type="button"
        className={cn(
          "bg-[#0000EB]",
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
        "bg-[#0000EB]",
        border.radius,
        "w-full rounded-xl",
        "mt-4 px-4 py-3",
        isDisabled && pressable.disabled,
        text.headline
      )}
      disabled={isDisabled}
      onClick={() => handleDeposit()}
    >
      <span className={cn(text.headline, color.inverse)}>{buttonText}</span>
    </button>
  );
}
