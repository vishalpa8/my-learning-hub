import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // 1. Import BrowserRouter
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Wrap App and add the basename */}
    <BrowserRouter basename="/my-learning-hub/">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
