/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount, useConfig, useSendTransaction } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { useSwitchChain } from "wagmi";
import type { Token } from "@coinbase/onchainkit/token";
import type { SwapContextType, SwapProviderReact } from "../types";
import { useLifecycleStatus } from "../hooks/useLifecycleStatus";
import { useFromTo } from "../hooks/useFromTo";
import { useResetInputs } from "../hooks/useResetInputs";
import { useValue } from "../hooks/useValue";
import { formatTokenAmount } from "../utils/formatTokenAmount";
import { useQuote } from "../hooks/useQuote";
import { useDonate } from "../hooks/useDonate";
import { useFetchClaim } from "../hooks/useFetchClaim";
import { BigNumberish, ethers } from "ethers";
import {
  encodeExactInput,
  contructPath,
  SwapParam,
} from "../utils/encodeExactInputSingle";
import { Address } from "viem";
import { config } from "@/app/config/config";

const FALLBACK_DEFAULT_MAX_SLIPPAGE = 3;

const emptyContext = {} as SwapContextType;

export const SwapContext = createContext<SwapContextType>(emptyContext);

export function useSwapContext() {
  const context = useContext(SwapContext);
  if (context === emptyContext) {
    throw new Error("useSwapContext must be used within a Swap component");
  }
  return context;
}

