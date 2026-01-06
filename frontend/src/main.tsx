import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import '@/index.css'
import { ThemeProvider as AppThemeProvider } from '@context/ThemeContext'
import { AuthProvider } from '@context/AuthContext'
import { SocketProvider } from '@context/SocketContext'
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
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <FlowbiteThemeProvider theme={theme}>
      <AppThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </AppThemeProvider>
    </FlowbiteThemeProvider>
  </BrowserRouter>
)
