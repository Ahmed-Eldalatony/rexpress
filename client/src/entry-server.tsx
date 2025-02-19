// src/entry-server.jsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

import App from './App';
export function render(url, context = {}) {
  let PageComponent;

  // Use Express routing logic to decide which component to render
  switch (url) {
    case '/':
      PageComponent = HomePage;
      break;
    case '/about':
      PageComponent = AboutPage;
      break;
    default:
      // For any route not explicitly handled, set a 404 status.
      context.status = 404;
      PageComponent = NotFoundPage;
      break;
  }

  // Render the selected component to an HTML string
  return renderToString(<App />);
}
