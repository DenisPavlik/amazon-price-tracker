"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-popover text-popover-foreground border border-border/70 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm",
          title: "font-medium",
          description: "text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:opacity-90 rounded-md",
          cancelButton:
            "bg-muted text-muted-foreground hover:opacity-90 rounded-md",
          success: "[--toast-icon:var(--chart-green)]",
          error: "[--toast-icon:var(--chart-red)]",
          warning: "[--toast-icon:var(--chart-orange)]",
          info: "[--toast-icon:var(--primary)]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--popover-foreground)",
          "--success-border": "color-mix(in oklch, var(--chart-green) 35%, var(--border))",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--popover-foreground)",
          "--error-border": "color-mix(in oklch, var(--chart-red) 35%, var(--border))",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
