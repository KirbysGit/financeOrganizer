// main.jsx

// Imports.
import App from './App.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Local Imports.
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles.js';
import { theme } from './styles/theme';
import './styles/fonts.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="821931060546-3vdq51nh4dfej7cj7ls3ro3l5tplmdvh.apps.googleusercontent.com">
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <App />
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
