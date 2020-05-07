import red from '@material-ui/core/colors/red';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#4561f3',
    },
    secondary: {
      main: '#ef4d55',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

export default theme;

/**
 * primary: '#4561f3',
        secondary: '#ef4d55',
        blue: '#4561f3',
        accent: '#4561f3'
 */