"use client";
import { useSwapContext } from "../provider/SwapProvider";
import { border, cn, color, pressable, text } from "@coinbase/onchainkit/theme";

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
    timeToClaim,
    totalClaimCount,
    userClaimCount,
    builderScore,
  } = useSwapContext();

  const isLoading =
    to.loading ||
    from.loading ||
    statusName === "transactionPending" ||
    statusName === "transactionApproved";

  const isDisabled =
    (claim ?? 0n) <= 0n ||
    isLoading ||
    timeToClaim !== 0n ||
    userClaimCount === totalClaimCount ||
    !humanCheckVerified ||
    (builderScore ?? 0) < 60;

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
      onClick={() => handleClaim()}
    >
      <span className={cn(text.headline, color.inverse)}>{buttonText}</span>
    </button>
  );
}
