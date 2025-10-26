// /src/hooks/useImageBBHostingService.js
import { useCallback, useState } from "react";

/**
 * Super-simple imgBB upload hook (Create React App).
 *
 * Usage:
 * const { upload, uploading, error, lastUrl } = useImageBBHostingService();
 * const url = await upload(file);
 *
 * Reads API key from: process.env.REACT_APP_IMGBB_API_KEY
 */
export default function useImageBBHostingService(customKey) {
  const API_KEY = customKey || process.env.REACT_APP_IMGBB_API_KEY;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUrl, setLastUrl] = useState(null);

  const upload = useCallback(
    async (file) => {
      if (!API_KEY) {
        const msg = "Missing imgBB API key (REACT_APP_IMGBB_API_KEY).";
        setError(msg);
        throw new Error(msg);
      }
      if (!file) return null;

      setUploading(true);
      setError(null);
      setLastUrl(null);

      const form = new FormData();
      form.append("key", API_KEY);
      form.append("image", file);

      try {
        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: form,
        });

        const json = await res.json();
        if (!json?.success) {
          const msg = json?.error?.message || "Upload failed.";
          setError(msg);
          throw new Error(msg);
        }

        const url = json?.data?.url || json?.data?.display_url;
        setLastUrl(url);
        return url;
      } catch (e) {
        setError(e.message || "Upload failed.");
        throw e;
      } finally {
        setUploading(false);
      }
    },
    [API_KEY]
  );

  return { upload, uploading, error, lastUrl };
}