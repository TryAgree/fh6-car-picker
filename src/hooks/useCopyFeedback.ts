import { useCallback, useEffect, useRef, useState } from "react";

const FEEDBACK_DURATION_MS = 1500;

export function useCopyFeedback() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      clearTimeout(timeoutRef.current);
      setCopiedText(text);
      timeoutRef.current = setTimeout(() => setCopiedText(null), FEEDBACK_DURATION_MS);
    });
  }, []);

  return { copiedText, copy };
}
