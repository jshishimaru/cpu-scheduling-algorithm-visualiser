import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Make sure this import comes before App import
import './index.css'
import App from './App'

// Force a style reload by adding a key to the StrictMode component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
