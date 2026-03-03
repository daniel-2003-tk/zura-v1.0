"use client";

import { useEffect, useState } from "react";

export function AnimatedCounter({ value, isCurrency = false }: { value: number, isCurrency?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 segundo de animação
    const increment = value / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  if (isCurrency) {
    return <>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(count)}</>;
  }

  return <>{Math.floor(count)}</>;
}