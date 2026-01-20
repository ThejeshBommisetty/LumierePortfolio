
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Mounting Error:", error);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; font-family: serif; text-align: center;">
        <div>
          <h2 style="font-weight: normal; font-size: 24px;">The gallery is temporarily unavailable.</h2>
          <p style="color: #999; font-size: 12px; margin-top: 10px; text-transform: uppercase; letter-spacing: 0.1em;">Error: Unable to initialize view</p>
        </div>
      </div>
    `;
  }
} else {
  console.error("Critical Error: #root element not found in DOM.");
}
