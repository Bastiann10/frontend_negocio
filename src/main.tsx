import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './core/providers/ThemeProvider'
import { LogoProvider } from './core/providers/LogoProvider'
import { PrecisionProvider } from './core/providers/PrecisionProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogoProvider>
      <ThemeProvider>
        <PrecisionProvider>
          <App />
        </PrecisionProvider>
      </ThemeProvider>
    </LogoProvider>
  </StrictMode>,
)
