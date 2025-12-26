import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ThemeProvider as AppThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { createTheme, ThemeProvider as FlowbiteThemeProvider } from 'flowbite-react'

const theme = createTheme({
  button: {
    color: {
      primary: "bg-primary-600 hover:bg-primary-700 text-white",
    },
    outlineColor: {
      primary: "border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-300",
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FlowbiteThemeProvider theme={theme}>
      <AppThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppThemeProvider>
    </FlowbiteThemeProvider>
  </React.StrictMode>
)
