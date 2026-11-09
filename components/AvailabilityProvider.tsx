"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AvailabilityResponse } from "@/lib/types";

type Ctx = { data: AvailabilityResponse | null; refresh: () => Promise<void> };
const AvailabilityContext = createContext<Ctx>({ data: null, refresh: async () => {} });
export const useAvailability = () => useContext(AvailabilityContext);

export function AvailabilityProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AvailabilityResponse | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/availability", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {
      /* mantém o último estado */
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000); // pega reservas feitas em outras abas/aparelhos
    return () => clearInterval(t);
  }, [refresh]);

  return <AvailabilityContext.Provider value={{ data, refresh }}>{children}</AvailabilityContext.Provider>;
}
