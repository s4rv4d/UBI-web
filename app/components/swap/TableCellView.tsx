"use client";
import React, { useEffect, useState } from "react";
import { getName } from "@coinbase/onchainkit/identity";
import { base } from "viem/chains";
import { Address } from "viem";
import { formatNumber } from "@/utils/amountFormatter";

import { TableCell, TableRow } from "@/components/ui/table";

type DepositedEvent = {
  depositor: string;
  amount: string; // formatted ether string
  blockNumber: bigint;
  id: string;
};

const TableCellView: React.FC<DepositedEvent> = ({ depositor, amount, id }) => {
  const [ensName, setEnsName] = useState<string>(
    `${depositor.slice(0, 4)}...${depositor.slice(-4)}`
  );

  useEffect(() => {
    const fetch = async () => {
      const name = await getName({
        address: depositor as Address,
        chain: base,
      });

      setEnsName(name || `${depositor.slice(0, 4)}...${depositor.slice(-4)}`);
    };

    fetch();
  }, [id, depositor]);

  return (
    <TableRow>
      <TableCell className="font-medium">{ensName}</TableCell>
      <TableCell className="text-right">
        {formatNumber(parseFloat(amount))}
      </TableCell>
    </TableRow>
  );
};

export default React.memo(TableCellView);
