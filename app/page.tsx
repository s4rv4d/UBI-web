"use client";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CustomTab from "./components/Tabs";
import { useFetchDeposits } from "./hooks/useFetchDeposits";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import sdk from "@farcaster/frame-sdk";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const deposits = useFetchDeposits();

  useEffect(() => {
    console.log("deposits: ", deposits);
  }, [deposits]);

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
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-52 md:mt-0">
          <CustomTab />
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
                      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
                    )
                    .map((deposit) => (
                      <TableRow key={deposit.id}>
                        <TableCell className="font-medium">
                          {`${deposit.depositor.slice(
                            0,
                            4
                          )}...${deposit.depositor.slice(-4)}`}
                        </TableCell>
                        <TableCell className="text-right">
                          {deposit.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
