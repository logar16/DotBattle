import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@radix-ui/themes/styles.css";
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {(theme, toggleTheme) => (
        <App theme={theme} onToggleTheme={toggleTheme} />
      )}
    </ThemeProvider>
  </StrictMode>,
);
