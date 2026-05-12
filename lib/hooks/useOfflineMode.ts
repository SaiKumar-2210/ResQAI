"use client";

import { useEffect, useState } from "react";

export function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    function update() {
      setIsOffline(!navigator.onLine);
    }

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return { isOffline };
}
