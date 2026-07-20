"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    console.error("GLOBAL ERROR:", error);
  }, [error]);
  return <div>
    <h2>GLOBAL ERROR</h2>
    <pre>{error.message}</pre>
    <pre>{error.stack}</pre>
  </div>;
}
