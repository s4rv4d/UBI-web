/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Address, Hex, TransactionReceipt } from "viem";
import type {
  Config,
  UseBalanceReturnType,
  UseReadContractReturnType,
} from "wagmi";
import type { SendTransactionMutateAsync } from "wagmi/query";

import type { Token } from "@coinbase/onchainkit/token";

type Call = { to: Hex; data?: Hex; value?: bigint };

export type SendSwapTransactionParams = {
  config: Config;
  isSponsored?: boolean; // Whether the swap is sponsored (default: false)
  paymaster?: string; // OnchainKit config paymaster RPC url
  // biome-ignore lint: cannot find module 'wagmi/experimental/query'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendCallsAsync: any;
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>;
  transactions: SwapTransaction[]; // A list of transactions to execute
  updateLifecycleStatus: (state: LifecycleStatusUpdate) => void;
};

export type SendSingleTransactionsParams = {
  config: Config;
  sendTransactionAsync: SendTransactionMutateAsync<Config, unknown>;
  transactions: SwapTransaction[]; // A list of transactions to execute
  updateLifecycleStatus: (state: LifecycleStatusUpdate) => void;
};

type LifecycleStatusDataShared = {
  isMissingRequiredField: boolean;
  maxSlippage: number;
};

export type SwapTransactionType = "Batched" | "ERC20" | "Permit2" | "Swap";

export type SwapError = {
  code: string; // The error code representing the type of swap error.
  error: string; // The error message providing details about the swap error.
  message: string; // The error message providing details about the swap error.
};

export type LifecycleStatus =
  | {
      statusName: "init";
      statusData: LifecycleStatusDataShared;
    }
  | {
      statusName: "error";
      statusData: SwapError & LifecycleStatusDataShared;
    }
  | {
      statusName: "amountChange";
      statusData: {
        amountFrom?: string;
        amountETH?: string;
        amountUSDC?: string;
        amountTo: string;
        tokenFrom?: Token;
        tokenFromETH?: Token;
        tokenFromUSDC?: Token;
        tokenTo?: Token;
      } & LifecycleStatusDataShared;
    }
  | {
      statusName: "slippageChange";
      statusData: LifecycleStatusDataShared;
    }
  | {
      statusName: "transactionPending";
      statusData: LifecycleStatusDataShared;
    }
  | {
      statusName: "transactionApproved";
      statusData: {
        callsId?: Hex;
        transactionHash?: Hex;
        transactionType: SwapTransactionType;
      } & LifecycleStatusDataShared;
    }
  | {
      statusName: "success";
      statusData: LifecycleStatusDataShared;
    }
  | {
      statusName: "fetching_claim";
      statusData: LifecycleStatusDataShared;
    };

type PartialKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>> extends infer O
  ? { [P in keyof O]: O[P] }
  : never;

// check if all keys in T are a key of LifecycleStatusDataShared
type AllKeysInShared<T> = keyof T extends keyof LifecycleStatusDataShared
  ? true
  : false;

export type LifecycleStatusUpdate = LifecycleStatus extends infer T
  ? T extends { statusName: infer N; statusData: infer D }
    ? { statusName: N } & (N extends "init" // statusData required in statusName "init"
        ? { statusData: D }
        : AllKeysInShared<D> extends true // is statusData is LifecycleStatusDataShared, make optional
        ? {
            statusData?: PartialKeys<
              D,
              keyof D & keyof LifecycleStatusDataShared
            >;
          } // make all keys in LifecycleStatusDataShared optional
        : {
            statusData: PartialKeys<
              D,
              keyof D & keyof LifecycleStatusDataShared
            >;
          })
    : never
  : never;

export type RawTransactionData = {
  data: string; // The transaction data
  from: string; // The sender address
  gas: string; // The gas limit
  gasPrice: string; // The gas price
  to: string; // The recipient address
  value: string; // The value of the transaction
};

export type QuoteWarning = {
  description?: string; // The description of the warning
  message?: string; // The message of the warning
  type?: string; // The type of the warning
};

export type SwapQuote = {
  amountReference: string; // The reference amount for the quote
  from: Token; // The source token for the swap
  fromAmount: string; // The amount of the source token
  fromAmountUSD: string; // The USD value of the source token
  hasHighPriceImpact: boolean; // Whether the price impact is high
  priceImpact: string; // The price impact of the swap
  slippage: string; // The slippage of the swap
  to: Token; // The destination token for the swap
  toAmount: string; // The amount of the destination token
  toAmountUSD: string; // The USD value of the destination token
  warning?: QuoteWarning; // The warning associated with the quote
};

export type SwapAmountInputReact = {
  className?: string; // Optional className override for top div element.
  delayMs?: number; // The debounce delay in milliseconds
  label: string; // Descriptive label for the input field
  swappableTokens?: Token[]; // Swappable tokens
  token?: Token; // Selected token
  type: "to" | "from"; // Identifies if component is for toToken or fromToken
};

