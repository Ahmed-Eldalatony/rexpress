
// src/entry-client.jsx
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  let PageComponent;

  // Use the browser's current location to decide which component to render.
  // This must match the logic in your SSR code.
  switch (window.location.pathname) {
    case '/':
      PageComponent = HomePage;
      break;
    case '/about':
      PageComponent = AboutPage;
      break;
    default:
      PageComponent = NotFoundPage;
      break;
  }

  return <PageComponent />;
}

// Hydrate the server-rendered markup (the SSR output in the div#root)
hydrateRoot(document.getElementById('root'), <App />);
