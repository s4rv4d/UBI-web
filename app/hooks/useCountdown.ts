/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

export const useCountdown = (targetTimestamp: number): string => {
  // Convert the input timestamp (seconds) to milliseconds.
  const targetTime = targetTimestamp * 1000;

  // Helper function to calculate the remaining time (in ms).
  const calculateTimeLeft = () => targetTime - Date.now();

  // State to hold the remaining time in milliseconds.
  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft());

  useEffect(() => {
    // Set an interval to update the time left every second.
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Cleanup interval on unmount.
    return () => clearInterval(intervalId);
  }, [targetTime]);

  // If the target time has passed, return a completion message.
  if (timeLeft <= 0) {
    return "00:00:00:00";
  }

  // Calculate days, hours, minutes, and seconds.
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // Helper function to pad numbers to two digits.
  const padNumber = (num: number): string => num.toString().padStart(2, "0");

  return `${padNumber(days)}:${padNumber(hours)}:${padNumber(
    minutes
  )}:${padNumber(seconds)}`;
};
