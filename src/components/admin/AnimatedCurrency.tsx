"use client";

import { useEffect, useState } from "react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

type AnimatedCurrencyProps = {
  cents: number;
  duration?: number;
};

export function AnimatedCurrency({ cents, duration = 700 }: AnimatedCurrencyProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    function step(timestamp: number) {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * cents));
      if (progress < 1) raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [cents, duration]);

  return <>{formatCurrency(display)}</>;
}