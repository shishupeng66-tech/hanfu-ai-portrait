
"use client";
import { useEffect, useRef } from "react";

interface TurnstileProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onSuccess, onError, onExpire }: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !ref.current) return;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.turnstile && ref.current) {
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: onSuccess,
          "error-callback": onError,
          "expired-callback": onExpire,
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [onSuccess, onError, onExpire]);

  return <div ref={ref} />;
}
