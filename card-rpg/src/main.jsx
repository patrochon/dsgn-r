import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import MapPreview from './MapPreview.jsx'

const isPreview = new URLSearchParams(location.search).get('preview') === '1'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPreview ? <MapPreview /> : <App />}
  </StrictMode>,
)
