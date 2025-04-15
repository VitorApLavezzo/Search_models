import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from './styles/GlobalStyles';
import theme from './styles/theme';
import App from './App.jsx';  // Note a extensão .jsx aqui
import styled from 'styled-components';
import { Container } from '@mui/material';

const container = document.getElementById('root');
const root = createRoot(container);

const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    minHeight: 'calc(100vh - 64px)', // altura da viewport menos a altura da AppBar
    backgroundColor: '#f5f5f5',
    overflow: 'hidden' // previne rolagem horizontal
}));

root.render(
    <React.StrictMode>
        <MuiThemeProvider theme={theme}>
            <StyledThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles />
                <App />
            </StyledThemeProvider>
        </MuiThemeProvider>
    </React.StrictMode>
); 