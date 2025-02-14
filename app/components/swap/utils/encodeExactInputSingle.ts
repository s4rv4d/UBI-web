/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import SwapRouter from "@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json";
import type { Token } from "@coinbase/onchainkit/token";
import { Address } from "viem";
import { ethers } from "ethers";
import { encodePacked } from "viem";

export type SwapParam = {
  path: `0x${string}`;
  recipient: `0x${string}`;
  amountIn: bigint;
  amountOutMinimum: bigint;
};

export function contructPath({
  tokenIn,
  tokenOut,
  fee,
}: {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  fee: any;
}) {
  let path;

  if ((tokenIn?.symbol ?? "ETH") !== "ETH") {
    path = encodePacked(
      ["address", "uint24", "address", "uint24", "address"],
      [
        tokenIn?.address
          ? tokenIn.address
          : "0x0000000000000000000000000000000000000000",
        fee,
        "0x4200000000000000000000000000000000000006",
        fee, // Fee tier (e.g., 3000 for 0.3%)
        tokenOut?.address
          ? tokenOut.address
          : "0x0000000000000000000000000000000000000000",
      ]
    );
  } else {
    path = encodePacked(
      ["address", "uint24", "address"],
      [
        tokenIn?.address
          ? tokenIn.address
          : "0x0000000000000000000000000000000000000000",
        fee, // Fee tier (e.g., 3000 for 0.3%)
        tokenOut?.address
          ? tokenOut.address
          : "0x0000000000000000000000000000000000000000",
      ]
    );
  }

  return path;
}

export function encodeExactInput({
  path,
  recipient,
  amountIn,
}: {
  path: `0x${string}`;
  amountIn: bigint;
  recipient: Address;
}) {
  // const iface = new ethers.Interface(SwapRouter.abi);

  const params = {
    path,
    recipient,
    amountIn: amountIn, // Convert input amount to smallest units
    amountOutMinimum: 0n, // Minimum output in smallest units
  };
  return params;
}

export function encodeExactInputSingle({
  tokenIn,
  tokenOut,
  fee,
  recipient,
  amountIn,
  sqrtPriceLimitX96 = 0,
}: {
  tokenIn: Token | undefined;
  tokenOut: Token | undefined;
  fee: any;
  amountIn: any;
  sqrtPriceLimitX96: any;
  recipient: Address;
}) {
  const iface = new ethers.Interface(SwapRouter.abi);

  const t0 = tokenIn?.address ?? "0x0000000000000000000000000000000000000000";
  const t1 = tokenOut?.address ?? "0x0000000000000000000000000000000000000000";

  const params = {
    tokenIn: t0,
    tokenOut: t1,
    fee,
    recipient,
    amountIn: amountIn, // Convert input amount to smallest units
    amountOutMinimum: 0n, // Minimum output in smallest units
    sqrtPriceLimitX96,
  };

  const calldata = iface.encodeFunctionData("exactInputSingle", [params]);
  return calldata;
}
