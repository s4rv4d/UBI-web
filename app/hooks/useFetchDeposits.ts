"use client";
import { useState, useEffect } from "react";

import { v4 as uuidv4 } from "uuid";
import { useWatchContractEvent, useReadContract } from "wagmi";
import { ethers, FallbackProvider, JsonRpcProvider } from "ethers";
import UBISwapper from "../abi/UBISwapper.json";
import ERC20 from "../abi/ERC20.json";
import { Address } from "viem";
import { useClient } from "wagmi";
import { fetchConfig, config } from "../config/config";
import type { Client, Chain, Transport } from "viem";

type DepositedEvent = {
  depositor: string;
  amount: string; // formatted ether string
  blockNumber: bigint;
  id: string;
};

function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback") {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) => new JsonRpcProvider(value?.url, network)
    );
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

export function useFetchDeposits() {
  const [deposits, setDeposits] = useState<DepositedEvent[]>([]);

  const client = useClient({
    config: fetchConfig,
  });

  const erc20Abi = ["function balanceOf(address owner) view returns (uint256)"];

  useEffect(() => {
    const provider = clientToProvider(client);

    async function fetchHistoricalEvents() {
      try {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_ubiswapper as string,
          UBISwapper.abi,
          provider
        );
        const filter = contract.filters.Deposited();
        const historicalEvents = await contract.queryFilter(
          filter,
          0,
          "latest"
        );

        // console.log("historical events: ", historicalEvents);
        const formatted: DepositedEvent[] = historicalEvents.map((event) => {
          // event.args is an array (or object) containing the event parameters.
          // Adjust indices or property names based on your ABI.

          let depositor: string = "unknown";
          let amount: bigint = 0n;
          if ("args" in event && event.args && event.args[0]) {
            depositor = event.args[0];
          }

          if ("args" in event && event.args && event.args[1]) {
            amount = event.args[1];
          }

          return {
            depositor: depositor,
            amount: ethers.formatEther(amount),
            blockNumber: event.blockNumber,
            id: uuidv4(),
          };
        });

        setDeposits(formatted);
      } catch (error) {
        console.error("Error fetching historical events:", error);
      }
    }

    fetchHistoricalEvents();
  }, [client]);

  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ubiswapper as Address,
    abi: UBISwapper.abi,
    eventName: "Deposited",
    onLogs(logs) {
      //   console.log("New logs!", logs);

      logs.forEach((log) => {
        console.log(log);

        let depositor: string = "unknown";
        let amount: bigint = 0n;
        if ("args" in log && log.args && log.args.sender_) {
          depositor = log.args.sender_;
        }

        if ("args" in log && log.args && log.args.amount_) {
          amount = log.args.amount_;
        }
        const newEvent: DepositedEvent = {
          depositor: depositor,
          amount: ethers.formatEther(amount),
          blockNumber: log.blockNumber as bigint,
          id: uuidv4(),
        };

        setDeposits((prev) => [...prev, newEvent]);
      });
    },
    config,
  });

  const { data: poolBalance, error: balError } = useReadContract({
    address: process.env.NEXT_PUBLIC_buildToken as Address,
    abi: ERC20.abi,
    functionName: "balanceOf",
    args: [process.env.NEXT_PUBLIC_splitProxy as Address],
    config,
  });

  console.log(balError);
  console.log(poolBalance);

  return { deposits, poolBalance };
}
