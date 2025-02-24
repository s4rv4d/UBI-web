import { useMemo } from "react";
import { erc20Abi, formatUnits } from "viem";
import type { Address } from "viem";
import { useReadContract } from "wagmi";
import type { UseReadContractReturnType } from "wagmi";
import { getRoundedAmount } from "../utils/getRoundedAmount";
import type { SwapError } from "../types";
import { getSwapErrorCode } from "../../swap/utils/getSwapErrorCode";
import { Token } from "@/types/tokenType";
import type { UseGetTokenBalanceResponse } from "../types";

export function useGetTokenBalance(
  address?: Address,
  token?: Token
): UseGetTokenBalanceResponse {
  const tokenBalanceResponse: UseReadContractReturnType = useReadContract({
    abi: erc20Abi,
    address: token?.address as Address,
    functionName: "balanceOf",
    args: address ? [address] : [],
    query: {
      enabled: !!token?.address && !!address,
    },
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  });
  return useMemo(() => {
    let error: SwapError | undefined;
    if (tokenBalanceResponse?.error) {
      error = {
        code: getSwapErrorCode("balance"),
        error: tokenBalanceResponse?.error?.shortMessage,
        message: "",
      };
    }
    if (
      (tokenBalanceResponse?.data !== 0n && !tokenBalanceResponse?.data) ||
      !token
    ) {
      return {
        convertedBalance: "",
        error,
        roundedBalance: "",
        response: tokenBalanceResponse,
      };
    }
    const convertedBalance = formatUnits(
      tokenBalanceResponse?.data as bigint,
      token?.decimals
    );
    return {
      convertedBalance,
      error,
      response: tokenBalanceResponse,
      roundedBalance: getRoundedAmount(convertedBalance, 8),
    };
  }, [token, tokenBalanceResponse]);
}
