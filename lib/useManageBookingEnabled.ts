"use client";

import { useEffect, useState } from "react";

export function useManageBookingEnabled(shouldCheck = true) {
  const [manageBookingEnabled, setManageBookingEnabled] = useState(false);

  useEffect(() => {
    if (!shouldCheck) return;
    const controller = new AbortController();

    async function loadManageBookingStatus() {
      try {
        const response = await fetch("/api/mmb/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        const status = response.ok ? await response.json() : null;
        if (!controller.signal.aborted) setManageBookingEnabled(status?.enabled === true);
      } catch {
        if (!controller.signal.aborted) setManageBookingEnabled(false);
      }
    }

    void loadManageBookingStatus();
    return () => controller.abort();
  }, [shouldCheck]);

  return shouldCheck && manageBookingEnabled;
}
