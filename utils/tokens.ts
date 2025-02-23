import type { Token } from "@coinbase/onchainkit/token";

// TESTNET
const WETHToken: Token = {
  address: "0x4200000000000000000000000000000000000006",
  chainId: 84532,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image:
    "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
};

const USDCToken: Token = {
  address: "0x2C0891219AE6f6adC9BE178019957B4743e5e790",
  chainId: 84532,
  decimals: 6,
  name: "USDC",
  symbol: "USDC",
  image:
    "https://cdn.dexscreener.com/fetch?src=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F6319%2Flarge%2Fusdc.png%3F1696506694",
};

const BUILDToken: Token = {
  address: "0xDBeE0FA9120300b03D9857954f067be95cf31597",
  chainId: 84532,
  decimals: 18,
  name: "BUILD",
  symbol: "BUILD",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x3c281a39944a2319aa653d81cfd93ca10983d234.png?size=lg&key=c95e46",
};

// MAINNET
const WETHBaseToken: Token = {
  address: "0x4200000000000000000000000000000000000006",
  chainId: 8453,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image:
    "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
};

const BUILDTokenMainnet: Token = {
  address: "0x3C281A39944a2319aA653D81Cfd93Ca10983D234",
  chainId: 8453,
  decimals: 18,
  name: "BUILD",
  symbol: "BUILD",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x3c281a39944a2319aa653d81cfd93ca10983d234.png?size=lg&key=c95e46",
};

const USDCTokenMainnet: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USDC",
  symbol: "USDC",
  image:
    "https://cdn.dexscreener.com/fetch?src=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F6319%2Flarge%2Fusdc.png%3F1696506694",
};

const MFERTokenMainnet: Token = {
  address: "0xE3086852A4B125803C815a158249ae468A3254Ca",
  chainId: 8453,
  decimals: 18,
  name: "mfercoin",
  symbol: "$mfer",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0xe3086852a4b125803c815a158249ae468a3254ca.png?size=lg&key=df6600",
};

// 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

// An array containing all tokens
const tokens: Token[] = [
  WETHToken,
  WETHBaseToken,
  USDCToken,
  USDCTokenMainnet,
  MFERTokenMainnet,
];

export function getTokensByChainId(chainId: number): Token[] {
  return tokens.filter((token) => token.chainId === chainId);
}

export function getFinalTokenByChainId(chainId: number): Token {
  if (chainId === 8453) {
    return BUILDTokenMainnet;
  } else {
    return BUILDToken;
  }
}

export function getDefaultDepositTokenByChainId(chainId: number): Token {
  if (chainId === 8453) {
    return WETHBaseToken;
  } else {
    return WETHToken;
  }
}
