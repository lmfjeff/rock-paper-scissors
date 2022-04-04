import { ColorModeScript } from '@chakra-ui/react';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AuthProvider } from './firebase/context';
import reportWebVitals from './reportWebVitals';

// auth provider: react context for storing user

ReactDOM.render(
  <StrictMode>
    <AuthProvider>
      <ColorModeScript />
      <App />
    </AuthProvider>
  </StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
