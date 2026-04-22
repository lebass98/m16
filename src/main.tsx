import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: { main: '#066cb3' },
    secondary: { main: '#333' },
  },
  typography: {
    fontFamily: [
      'Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont',
      'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI',
      'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif',
    ].join(','),
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: 13 },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
