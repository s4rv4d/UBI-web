/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useReadContract, useWriteContract } from "wagmi";
import { Address } from "viem";
import UBISplitV1 from "../../../abi/UBISplitV1.json";

export function useFetchClaim({
  userAddress,
}: {
  userAddress: `0x${string}` | undefined;
}) {
  const {
    data: allocation,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_splitProxy as Address,
    abi: UBISplitV1.abi,
    functionName: "getAllocation",
    args: [userAddress, 1000n],
  });

  const { writeContractAsync: withdrawAllocation } = useWriteContract();

  const withdrawAlloc = async () => {
    try {
      const withdrawTx = await withdrawAllocation({
        address: process.env.NEXT_PUBLIC_splitProxy as Address,
        abi: UBISplitV1.abi,
        functionName: "withdrawAllocation",
        args: [1000n],
      });
      return withdrawTx;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  return { allocation, isLoading, error, refetch, withdrawAlloc };
}