export type SwapAPIResponse = {
  approveTx?: RawTransactionData; // The approval transaction
  chainId: string; // The chain ID
  fee: Fee; // The fee for the trade
  quote: SwapQuote; // The quote for the trade
  tx: RawTransactionData; // The trade transaction
};

export type Fee = {
  amount: string; // The amount of the fee
  baseAsset: Token; // The base asset for the fee
  percentage: string; // The percentage of the fee
};

/**
 * Note: exported as public Type
 */
export type SwapButtonReact = {
  className?: string; // Optional className override for top div element.
  disabled?: boolean; // Disables swap button
};

export type SwapConfig = {
  maxSlippage: number; // Maximum acceptable slippage for a swap. (default: 10) This is as a percent, not basis points;
};

/**
 * Note: exported as public Type
 */
export type SwapMessageReact = {
  className?: string; // Optional className override for top div element.
};

export type SwapParams = {
  amount: string;
  fromAddress: Address;
  from: Token;
  to: Token;
};

export type SwapProviderReact = {
  children: ReactNode;
  configuration?: {
    maxSlippage: number; // Maximum acceptable slippage for a swap. (default: 10) This is as a percent, not basis points
  }; // An optional setting to sponsor swaps with a Paymaster. (default: false)
  onError?: (error: SwapError) => void; // An optional callback function that handles errors within the provider.
  onStatus?: (lifecycleStatus: LifecycleStatus) => void; // An optional callback function that exposes the component lifecycle state
  onSuccess?: (transactionReceipt: TransactionReceipt) => void; // An optional callback function that exposes the transaction receipt
};

/**
 * Note: exported as public Type
 */
export type SwapUnit = {
  amount: string;
  amountUSD: string;
  balance?: string;
  balanceResponse?: UseBalanceReturnType | UseReadContractReturnType;
  error?: SwapError;
  loading: boolean;
  setAmount: Dispatch<SetStateAction<string>>;
  setAmountUSD: Dispatch<SetStateAction<string>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setToken?: Dispatch<SetStateAction<Token | undefined>>;
  token: Token | undefined;
};

/**
 * Note: exported as public Type
 */
export type Transaction = {
  chainId: number; // The chain ID
  data: Hex; // The data for the transaction
  gas: bigint; // The gas limit
  maxFeePerGas?: bigint | undefined; // The maximum fee per gas
  maxPriorityFeePerGas?: bigint | undefined; // The maximum priority fee per gas
  nonce?: number; // The nonce for the transaction
  to: Address; // The recipient address
  value: bigint; // The value of the transaction
};

export type SwapTransaction = {
  transaction: Call;
  transactionType: SwapTransactionType;
};

export type UseAwaitCallsParams = {
  accountConfig: Config;
  lifecycleStatus: LifecycleStatus;
  updateLifecycleStatus: (state: LifecycleStatusUpdate) => void; // A function to set the lifecycle status of the component
};

export type SwapContextType = {
  address?: Address; // Used to check if user is connected in SwapButton
  configuration: SwapConfig;
  from: SwapUnit;
  lifecycleStatus: LifecycleStatus;
  handleAmountChange: (
    t: "from" | "to",
    amount: string,
    st?: Token,
    dt?: Token
  ) => void;
  handleSubmit: () => void;
  handleToggle: () => void;
  updateLifecycleStatus: (state: LifecycleStatusUpdate) => void; // A function to set the lifecycle status of the component
  to: SwapUnit;
  isToastVisible: boolean;
  setIsToastVisible: (visible: boolean) => void;
  transactionHash: string;
  setTransactionHash: (hash: string) => void;
  handleClaim: () => void;
  claim?: bigint;
  humanCheckVerified?: boolean;
};

export type FromTo = {
  from: SwapUnit;
  to: SwapUnit;
};

export type UseGetETHBalanceResponse = {
  error?: SwapError;
  response?: UseBalanceReturnType;
  convertedBalance?: string;
  roundedBalance?: string;
};

export type UseGetTokenBalanceResponse = {
  error?: SwapError;
  response?: UseReadContractReturnType;
  convertedBalance?: string;
  roundedBalance?: string;
};

export type GetSwapMessageParams = {
  address?: Address;
  lifecycleStatus: LifecycleStatus;
  to: SwapUnit;
  from: SwapUnit;
};

export type SwapToastReact = {
  className?: string; // An optional CSS class name for styling the toast component.
  durationMs?: number; // An optional value to customize time until toast disappears
  position?: "top-center" | "top-right" | "bottom-center" | "bottom-right"; // An optional position property to specify the toast's position on the screen.
};
