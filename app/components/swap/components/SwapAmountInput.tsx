/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
} from "react";
import { useValue } from "../hooks/useValue";
import { getRoundedAmount } from "../utils/getRoundedAmount";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import type { SwapAmountInputReact } from "../types";
import { formatAmount } from "../utils/formatTokenAmount";
import { useSwapContext } from "../provider/SwapProvider";
import { TokenChip, TokenSelectDropdown } from "@coinbase/onchainkit/token";
import {
  background,
  border,
  cn,
  color,
  pressable,
  text,
} from "@coinbase/onchainkit/theme";
import { Token } from "@/types/tokenType";

function isValidAmount(value: string) {
  if (value === "") {
    return true;
  }
  const regex = /^[0-9]*\.?[0-9]*$/;
  return regex.test(value);
}

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

export function SwapAmountInput({
  className,
  delayMs = 1000,
  label,
  token,
  type,
  swappableTokens,
}: SwapAmountInputReact) {
  const { address, to, from, handleAmountChange } = useSwapContext();
  const source = useValue(type === "from" ? from : to);
  const destination = useValue(type === "from" ? to : from);

  useEffect(() => {
    if (token) {
      source.setToken?.(token);
    }
  }, [token, source.setToken]);

  const handleMaxButtonClick = useCallback(() => {
    if (!source.balance) {
      return;
    }
    source.setAmount(source.balance);
    handleAmountChange(type, source.balance);
  }, [source.balance, source.setAmount, handleAmountChange, type]);

  const handleChange = useCallback(
    (amount: string) => {
      handleAmountChange(type, amount);
    },
    [handleAmountChange, type]
  );

  const handleSetToken = useCallback(
    (token: any) => {
      source.setToken?.(token);
      handleAmountChange(type, source.amount, token);
    },
    [source.amount, source.setToken, handleAmountChange, type]
  );

  // We are mocking the token selectors so I'm not able
  // to test this since the components aren't actually rendering
  const sourceTokenOptions = useMemo(() => {
    return (
      swappableTokens?.filter(
        ({ symbol }: Token) => symbol !== destination.token?.symbol
      ) ?? []
    );
  }, [swappableTokens, destination.token]);

  const hasInsufficientBalance =
    type === "from" && Number(source.balance) < Number(source.amount);

  const formatUSD = (amount: string) => {
    if (!amount || amount === "0") {
      return null;
    }
    const roundedAmount = Number(getRoundedAmount(amount, 2));
    return `~$${roundedAmount.toFixed(2)}`;
  };

  return (
    <div
      className={cn(
        background.secondary,
        border.radius,
        "box-border flex h-[148px] w-full flex-col items-start p-4",
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn(text.label2, color.foregroundMuted)}>{label}</span>
      </div>
      <div className="flex w-full items-center justify-between">
        <TextInput
          className={cn(
            "mr-2 w-full border-[none] bg-transparent font-display text-[2.5rem]",
            "leading-none outline-none",
            hasInsufficientBalance && address ? color.error : color.foreground
          )}
          placeholder="0.0"
          delayMs={delayMs}
          value={formatAmount(source.amount)}
          setValue={source.setAmount}
          disabled={source.loading}
          onChange={handleChange}
          inputValidator={isValidAmount}
        />
        {sourceTokenOptions.length > 0 ? (
          <TokenSelectDropdown
            token={source.token}
            setToken={handleSetToken}
            options={sourceTokenOptions}
          />
        ) : (
          source.token && (
            <TokenChip className={pressable.inverse} token={source.token} />
          )
        )}
      </div>
      <div className="mt-4 flex w-full justify-between">
        <div className="flex items-center">
          <span className={cn(text.label2, color.foregroundMuted)}>
            {formatUSD(source.amountUSD)}
          </span>
        </div>
        <span className={cn(text.label2, color.foregroundMuted)}>{""}</span>
        <div className="flex items-center">
          {source.balance && (
            <span
              className={cn(text.label2, color.foregroundMuted)}
            >{`Balance: ${getRoundedAmount(source.balance, 8)}`}</span>
          )}
          {type === "from" && address && (
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center px-2 py-1"
              onClick={handleMaxButtonClick}
            >
              <span className={cn(text.label1, color.primary)}>Max</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
