import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './ThemeContext.tsx'
import { PaymentMethodsProvider } from './PaymentMethodsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <PaymentMethodsProvider>
        <App />
      </PaymentMethodsProvider>
    </ThemeProvider>
  </StrictMode>,
)
