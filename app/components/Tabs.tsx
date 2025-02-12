/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ChangeEvent, InputHTMLAttributes } from "react";

import {
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function isValidAmount(value: string) {
  if (value === "") {
    return true;
  }
  const regex = /^[0-9]*\.?[0-9]*$/;
  return regex.test(value);
}

const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  let timer: number | NodeJS.Timeout;

  const debounce = (
    func: (...args: any[]) => void,
    delayMs: number,
    ...args: any[]
  ) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delayMs);
  };

  return useMemo(() => {
    return (...args: any) => {
      return debounce(callbackRef.current, delay, ...args);
    };
  }, [delay]);
};

type TextInputReact = {
  "aria-label"?: string;
  className: string;
  delayMs: number;
  disabled?: boolean;
  // specify 'decimal' to trigger numeric keyboards on mobile devices
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: () => void;
  onChange: (s: string) => void;
  placeholder: string;
  setValue: (s: string) => void;
  value: string;
  inputValidator?: (s: string) => boolean;
};

function formatTokenAmount(amount: string, decimals: number) {
  // Convert the string amount to a number using decimals value
  const numberAmount = Number(amount) / 10 ** decimals;
  return numberAmount.toString();
}

function formatAmount(num: string): string {
  // If the number is not in scientific notation return it as it is
  if (!/\d+\.?\d*e[+-]*\d+/i.test(num)) {
    return num;
  }

  // Parse into coefficient and exponent
  const [coefficient, exponent] = num.toLowerCase().split("e");
  const exp = Number.parseInt(exponent);

  // Split coefficient into integer and decimal parts
  const [intPart, decPart = ""] = coefficient.split(".");

  // Combine integer and decimal parts
  const fullNumber = intPart + decPart;

  // Calculate the new decimal point position
  const newPosition = intPart.length + exp;

  if (newPosition <= 0) {
    // If the new position is less than or equal to 0, we need to add leading zeros
    return `0.${"0".repeat(Math.abs(newPosition))}${fullNumber}`;
  }

  if (newPosition >= fullNumber.length) {
    // If the new position is greater than the number length, we need to add trailing zeros
    return fullNumber + "0".repeat(newPosition - fullNumber.length);
  }

  // Otherwise, we insert the decimal point at the new position
  return `${fullNumber.slice(0, newPosition)}.${fullNumber.slice(newPosition)}`;
}

function TextInput({
  "aria-label": ariaLabel,
  className,
  delayMs,
  disabled = false,
  onBlur,
  onChange,
  placeholder,
  setValue,
  inputMode,
  value,
  inputValidator = () => true,
}: TextInputReact) {
  const handleDebounce = useDebounce((value) => {
    onChange(value);
  }, delayMs);

  const handleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value;

      if (inputValidator(value)) {
        setValue(value);
        if (delayMs > 0) {
          handleDebounce(value);
        } else {
          onChange(value);
        }
      }
    },
    [onChange, handleDebounce, delayMs, setValue, inputValidator]
  );

  return (
    <input
      aria-label={ariaLabel}
      data-testid="ockTextInput_Input"
      type="text"
      className={className}
      inputMode={inputMode}
      placeholder={placeholder}
      value={value}
      onBlur={onBlur}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}

function CustomTab() {
  return (
    <Tabs defaultValue="donate" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="donate">Donate</TabsTrigger>
        <TabsTrigger value="claim">Claim</TabsTrigger>
      </TabsList>
      <TabsContent value="donate">
        <Card>
          <CardHeader>
            <CardTitle>Donate ETH/ERC20</CardTitle>
            <CardDescription>Donate to the cause LOl</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <TextInput
                className={cn(
                  "mr-2 w-full  bg-transparent font-display text-[2.5rem] border border-input",
                  "leading-none outline-none"
                  //   hasInsufficientBalance && address
                  //     ? color.error
                  //     : color.foreground
                )}
                placeholder="0.0"
                delayMs={1000}
                value={formatAmount("0")}
                setValue={() => {}}
                disabled={false}
                onChange={() => {}}
                inputValidator={isValidAmount}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="claim">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged
              out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm">Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default CustomTab;
