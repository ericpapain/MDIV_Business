import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[12px] border border-[#D9D9D9] dark:border-slate-700 bg-white dark:bg-slate-900/90 px-4 py-3 text-base md:text-sm font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 shadow-sm transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50/40 dark:hover:bg-slate-800/40 focus-visible:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/15 dark:focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
