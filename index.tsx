
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const initApp = () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error("Could not find root element to mount to");
      return;
    }

    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application failed to start:", error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style="padding: 40px; text-align: center; font-family: serif;">
        <h2>The gallery is currently resting.</h2>
        <p>Please check the console for details or refresh the page.</p>
      </div>`;
    }
  }
};

// Ensure DOM is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
