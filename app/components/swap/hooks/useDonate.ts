/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useWriteContract } from "wagmi";
import { Address, erc20Abi } from "viem";
import type { Token } from "@coinbase/onchainkit/token";
import SwapperAbi from "../../../abi/UBISwapper.json";
import { SwapParam } from "../utils/encodeExactInputSingle";

export function useDonate({ tokenIn }: { tokenIn: Token | undefined }) {
  const TOKEN_ADDRESS: Address = tokenIn?.address
    ? tokenIn.address
    : "0x0000000000000000000000000000000000000000";
  const CONTRACT_ADDRESS: Address = process.env
    .NEXT_PUBLIC_ubiswapper as Address;

  let isDepositEth: boolean;

  if ((tokenIn?.symbol ?? "ETH") !== "ETH") {
    isDepositEth = false;
  } else {
    isDepositEth = true;
  }

  // Setup contract writes
  const { writeContractAsync: approveToken } = useWriteContract();

  const { writeContractAsync: executeContract } = useWriteContract();

  const approveERC = async ({ value }: { value: bigint }) => {
    try {
      const approveTx = await approveToken({
        address: TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACT_ADDRESS, value],
      });

      return approveTx;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const donate = async ({
    value,
    calldata,
  }: {
    value: bigint;
    calldata: SwapParam;
  }) => {
    try {
      const userAddy: Address = process.env.NEXT_PUBLIC_splitProxy as Address;

      const swapCallbackData = {
        exactInputParams: calldata,
        recipient: userAddy,
        isERC20: !isDepositEth,
        amountIn: value,
      };

      console.log(swapCallbackData);

      const contractTx = await executeContract({
        address: CONTRACT_ADDRESS,
        abi: SwapperAbi.abi,
        functionName: "donate",
        args: [swapCallbackData],
        value,
      });

      return contractTx;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return {
    approveERC,
    donate,
    isDepositEth,
  };
}
