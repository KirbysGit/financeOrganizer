import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-family: 'Inter', sans-serif;
  }

  #root {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100vh;
  }
`;