export function SwapProvider({
  children,
  configuration = {
    maxSlippage: FALLBACK_DEFAULT_MAX_SLIPPAGE,
  },
  onError,
  onStatus,
  onSuccess,
}: SwapProviderReact) {
  const accountConfig = useConfig();

  const { address, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const [lifecycleStatus, updateLifecycleStatus] = useLifecycleStatus({
    statusName: "init",
    statusData: {
      isMissingRequiredField: true,
      maxSlippage: configuration.maxSlippage,
    },
  });

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [hasHandledSuccess, setHasHandledSuccess] = useState(false);
  const [latestCalldata, setLatestCalldata] = useState<SwapParam>();
  const [claim, setClaim] = useState<bigint>();

  const { from, to } = useFromTo(address);
  const { sendTransactionAsync } = useSendTransaction();
  const resetInputs = useResetInputs({ from, to });

  const fee = 3000n; // 0.3% Uniswap V3 fee tier

  //////
  const { approveERC, donate, isDepositEth } = useDonate({
    tokenIn: from.token,
  });
  //////

  const { error, refetch } = useQuote({
    tokenIn: from.token,
    tokenOut: to.token,
    fee,
    amountIn: from.amount,
  });

  const {
    allocation,
    refetch: quoteRefetch,
    withdrawAlloc,
  } = useFetchClaim({
    userAddress: address,
  });

  // Component lifecycle emitters

  useEffect(() => {
    const fetch = async () => {
      if (address) {
        updateLifecycleStatus({
          statusName: "fetching_claim",
        });

        const { data, error } = await quoteRefetch();

        console.log("claim: ", data, error, allocation);
        setClaim(data as bigint);
      }
    };

    fetch();
  }, [address, lifecycleStatus.statusName]);

  useEffect(() => {
    // Error
    if (lifecycleStatus.statusName === "error") {
      onError?.(lifecycleStatus.statusData);
    }
    // Success
    if (lifecycleStatus.statusName === "success") {
      setHasHandledSuccess(true);
      setIsToastVisible(true);
    }
    // Emit Status
    onStatus?.(lifecycleStatus);
  }, [
    onError,
    onStatus,
    onSuccess,
    lifecycleStatus,
    lifecycleStatus.statusData,
    lifecycleStatus.statusName,
  ]);

  useEffect(() => {
    if (lifecycleStatus.statusName === "init" && hasHandledSuccess) {
      setHasHandledSuccess(false);
      resetInputs();
      setLatestCalldata(undefined);
    }
  }, [hasHandledSuccess, lifecycleStatus.statusName, resetInputs]);

  useEffect(() => {
    // Reset status to init after success has been handled
    if (lifecycleStatus.statusName === "success" && hasHandledSuccess) {
      updateLifecycleStatus({
        statusName: "init",
        statusData: {
          isMissingRequiredField: true,
          maxSlippage: configuration.maxSlippage,
        },
      });
    }
  }, [
    configuration.maxSlippage,
    hasHandledSuccess,
    lifecycleStatus.statusName,
    updateLifecycleStatus,
  ]);

  const handleToggle = useCallback(() => {
    from.setAmount(to.amount);
    to.setAmount(from.amount);
    from.setToken?.(to.token);
    to.setToken?.(from.token);

    updateLifecycleStatus({
      statusName: "amountChange",
      statusData: {
        amountFrom: from.amount,
        amountTo: to.amount,
        tokenFrom: from.token,
        tokenTo: to.token,
        // token is missing
        isMissingRequiredField:
          !from.token || !to.token || !from.amount || !to.amount,
      },
    });
  }, [from, to, updateLifecycleStatus]);

  const handleAmountChange = useCallback(
    async (
      type: "from" | "to",
      amount: string,
      sToken?: Token,
      dToken?: Token
    ) => {
      const source = type === "from" ? from : to;
      const destination = type === "from" ? to : from;

      source.token = sToken ?? source.token;
      destination.token = dToken ?? destination.token;

      // if token is missing alert user via isMissingRequiredField
      if (source.token === undefined || destination.token === undefined) {
        updateLifecycleStatus({
          statusName: "amountChange",
          statusData: {
            amountFrom: from.amount,
            amountTo: to.amount,
            tokenFrom: from.token,
            tokenTo: to.token,
            // token is missing
            isMissingRequiredField: true,
          },
        });
        return;
      }

      if (amount === "" || amount === "." || Number.parseFloat(amount) === 0) {
        destination.setAmount("");
        destination.setAmountUSD("");
        source.setAmountUSD("");

        updateLifecycleStatus({
          statusName: "init",
          statusData: {
            isMissingRequiredField: true,
            maxSlippage: configuration.maxSlippage,
          },
        });

        return;
      }

      destination.setLoading(true);
      console.log(type);
      updateLifecycleStatus({
        statusName: "amountChange",
        statusData: {
          amountFrom: type === "from" ? amount : "",
          amountTo: type === "to" ? amount : "",
          tokenFrom: from.token,
          tokenTo: to.token,
          isMissingRequiredField: false,
        },
      });

      try {
        try {
          const { data, error } = await refetch(); // Fetch the quote manually

          console.log(data, error);
          console.log(from.token);
          if (data) {
            const bignU = ethers.toBigInt(data as BigNumberish);

            const formattedAmount = formatTokenAmount(
              bignU.toString(),
              to.token?.decimals ?? 18
            );

            // const formatInput = ethers.toBigInt();
            const bigNumberValue = ethers.parseUnits(
              amount,
              from.token?.decimals ?? 18
            );

            console.log("bug number valie:", amount, bigNumberValue);

            destination.setAmount(formattedAmount);

            const userAddy: Address = process.env
              .NEXT_PUBLIC_splitProxy as Address;

            const path = contructPath({
              tokenIn: from.token,
              tokenOut: to.token,
              fee,
            });

            console.log("path: ", path);

            const calldata: SwapParam = encodeExactInput({
              path,
              recipient: userAddy,
              amountIn: bigNumberValue,
            });

            console.log("calldata: ", calldata);

            setLatestCalldata(calldata);

            updateLifecycleStatus({
              statusName: "amountChange",
              statusData: {
                amountFrom: type === "from" ? amount : formattedAmount,
                amountTo: type === "to" ? amount : formattedAmount,
                tokenFrom: from.token,
                tokenTo: to.token,
                // if quote was fetched successfully, we
                // have all required fields
                isMissingRequiredField: !formattedAmount,
              },
            });
          }
        } catch (err) {
          console.error("Error fetching quote:", err, error);
        }
      } catch (err) {
        updateLifecycleStatus({
          statusName: "error",
          statusData: {
            code: "TmSPc01", // Transaction module SwapProvider component 01 error
            error: JSON.stringify(err),
            message: "",
          },
        });
      } finally {
        // reset loading state when quote request resolves
        destination.setLoading(false);
      }
    },
    [from, to, lifecycleStatus, updateLifecycleStatus]
  );

  const handleSubmit = useCallback(async () => {
    if (!address || !from.token || !to.token || !from.amount) {
      return;
    }

    // @audit OPTMISE THIS LATER

    try {
      const bigNumberValue = ethers.parseUnits(
        from.amount,
        from.token?.decimals ?? 18
      );

      if (isDepositEth) {
        const hash = await donate({
          value: bigNumberValue,
          calldata: latestCalldata as SwapParam,
        });

        updateLifecycleStatus({
          statusName: "transactionPending",
        });

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: hash,
        });

        console.log(transactionReceipt);

        if (transactionReceipt.status == "success") {
          updateLifecycleStatus({
            statusName: "success",
          });
        } else {
          throw new Error("Donation failed");
        }
      } else {
        const approveHash = await approveERC({ value: bigNumberValue });

        updateLifecycleStatus({
          statusName: "transactionPending",
        });

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: approveHash,
        });

        if (transactionReceipt.status == "success") {
          const donateHash = await donate({
            value: bigNumberValue,
            calldata: latestCalldata as SwapParam,
          });

          const donateReceipt = await waitForTransactionReceipt(config, {
            hash: donateHash,
          });

          if (donateReceipt.status == "success") {
            updateLifecycleStatus({
              statusName: "success",
            });
          } else {
            throw new Error("Donation failed");
          }
        } else {
          throw new Error("Approve failed");
        }
      }
    } catch (err) {
      updateLifecycleStatus({
        statusName: "error",
        statusData: {
          code: "TmSPc02", // Transaction module SwapProvider component 02 error
          error: JSON.stringify(err),
          message: "errrrrr server",
        },
      });
    }
  }, [
    accountConfig,
    address,
    chainId,
    from.amount,
    from.token,
    lifecycleStatus,
    sendTransactionAsync,
    switchChainAsync,
    to.token,
    updateLifecycleStatus,
  ]);

  const handleClaim = useCallback(async () => {
    if (!address) {
      return;
    }

    try {
      const hash = await withdrawAlloc();

      updateLifecycleStatus({
        statusName: "transactionPending",
      });

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash: hash,
      });

      console.log(transactionReceipt);

      if (transactionReceipt.status == "success") {
        updateLifecycleStatus({
          statusName: "success",
        });
      } else {
        throw new Error("Donation failed");
      }
    } catch (err) {
      updateLifecycleStatus({
        statusName: "error",
        statusData: {
          code: "TmSPc02", // Transaction module SwapProvider component 02 error
          error: JSON.stringify(err),
          message: "errrrrr server",
        },
      });
    }
  }, [updateLifecycleStatus, accountConfig, sendTransactionAsync, chainId]);

  const value = useValue({
    address,
    configuration,
    from,
    handleAmountChange,
    handleToggle,
    handleSubmit,
    handleClaim,
    lifecycleStatus,
    updateLifecycleStatus,
    to,
    isToastVisible,
    setIsToastVisible,
    setTransactionHash,
    transactionHash,
    claim,
  });

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}
