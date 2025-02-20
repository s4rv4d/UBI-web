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
    error,
    refetch,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_splitProxy as Address,
    abi: UBISplitV1.abi,
    functionName: "getUserAllocation",
    args: [userAddress],
  });

  const { data: dateToClaim, refetch: fetchDateToClaim } = useReadContract({
    address: process.env.NEXT_PUBLIC_splitProxy as Address,
    abi: UBISplitV1.abi,
    functionName: "dateToClaimNext",
    args: [userAddress],
  });

  const { data: totalClaimCount, refetch: fetchTotalCount } = useReadContract({
    address: process.env.NEXT_PUBLIC_splitProxy as Address,
    abi: UBISplitV1.abi,
    functionName: "getClaimCount",
    args: [],
  });

  const { data: userClaimCount, refetch: fetchUserTotalCount } =
    useReadContract({
      address: process.env.NEXT_PUBLIC_splitProxy as Address,
      abi: UBISplitV1.abi,
      functionName: "userDoneClaimCount",
      args: [userAddress],
    });

  const { writeContractAsync: withdrawAllocation, error: withdrawError } =
    useWriteContract();

  const withdrawAlloc = async () => {
    try {
      const withdrawTx = await withdrawAllocation({
        address: process.env.NEXT_PUBLIC_splitProxy as Address,
        abi: UBISplitV1.abi,
        functionName: "withdrawAllocation",
      });
      return withdrawTx;
    } catch (error: any) {
      console.error("Errr2 ", error);
      throw error;
    }
  };

  return {
    allocation,
    error,
    refetch,
    withdrawAlloc,
    withdrawError,
    fetchDateToClaim,
    dateToClaim,
    totalClaimCount,
    fetchTotalCount,
    userClaimCount,
    fetchUserTotalCount,
  };
}
