import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: ${props => props.theme.palette.background.default};
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  /* ... resto dos estilos ... */
`; 