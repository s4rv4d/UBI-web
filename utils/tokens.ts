import { Token } from "@/types/tokenType";

// TESTNET
const WETHToken: Token = {
  address: "0x4200000000000000000000000000000000000006",
  chainId: 84532,
  decimals: 18,
  name: "Ethereum",
  symbol: "ETH",
  image:
    "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  fee: 3000n,
};

const USDCToken: Token = {
  address: "0x2C0891219AE6f6adC9BE178019957B4743e5e790",
  chainId: 84532,
  decimals: 18,
  name: "USDC",
  symbol: "USDC",
  image:
    "https://cdn.dexscreener.com/fetch?src=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F6319%2Flarge%2Fusdc.png%3F1696506694",
  fee: 3000n,
};

const BUILDToken: Token = {
  address: "0xDBeE0FA9120300b03D9857954f067be95cf31597",
  chainId: 84532,
  decimals: 18,
  name: "BUILD",
  symbol: "BUILD",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x3c281a39944a2319aa653d81cfd93ca10983d234.png?size=lg&key=c95e46",
  fee: 3000n,
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
  fee: 3000n,
};

const BUILDTokenMainnet: Token = {
  address: "0x3C281A39944a2319aA653D81Cfd93Ca10983D234",
  chainId: 8453,
  decimals: 18,
  name: "BUILD",
  symbol: "BUILD",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x3c281a39944a2319aa653d81cfd93ca10983d234.png?size=lg&key=c95e46",
  fee: 10000n,
};

const USDCTokenMainnet: Token = {
  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  chainId: 8453,
  decimals: 6,
  name: "USDC",
  symbol: "USDC",
  image:
    "https://cdn.dexscreener.com/fetch?src=https%3A%2F%2Fcoin-images.coingecko.com%2Fcoins%2Fimages%2F6319%2Flarge%2Fusdc.png%3F1696506694",
  fee: 500n,
};

const talentTokenMainnet: Token = {
  address: "0x9a33406165f562E16C3abD82fd1185482E01b49a",
  chainId: 8453,
  decimals: 18,
  name: "TalentProtocolToken",
  symbol: "$TALENT",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x9a33406165f562e16c3abd82fd1185482e01b49a.png?size=lg&key=381e75",
  fee: 10000n,
};

const higherTokenMainnet: Token = {
  address: "0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe",
  chainId: 8453,
  decimals: 18,
  name: "higher",
  symbol: "HIGHER",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x0578d8a44db98b23bf096a382e016e29a5ce0ffe.png?size=lg&key=53aa1f",
  fee: 10000n,
};

const degenTokenMainnet: Token = {
  address: "0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed",
  chainId: 8453,
  decimals: 18,
  name: "Degen",
  symbol: "DEGEN",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x4ed4e862860bed51a9570b96d89af5e1b0efefed.png?size=lg&key=ac292c",
  fee: 3000n,
};

const moxieTokenMainnet: Token = {
  address: "0x8C9037D1Ef5c6D1f6816278C7AAF5491d24CD527",
  chainId: 8453,
  decimals: 18,
  name: "Moxie",
  symbol: "MOXIE",
  image:
    "https://dd.dexscreener.com/ds-data/tokens/base/0x8c9037d1ef5c6d1f6816278c7aaf5491d24cd527.png?size=lg&key=ccceba",
  fee: 3000n,
};

// An array containing all tokens
const tokens: Token[] = [
  WETHToken,
  WETHBaseToken,
  USDCToken,
  USDCTokenMainnet,
  talentTokenMainnet,
  degenTokenMainnet,
  moxieTokenMainnet,
  higherTokenMainnet,
  BUILDToken,
  BUILDTokenMainnet,
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
