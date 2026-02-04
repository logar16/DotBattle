import { useState, type ReactNode } from "react";
import { Theme } from "@radix-ui/themes";

type ThemeProviderProps = {
  children: (theme: "light" | "dark", toggleTheme: () => void) => ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("dotbattle.theme");
    return stored === "light" || stored === "dark" ? stored : "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("dotbattle.theme", next);
      return next;
    });
  };

  return (
    <Theme
      appearance={theme}
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      scaling="95%"
    >
      {children(theme, toggleTheme)}
    </Theme>
  );
}
