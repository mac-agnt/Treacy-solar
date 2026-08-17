"use client";

import { useEffect, useState } from "react";

// Brief skeleton pass on mount so every module shows the shared loading state
// before its (mock) data resolves — matches the .skeleton shimmer pattern.
export function useSimulatedLoad(ms = 450): boolean {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms]);
  return loading;
}
