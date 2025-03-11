import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  document.body.innerHTML = `<div style="color:red; padding:20px;">
    <h1>Erreur durant le chargement:</h1>
    <pre>${error.message}</pre>
  </div>`;
  console.error(error);
}
