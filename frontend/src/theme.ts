import { createTheme } from '@mui/material/styles';

// Create a theme instance with Inter font
const theme = createTheme({
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    h4: {
      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      fontWeight: 600,
      fontSize: '2.125rem',
      lineHeight: 1.235,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 300 700;
          font-display: swap;
        }
        body {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
      `,
    },
    MuiTypography: {
      styleOverrides: {
        h4: {
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;