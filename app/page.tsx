"use client";
import { useEffect } from "react";

import CustomTab from "./components/Tabs";
import { useFetchDeposits } from "./hooks/useFetchDeposits";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  const deposits = useFetchDeposits();

  useEffect(() => {
    console.log("deposits: ", deposits);
  }, [deposits]);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="flex flex-col md:flex-row justify-center items-start gap-4">
        <CustomTab />
        <Card className="w-[400px] h-[300px] overflow-scroll scroll-m-0">
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
                  .sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber))
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
  );
}
