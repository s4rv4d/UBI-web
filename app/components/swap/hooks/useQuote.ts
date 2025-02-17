/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useReadContract } from "wagmi";
import { Address } from "viem";
import { ethers } from "ethers";
import { QUOTER_ADDRESSES } from "@uniswap/sdk-core";
import type { Token } from "@coinbase/onchainkit/token";
import QuoterABI from "@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoter.sol/IQuoter.json";

export function useQuote({
  tokenIn,
  tokenOut,
  fee,
  amountIn,
}: {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  fee: any;
  amountIn: any;
}) {
  // const chainId = useChainId();
  let path;

  if ((tokenIn?.symbol ?? "ETH") !== "ETH") {
    path = ethers.solidityPacked(
      ["address", "uint24", "address", "uint24", "address"],
      [
        tokenIn?.address ?? "0x0000000000000000000000000000000000000000",
        fee,
        "0x4200000000000000000000000000000000000006",
        fee, // Fee tier (e.g., 3000 for 0.3%)
        tokenOut?.address ?? "0x0000000000000000000000000000000000000000",
      ]
    );
  } else {
    path = ethers.solidityPacked(
      ["address", "uint24", "address"],
      [
        tokenIn?.address ?? "0x0000000000000000000000000000000000000000",
        fee, // Fee tier (e.g., 3000 for 0.3%)
        tokenOut?.address ?? "0x0000000000000000000000000000000000000000",
      ]
    );
  }

  const parsedAmountIn =
    amountIn && amountIn !== ""
      ? ethers.parseUnits(amountIn, tokenIn?.decimals ?? 18)
      : ethers.toBigInt(0); // Default to 0 if amountIn is invalid

  const { data, isLoading, error, refetch } = useReadContract({
    address: QUOTER_ADDRESSES[84532] as Address,
    abi: QuoterABI.abi,
    functionName: "quoteExactInput",
    args: [
      path, // Address of the output token
      parsedAmountIn, // Amount of input token in smallest units
    ],
    chainId: 84532,
  });

  return { quote: data, isLoading, error, refetch };
}
