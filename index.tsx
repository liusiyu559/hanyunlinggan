import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application failed to start:", error);
  // Fallback UI for critical errors
  document.body.innerHTML = `
    <div style="padding: 2rem; font-family: sans-serif; color: #8b3a3a; background: #f0e7d8; min-height: 100vh;">
      <h1 style="font-size: 1.5rem; margin-bottom: 1rem;">应用启动失败 (Application Failed to Start)</h1>
      <pre style="background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
      <p style="margin-top: 1rem;">Please check the console for more details.</p>
    </div>
  `;
}