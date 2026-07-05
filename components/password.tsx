import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

type PasswordProps = React.InputHTMLAttributes<HTMLInputElement>;

const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ className, type, ...props }, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : type ?? "password"}
        ref={ref}
        className={cn(
          "block w-full rounded-md border-0 bg-input px-4 pr-10 py-1.5 text-foreground shadow-aceternity placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
          className
        )}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        onClick={() => setShow((value) => !value)}
      >
        {show ? (
          <EyeOffIcon className="h-4 cursor-pointer" />
        ) : (
          <EyeIcon className="h-4 cursor-pointer" />
        )}
      </button>
    </div>
  );
});

Password.displayName = "Password";

export default Password;
