"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CustomTab from "./components/Tabs";
import { useFetchDeposits } from "./hooks/useFetchDeposits";
import { formatUnits } from "viem";
import { formatNumber } from "@/utils/amountFormatter";
import TableCellView from "./components/swap/TableCellView";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import sdk from "@farcaster/frame-sdk";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mounted, setMounted] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { deposits, poolBalance } = useFetchDeposits();

  useEffect(() => {
    console.log("deposits: ", deposits, " balance: ", poolBalance);
  }, [deposits, poolBalance]);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Tell the parent Farcaster client that our frame is ready
        await sdk.actions.ready();
        setIsSDKLoaded(true);
      } catch (error) {
        console.error("Failed to initialize Frame SDK:", error);
      }
    };

    if (!isSDKLoaded) {
      initializeSDK();
    }
  }, [isSDKLoaded]);

  // Wait for component to mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Navbar />
      <div className="h-screen w-screen flex flex-col justify-center items-center ock-font-family">
        <div className="flex flex-col md:flex-row justify-center items-center gap-9 md:gap-4 mt-52 md:mt-0">
          <CustomTab />
          <div className="flex flex-col justify-center items-center gap-7 md:gap-5">
            <div className="flex flex-col justify-center items-center">
              <span className="font-light text-md">Total Donated</span>
              <div className="flex flex-row justify-center items-center gap-2">
                <span className="font-semibold text-5xl">
                  {formatNumber(
                    parseFloat(
                      formatUnits(
                        poolBalance ? (poolBalance as bigint) : 0n,
                        18
                      )
                    )
                  )}
                </span>
                <span className="font-light">BUILD</span>
              </div>
            </div>
            <Card className="w-[350px] md:w-[400px] h-[300px] overflow-scroll scroll-m-0">
              <CardContent className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Depositer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deposits
                      .sort(
                        (a, b) => Number(b.blockNumber) - Number(a.blockNumber)
                      )
                      .map((deposit) => (
                        <TableCellView
                          key={deposit.id}
                          depositor={deposit.depositor}
                          amount={deposit.amount}
                          blockNumber={deposit.blockNumber}
                          id={deposit.id}
                        />
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

//ENV VARS CHAIN ID
