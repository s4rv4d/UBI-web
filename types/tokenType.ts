import { Address } from "viem";

export type Token = {
  /** The address of the token contract, this value will be empty for native ETH */
  address: Address | "";
  /** The chain id of the token contract */
  chainId: number;
  /** The number of token decimals */
  decimals: number;
  /** A string url of the token logo */
  image: string | null;
  name: string;
  /** A ticker symbol or shorthand, up to 11 characters */
  symbol: string;
  fee: bigint;
};
