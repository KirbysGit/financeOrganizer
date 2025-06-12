import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles.js';
import { theme } from './styles/theme';
import './styles/fonts.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
