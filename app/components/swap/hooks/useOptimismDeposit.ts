import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
// import { useSimulateContract } from "wagmi";
// import { useEstimateGas } from "wagmi";

const OPTIMISM_PORTAL_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "_gasLimit",
        type: "uint64",
      },
      {
        internalType: "bool",
        name: "_isCreation",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "depositTransaction",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const OPTIMISM_PORTAL_ADDRESS = "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e";

export function useOptimismDeposit({
  targetAddress,
  calldata,
  gasLimit = 1000000n, // Default gas limit, adjust as needed
}: {
  targetAddress: `0x${string}`;
  calldata: `0x${string}`;
  gasLimit?: bigint;
}) {
  const { writeContract, isError, isPending, error } = useWriteContract();

  const depositToOptimism = async ({ value }: { value: bigint }) => {
    try {
      console.log({
        address: OPTIMISM_PORTAL_ADDRESS,
        abi: OPTIMISM_PORTAL_ABI,
        functionName: "depositTransaction",
        args: [
          targetAddress, // _to: address to call on L2
          value, // _value: amount of ETH to send
          gasLimit, // _gasLimit: gas limit for L2 execution
          false, // _isCreation: false for contract calls
          calldata, // _data: your swap router calldata
        ],
        value: parseEther("0"), // ETH value to send with transaction
      });

      // 0.000099908791632
      // 0.0009997724755728
      // 0.000099908791632
      // 0.000099908791632
      const tx = await writeContract({
        address: OPTIMISM_PORTAL_ADDRESS,
        abi: OPTIMISM_PORTAL_ABI,
        functionName: "depositTransaction",
        args: [
          targetAddress, // _to: address to call on L2
          value, // _value: amount of ETH to send
          gasLimit, // _gasLimit: gas limit for L2 execution
          false, // _isCreation: false for contract calls
          calldata, // _data: your swap router calldata
        ],
        value: parseEther("0"), // ETH value to send with transaction
        chainId: 1,
      });

      console.log("error: ", error);

      return tx;
    } catch (error) {
      console.error("Error depositing to Optimism:", error);

      console.log("error2: ", error);
      throw error;
    }
  };

  return {
    depositToOptimism,
    isError,
    isPending,
    error,
  };
}

// Hook to wait for L1 transaction confirmation
export function useWaitForTxn(hash?: `0x${string}`) {
  const { isLoading, isSuccess, data } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    isLoading,
    isSuccess,
    receipt: data,
  };
}
