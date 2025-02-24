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
import { Token } from "@/types/tokenType";
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
import { toast } from "sonner";

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
  const [totalClaimCount, setTotalClaimCount] = useState<bigint>();
  const [dateToClaim, setDateToClaim] = useState<bigint>();
  const [userClaimCount, setUserClaimCount] = useState<bigint>();
  const [humanCheckVerified, setHumanCheckVerified] = useState<boolean>(false);
  const [builderScore, setBuilderScore] = useState<number>(0);

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
    amountIn: from.amount,
  });

  const {
    refetch: quoteRefetch,
    withdrawAlloc,
    fetchDateToClaim,
    fetchTotalCount,
    fetchUserTotalCount,
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

        const { data: quoteData } = await quoteRefetch();
        const { data: timeToClaimData } = await fetchDateToClaim();
        const { data: totalCountData } = await fetchTotalCount();
        const { data: userCountData } = await fetchUserTotalCount();

        setClaim(quoteData as bigint);
        setDateToClaim(timeToClaimData as bigint);
        setTotalClaimCount(totalCountData as bigint);
        setUserClaimCount(userCountData as bigint);
      }
    };

    fetch();
  }, [address, lifecycleStatus.statusName === "success"]);

  useEffect(() => {
    const fetchHumanCheck = async () => {
      try {
        const res = await fetch(`/api/check?address=${address}`);
        const data = await res.json();
        if (data && data.passport) {
          console.log("data humancheck: ", data.passport.score);
          setHumanCheckVerified(data.passport.human_checkmark);
          setBuilderScore(data.passport.score);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchHumanCheck();
  }, [address]);

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

        const transactionReceiptPr = waitForTransactionReceipt(config, {
          hash: hash,
        });

        toast.promise(transactionReceiptPr, {
          loading: "Executing Transaction...",
          success: (data: any) => {
            if (data.status == "success") {
              updateLifecycleStatus({
                statusName: "success",
              });
            } else {
              throw new Error("Claim failed");
            }

            return "Donate done";
          },
          error: (data: any) => {
            updateLifecycleStatus({
              statusName: "error",
              statusData: {
                code: "", // Transaction module SwapProvider component 02 error
                error: "",
                message: "",
              },
            });

            return data.details
              ? data.details
              : data.message
              ? data.message
              : "error :(";
          },
        });
      } else {
        const approveHash = await approveERC({ value: bigNumberValue });

        updateLifecycleStatus({
          statusName: "transactionPending",
        });

        const transactionReceipt = await waitForTransactionReceipt(config, {
          hash: approveHash,
        });

        if (transactionReceipt.status == "success") {
          toast.success("Approved allocation");
          const donateHash = await donate({
            value: bigNumberValue,
            calldata: latestCalldata as SwapParam,
          });

          const donateReceiptPr = waitForTransactionReceipt(config, {
            hash: donateHash,
          });

          toast.promise(donateReceiptPr, {
            loading: "Executing Transaction...",
            success: (data: any) => {
              if (data.status == "success") {
                updateLifecycleStatus({
                  statusName: "success",
                });
              } else {
                throw new Error("Claim failed");
              }

              return "Donate done";
            },
            error: (data: any) => {
              updateLifecycleStatus({
                statusName: "error",
                statusData: {
                  code: "", // Transaction module SwapProvider component 02 error
                  error: "",
                  message: "",
                },
              });

              return data.details
                ? data.details
                : data.message
                ? data.message
                : "error :(";
            },
          });
        } else {
          toast.error("Approve failed");
          throw new Error("Approve failed");
        }
      }
    } catch (err: any) {
      toast.error("Donate failed");
      updateLifecycleStatus({
        statusName: "error",
        statusData: {
          code: "", // Transaction module SwapProvider component 02 error
          error: JSON.stringify(err.details && err.details),
          message: "",
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

      setTransactionHash(hash);

      const transactionReceiptPr = waitForTransactionReceipt(config, {
        hash: hash,
      });

      toast.promise(transactionReceiptPr, {
        loading: "Executing Transaction...",
        success: (data: any) => {
          if (data.status == "success") {
            updateLifecycleStatus({
              statusName: "success",
            });
          } else {
            throw new Error("Claim failed");
          }

          return "Claim done";
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: (data: any) => {
          updateLifecycleStatus({
            statusName: "error",
            statusData: {
              code: "", // Transaction module SwapProvider component 02 error
              error: "",
              message: "",
            },
          });

          return "Claim failed";
        },
      });
    } catch (err: any) {
      toast.error("Claim failed");
      updateLifecycleStatus({
        statusName: "error",
        statusData: {
          code: "", // Transaction module SwapProvider component 02 error
          error: JSON.stringify(err.details && err.details),
          message: "",
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
    humanCheckVerified,
    timeToClaim: dateToClaim,
    totalClaimCount: totalClaimCount,
    userClaimCount: userClaimCount,
    builderScore,
  });

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}
