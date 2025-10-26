import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetches a random sales-style quote from DummyJSON.
 * API: https://dummyjson.com/quotes/random
 */
export default function useSalesQuote() {
  const [quote, setQuote] = useState(null); // { quote, author }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError("");
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("https://dummyjson.com/quotes/random", {
        signal: abortRef.current.signal,
        headers: { "Accept": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to load quote.");
      const data = await res.json();
      // Normalize fields we care about
      setQuote({ text: data?.quote || "", author: data?.author || "Unknown" });
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Failed to load quote.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
    return () => abortRef.current?.abort();
  }, [fetchQuote]);

  return {
    quote,
    loading,
    error,
    regenerate: fetchQuote,
  };
}
