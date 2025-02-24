/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useReadContract } from "wagmi";
import { Address } from "viem";
import { ethers } from "ethers";
import { QUOTER_ADDRESSES } from "@uniswap/sdk-core";

import { Token } from "@/types/tokenType";
import QuoterABI from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json";

export function useQuote({
  tokenIn,
  tokenOut,
  amountIn,
}: {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  amountIn: any;
}) {
  // const chainId = useChainId();
  let path;

  if ((tokenIn?.symbol ?? "ETH") !== "ETH") {
    path = ethers.solidityPacked(
      ["address", "uint24", "address", "uint24", "address"],
      [
        tokenIn?.address ?? "0x0000000000000000000000000000000000000000",
        tokenIn?.fee ?? 3000n,
        "0x4200000000000000000000000000000000000006",
        tokenOut?.fee ?? 3000n,
        tokenOut?.address ?? "0x0000000000000000000000000000000000000000",
      ]
    );
  } else {
    path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [
        tokenIn?.address ?? "0x0000000000000000000000000000000000000000",
        tokenOut?.fee ?? 3000n,
        tokenOut?.address ?? "0x0000000000000000000000000000000000000000",
      ]
    );
  }

  const parsedAmountIn =
    amountIn && amountIn !== ""
      ? ethers.parseUnits(amountIn, tokenIn?.decimals ?? 18)
      : ethers.toBigInt(0); // Default to 0 if amountIn is invalid

  const { data, isLoading, error, refetch } = useReadContract({
    address: QUOTER_ADDRESSES[
      Number(process.env.NEXT_PUBLIC_CHAIN_ID)
    ] as Address,
    abi: QuoterABI.abi,
    functionName: "quoteExactInput",
    args: [
      path, // Address of the output token
      parsedAmountIn, // Amount of input token in smallest units
    ],
    chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  });

  return { quote: data, isLoading, error, refetch };
}
