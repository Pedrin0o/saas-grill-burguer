"use client";

import { useEffect, useState } from "react";

type AnimatedNumberProps = {
  value: number;
  duration?: number;
};

export function AnimatedNumber({ value, duration = 700 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
}